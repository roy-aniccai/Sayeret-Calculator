/// <reference types="vite/client" />
import { auth } from '../src/firebase';
import { PostSubmissionAction, SimulationResult } from '../types/analytics';
import {
    withRobustExecution,
    apiCircuitBreaker
} from './retryUtils';

// Use environment variable with fallback for Jest compatibility
const isProduction = process.env.NODE_ENV === 'production';
const API_BASE_URL = isProduction ? '/api' : 'https://us-central1-mortgage-85413.cloudfunctions.net/api';
const ADMIN_API_BASE_URL = isProduction ? '/api/admin' : 'https://us-central1-mortgage-85413.cloudfunctions.net/adminApi';

// ============================================================================
// SUBMISSION PAYLOAD
// ============================================================================

export interface SubmissionPayload {
    // Identity
    sessionId: string;
    leadName: string;
    leadPhone: string;

    // Financial data
    mortgageBalance: number;
    otherLoansBalance: number;
    mortgagePayment: number;
    otherLoansPayment: number;
    propertyValue: number;
    age: number | null;

    // Simulation result
    simulationResult: SimulationResult | null;

    // Flags
    interestedInInsurance?: boolean;

    // UTM tracking
    utmParams?: Record<string, string>;

    // Metadata
    device: 'mobile' | 'desktop';
    createdAt: string;
}

// ============================================================================
// SUBMISSION FUNCTIONS
// ============================================================================

/**
 * Submit calculator data to backend.
 * Sends a clean, flat payload — no lead scoring or profile decoration.
 */
export const submitData = async (data: Partial<SubmissionPayload>) => {
    return withRobustExecution(
        async () => {
            const device = window.innerWidth <= 768 ? 'mobile' : 'desktop';
            const payload: Partial<SubmissionPayload> = {
                ...data,
                device: data.device || device,
                createdAt: data.createdAt || new Date().toISOString(),
            };

            console.log(`Submitting data to ${API_BASE_URL}/submit`, payload);

            const response = await fetch(`${API_BASE_URL}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to submit data: ${response.status} ${response.statusText} - ${errorText}`);
            }

            const result = await response.json();

            // Track submission event (best-effort)
            try {
                await trackEvent(
                    data.sessionId || 'unknown',
                    'form_submit',
                    { submissionId: result.id }
                );
            } catch (trackingError) {
                console.warn('Failed to track submission event:', trackingError);
            }

            return { id: result.id, ...result };
        },
        {
            circuitBreaker: apiCircuitBreaker,
            timeoutMs: 15000,
            operationName: 'submit_data'
        }
    ).catch(async (error) => {
        console.error('CRITICAL: Submission failed after all retries.', error);

        // Track error (best effort, no retry)
        try {
            await fetch(`${API_BASE_URL}/event`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: data.sessionId || 'unknown',
                    eventType: 'api_error',
                    eventData: {
                        error: error instanceof Error ? error.message : 'Unknown error',
                        operation: 'submit_data',
                        timestamp: new Date().toISOString()
                    }
                })
            });
        } catch {
            // Silently ignore tracking failures
        }

        throw error;
    });
};

/**
 * Update an existing submission (post-simulation actions or contact updates).
 */
export const updateSubmission = async (
    submissionId: string,
    update: {
        action?: PostSubmissionAction;
        contactUpdate?: { leadName?: string; leadPhone?: string };
    }
) => {
    return withRobustExecution(
        async () => {
            const response = await fetch(`${API_BASE_URL}/update-submission`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ submissionId, ...update }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to update submission: ${response.status} ${response.statusText} - ${errorText}`);
            }

            return response.json();
        },
        {
            circuitBreaker: apiCircuitBreaker,
            timeoutMs: 5000,
            operationName: 'update_submission'
        }
    );
};

// ============================================================================
// EVENT TRACKING (used by submitData and SingleTrackFormContext for campaign analytics)
// ============================================================================

export const trackEvent = async (
    sessionId: string,
    eventType: string,
    eventData?: any
) => {
    const response = await fetch(`${API_BASE_URL}/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            sessionId,
            eventType,
            eventData: {
                ...eventData,
                device: window.innerWidth <= 768 ? 'mobile' : 'desktop',
                timestamp: new Date().toISOString()
            }
        }),
    });

    if (!response.ok) {
        throw new Error(`Failed to track event: ${response.status}`);
    }

    return response.json();
};

// ============================================================================
// ADMIN API FUNCTIONS
// ============================================================================

const getAuthHeaders = async () => {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");
    const token = await user.getIdToken();
    return { 'Authorization': `Bearer ${token}` };
};

export const getSubmissions = async () => {
    return withRobustExecution(
        async () => {
            const headers = await getAuthHeaders();
            const response = await fetch(`${ADMIN_API_BASE_URL}/submissions`, { headers });
            if (!response.ok) throw new Error(`Failed to fetch submissions: ${response.status}`);
            return await response.json();
        },
        {
            circuitBreaker: apiCircuitBreaker,
            operationName: 'get_submissions'
        }
    );
};

export const getEvents = async () => {
    return withRobustExecution(
        async () => {
            const headers = await getAuthHeaders();
            const response = await fetch(`${ADMIN_API_BASE_URL}/events`, { headers });
            if (!response.ok) throw new Error(`Failed to fetch events: ${response.status}`);
            return await response.json();
        },
        {
            circuitBreaker: apiCircuitBreaker,
            operationName: 'get_events'
        }
    );
};

// ============================================================================
// CSV EXPORT FUNCTIONS
// ============================================================================

export interface CsvExportResult {
    success: boolean;
    exportId: string;
    csvDownloadUrl: string;
    submissionCount: number;
    csvStoragePath: string;
}

export interface ExportHistoryItem {
    id: string;
    runTimestamp: string;
    mode: 'full' | 'delta';
    submissionCount: number;
    csvDownloadUrl: string;
    csvStoragePath: string;
}

export const exportSubmissionsCsv = async (mode: 'full' | 'delta'): Promise<CsvExportResult> => {
    return withRobustExecution(
        async () => {
            const headers = await getAuthHeaders();
            const response = await fetch(`${ADMIN_API_BASE_URL}/export-csv`, {
                method: 'POST',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({ mode })
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`CSV export failed: ${response.status} - ${errorText}`);
            }
            return await response.json();
        },
        {
            circuitBreaker: apiCircuitBreaker,
            timeoutMs: 30000,
            operationName: 'export_csv'
        }
    );
};

export const getExportHistory = async (): Promise<{ data: ExportHistoryItem[] }> => {
    return withRobustExecution(
        async () => {
            const headers = await getAuthHeaders();
            const response = await fetch(`${ADMIN_API_BASE_URL}/export-history`, { headers });
            if (!response.ok) throw new Error(`Failed to fetch export history: ${response.status}`);
            return await response.json();
        },
        {
            circuitBreaker: apiCircuitBreaker,
            operationName: 'get_export_history'
        }
    );
};

