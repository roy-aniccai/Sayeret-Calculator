/// <reference types="vite/client" />
import { auth } from '../src/firebase';
import { PostSubmissionAction, SimulationResult } from '../types/analytics';
import {
    withRobustExecution,
    apiCircuitBreaker
} from './retryUtils';

// Use environment variable with fallback for Jest compatibility
// Use environment variable with fallback for Jest compatibility
const isProduction = process.env.NODE_ENV === 'production';
const API_BASE_URL = isProduction ? '/api' : 'https://us-central1-mortgage-85413.cloudfunctions.net/api';
const ADMIN_API_BASE_URL = isProduction ? '/admin-api' : 'https://us-central1-mortgage-85413.cloudfunctions.net/adminApi';

// Helper to detect localhost
const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

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

            if (isLocalhost) {
                console.log('%c[MOCK] Submitting data (Localhost blocked):', 'color: #f59e0b; font-weight: bold;', payload);
                return { id: 'mock-submission-id-' + Date.now(), ...payload };
            }

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
        contactUpdate?: { leadName?: string; leadPhone?: string; interestedInInsurance?: boolean };
    } & Partial<SubmissionPayload>
) => {
    return withRobustExecution(
        async () => {
            if (isLocalhost) {
                console.log('%c[MOCK] Updating submission (Localhost blocked):', 'color: #f59e0b; font-weight: bold;', { submissionId, ...update });
                return { success: true, mock: true };
            }

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
    if (isLocalhost) {
        console.log(`%c[MOCK] Track Event: ${eventType}`, 'color: #3b82f6', eventData);
        return { success: true, mock: true };
    }

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
    consoleUrl?: string;
    submissionCount: number;
    csvStoragePath: string;
}

export interface ExportHistoryItem {
    id: string;
    runTimestamp: string;
    mode: 'full' | 'delta';
    submissionCount: number;
    csvDownloadUrl: string;
    consoleUrl?: string;
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

export const deleteExport = async (id: string): Promise<{ success: boolean }> => {
    return withRobustExecution(
        async () => {
            const headers = await getAuthHeaders();
            const response = await fetch(`${ADMIN_API_BASE_URL}/export-history/${id}`, {
                method: 'DELETE',
                headers
            });
            if (!response.ok) throw new Error(`Failed to delete export: ${response.status}`);
            return await response.json();
        },
        {
            circuitBreaker: apiCircuitBreaker,
            operationName: 'delete_export'
        }
    );
};

// ============================================================================
// FUNNEL DATA FUNCTIONS
// ============================================================================

export interface FunnelStage {
    key: string;
    label: string;
    step: number;
    count: number;
    percentage: number;
    sessionIds: string[];
    insuranceCount?: number;
}

export interface FunnelExtras {
    interestedInInsurance: number;
    interestedInInsurancePercentage: number;
    totalSubmissions: number;
}

export interface SessionSubmission {
    id: string;
    leadName: string;
    leadPhone: string;
    createdAt: string;
}

export interface FunnelDataResponse {
    message: string;
    funnel: FunnelStage[];
    extras: FunnelExtras;
    sessionSubmissionMap: Record<string, SessionSubmission>;
}

export const getFunnelData = async (): Promise<FunnelDataResponse> => {
    return withRobustExecution(
        async () => {
            try {
                const headers = await getAuthHeaders();
                const response = await fetch(`${ADMIN_API_BASE_URL}/funnel-data`, { headers });
                if (!response.ok) {
                    // Automatically fallback to mock data on localhost if endpoint is missing (404) or fails
                    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                        console.warn('Funnel API failed, falling back to mock data for local development.');
                        return getMockFunnelData();
                    }
                    throw new Error(`Failed to fetch funnel data: ${response.status}`);
                }
                return await response.json();
            } catch (err) {
                // Also catch network errors and fallback
                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                    console.warn('Funnel API network error, falling back to mock data.', err);
                    return getMockFunnelData();
                }
                throw err;
            }
        },
        {
            circuitBreaker: apiCircuitBreaker,
            operationName: 'get_funnel_data'
        }
    );
};

// Mock Data Generator for local development
const getMockFunnelData = (): FunnelDataResponse => {
    // Generate 50 mock sessions
    const sessions: SessionSubmission[] = [];
    const now = new Date();
    for (let i = 0; i < 50; i++) {
        sessions.push({
            id: `mock-sess-${i}`,
            leadName: `Lead ${i + 1}`,
            leadPhone: `050-00000${i.toString().padStart(2, '0')}`,
            createdAt: new Date(now.getTime() - i * 3600000).toISOString() // 1 hour intervals
        });
    }

    const map: Record<string, SessionSubmission> = {};
    sessions.forEach(s => map[s.id] = s);

    // Create subsets for funnel stages to simulate drop-off
    const step1 = sessions; // 50
    const step2 = step1.slice(0, 45);
    const step3 = step2.slice(0, 40);
    const step4 = step3.slice(0, 35);
    const step5 = step4.slice(0, 30);
    const step6 = step5.slice(0, 25);
    const step61 = step6.slice(0, 20); // Request Saving
    const step7 = step6.slice(0, 10); // Meeting
    const step8 = step6.slice(10, 25); // Callback

    // Randomly assign insurance interest to some sessions in the "extras" metric calculation
    // Note: The mock data for submissions list is separate (controlled by getSubmissions mock if it existed, but here we only control funnel stats)

    return {
        message: 'success (mock)',
        funnel: [
            { key: 'landing', label: 'כניסה לדף', step: 1, count: step1.length, percentage: 100, sessionIds: step1.map(s => s.id), insuranceCount: 0 },
            { key: 'debts', label: 'חובות', step: 2, count: step2.length, percentage: 90, sessionIds: step2.map(s => s.id), insuranceCount: 2 },
            { key: 'payments', label: 'החזרים חודשיים', step: 3, count: step3.length, percentage: 80, sessionIds: step3.map(s => s.id), insuranceCount: 3 },
            { key: 'assets', label: 'נכסים', step: 4, count: step4.length, percentage: 70, sessionIds: step4.map(s => s.id), insuranceCount: 4 },
            { key: 'contact', label: 'פרטי קשר', step: 5, count: step5.length, percentage: 60, sessionIds: step5.map(s => s.id), insuranceCount: 5 },
            { key: 'simulator', label: 'סימולטור', step: 6, count: step6.length, percentage: 50, sessionIds: step6.map(s => s.id), insuranceCount: 6 },
            { key: 'request_saving', label: 'בקשת חיסכון', step: 6.1, count: step61.length, percentage: 40, sessionIds: step61.map(s => s.id), insuranceCount: 5 },
            { key: 'schedule_meeting', label: 'תיאום פגישה', step: 7, count: step7.length, percentage: 20, sessionIds: step7.map(s => s.id), insuranceCount: 2 },
            { key: 'request_callback', label: 'בקשת שיחה חוזרת', step: 8, count: step8.length, percentage: 30, sessionIds: step8.map(s => s.id), insuranceCount: 12 }, // Used in visual
        ],
        extras: {
            interestedInInsurance: 12,
            interestedInInsurancePercentage: 24,
            totalSubmissions: 50
        },
        sessionSubmissionMap: map
    };
};
