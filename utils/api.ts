/// <reference types="vite/client" />
import { auth } from '../src/firebase';
import {
    UserProfile,
    UserEvent,
    createEnhancedEvent,
    calculateLeadScore,
    determineLeadTier,
    validateUserProfile,
    validateUserEvent,
    sanitizeUserData
} from '../types/analytics';
import {
    withApiRetry,
    withFirebaseRetry,
    apiCircuitBreaker,
    firebaseCircuitBreaker,
    withRobustExecution
} from './retryUtils';


// Use environment variable with fallback for Jest compatibility
const isProduction = process.env.NODE_ENV === 'production';
// FIXED: Use production Firebase Functions URLs instead of localhost SQLite server
// The Firebase Functions are deployed at: https://us-central1-mortgage-85413.cloudfunctions.net/
const API_BASE_URL = isProduction ? '/api' : 'https://us-central1-mortgage-85413.cloudfunctions.net/api';
const ADMIN_API_BASE_URL = isProduction ? '/api/admin' : 'https://us-central1-mortgage-85413.cloudfunctions.net/adminApi';

// ============================================================================
// ENHANCED SUBMISSION FUNCTIONS WITH RETRY LOGIC
// ============================================================================

/**
 * Enhanced Submit Data Function with Robust Error Handling
 * 
 * Submits enhanced user profile data with lead scoring and validation.
 * No backward compatibility - uses only the new enhanced format.
 */
export const submitData = async (data: Partial<UserProfile>) => {
    return withRobustExecution(
        async () => {
            console.log(`Submitting enhanced data to ${API_BASE_URL}/submit`, data);

            // Calculate lead score
            const scoringResult = calculateLeadScore(data);
            const enhancedProfile: Partial<UserProfile> = {
                ...data,
                leadScore: scoringResult.score,
                leadTier: determineLeadTier(scoringResult.score),
                qualificationFactors: scoringResult.factors,
                createdAt: new Date() as any,
                updatedAt: new Date() as any,
                isConverted: true,
                conversionTimestamp: new Date() as any,
            };

            // Validate the enhanced profile
            const validation = validateUserProfile(enhancedProfile);
            if (!validation.isValid) {
                console.warn('Profile validation warnings:', validation.errors);
                // Continue with submission but log warnings
            }

            // Sanitize data before submission
            const sanitizedData = sanitizeUserData(enhancedProfile);

            const response = await fetch(`${API_BASE_URL}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...sanitizedData,
                    // Add metadata
                    enhancedVersion: '2.0',
                    scoringBreakdown: scoringResult.breakdown
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to submit enhanced data: ${response.status} ${response.statusText} - ${errorText}`);
            }

            const result = await response.json();

            // Track successful submission event (with retry)
            try {
                await trackEvent(
                    data.sessionId || 'unknown',
                    'form_submit',
                    {
                        leadScore: enhancedProfile.leadScore,
                        leadTier: enhancedProfile.leadTier,
                        qualificationFactors: enhancedProfile.qualificationFactors,
                        submissionId: result.id
                    },
                    enhancedProfile.id
                );
            } catch (trackingError) {
                console.warn('Failed to track submission success event:', trackingError);
                // Don't fail the submission if tracking fails
            }

            return result;
        },
        {
            circuitBreaker: apiCircuitBreaker,
            timeoutMs: 15000, // 15 seconds for submissions
            operationName: 'submit_data'
        }
    ).catch(async (error) => {
        console.error('CRITICAL: Error submitting enhanced data after all retries.', error);

        // Track submission error (best effort, no retry)
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
        } catch (trackingError) {
            console.warn('Failed to track submission error:', trackingError);
        }

        throw error;
    });
};

// ============================================================================
// ENHANCED EVENT TRACKING FUNCTIONS WITH RETRY LOGIC
// ============================================================================

/**
 * Enhanced Track Event Function with Robust Error Handling
 * 
 * Creates enhanced event data with device detection, categorization,
 * and comprehensive context information with retry logic.
 */
export const trackEvent = async (
    sessionId: string,
    eventType: string,
    eventData?: any,
    userId?: string
) => {
    return withRobustExecution(
        async () => {
            // Create enhanced event with device detection and categorization
            const enhancedEvent = createEnhancedEvent(sessionId, eventType, eventData, userId);

            // Validate event data
            const validation = validateUserEvent(enhancedEvent);
            if (!validation.isValid) {
                console.warn('Event validation warnings:', validation.errors);
                // Continue with tracking but log warnings
            }

            // Submit to Firebase Functions
            const response = await fetch(`${API_BASE_URL}/event`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...enhancedEvent,
                    // Add metadata
                    enhancedVersion: '2.0',
                    timestamp: new Date().toISOString()
                }),
            });

            if (!response.ok) {
                throw new Error(`Failed to track event: ${response.status} ${response.statusText}`);
            }

            return response.json();
        },
        {
            circuitBreaker: apiCircuitBreaker,
            timeoutMs: 5000, // 5 seconds for events
            operationName: `track_event_${eventType}`
        }
    ).catch((error) => {
        console.warn(`Failed to track enhanced event ${eventType} after all retries:`, error);
        // Don't throw - tracking failures shouldn't break the app
        return null;
    });
};

/**
 * Track User Journey Step with retry
 */
export const trackStep = async (
    sessionId: string,
    step: number,
    action: 'view' | 'complete' | 'next' | 'prev',
    additionalData?: any,
    userId?: string
) => {
    const eventType = `step_${action}`;
    const eventData = {
        step,
        ...additionalData
    };

    return trackEvent(sessionId, eventType, eventData, userId);
};

/**
 * Track Conversion Event with retry
 */
export const trackConversion = async (
    sessionId: string,
    conversionType: string,
    conversionData?: any,
    userId?: string
) => {
    const eventData = {
        conversionType,
        timestamp: new Date().toISOString(),
        ...conversionData
    };

    return trackEvent(sessionId, 'conversion', eventData, userId);
};

/**
 * Track Field Interaction with retry
 */
export const trackFieldInteraction = async (
    sessionId: string,
    fieldName: string,
    action: 'focus' | 'blur' | 'change',
    value?: any,
    userId?: string
) => {
    const eventType = `field_${action}`;
    const eventData = {
        fieldName,
        value: typeof value === 'string' ? value.substring(0, 100) : value, // Limit value length
        component: 'form_field'
    };

    return trackEvent(sessionId, eventType, eventData, userId);
};

/**
 * Track Button Click with retry
 */
export const trackButtonClick = async (
    sessionId: string,
    buttonName: string,
    context?: any,
    userId?: string
) => {
    const eventData = {
        buttonName,
        component: 'button',
        ...context
    };

    return trackEvent(sessionId, 'button_click', eventData, userId);
};

// ============================================================================
// BATCH OPERATIONS WITH RETRY LOGIC
// ============================================================================

/**
 * Batch Track Events with robust error handling
 * 
 * Efficiently track multiple events in a single request with fallback to individual tracking
 */
export const batchTrackEvents = async (events: Array<{
    sessionId: string;
    eventType: string;
    eventData?: any;
    userId?: string;
}>) => {
    return withRobustExecution(
        async () => {
            const enhancedEvents = events.map(event =>
                createEnhancedEvent(event.sessionId, event.eventType, event.eventData, event.userId)
            );

            // Submit batch to Firebase Functions
            const response = await fetch(`${API_BASE_URL}/events/batch`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    events: enhancedEvents,
                    enhancedVersion: '2.0',
                    batchTimestamp: new Date().toISOString()
                }),
            });

            if (!response.ok) {
                throw new Error(`Batch event tracking failed: ${response.status}`);
            }

            return response.json();
        },
        {
            circuitBreaker: apiCircuitBreaker,
            timeoutMs: 10000, // 10 seconds for batch operations
            operationName: 'batch_track_events'
        }
    ).catch(async (error) => {
        console.warn('Batch event tracking failed, falling back to individual tracking:', error);

        // Fallback to individual tracking with limited retries
        const results = await Promise.allSettled(
            events.map(event =>
                trackEvent(event.sessionId, event.eventType, event.eventData, event.userId)
            )
        );

        const failures = results.filter(r => r.status === 'rejected').length;
        if (failures > 0) {
            console.warn(`${failures}/${events.length} individual event tracking attempts failed`);
        }

        return { batchFailed: true, individualResults: results };
    });
};

// ============================================================================
// ADMIN API FUNCTIONS WITH RETRY LOGIC
// ============================================================================

const getAuthHeaders = async () => {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");
    const token = await user.getIdToken();
    return {
        'Authorization': `Bearer ${token}`
    };
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

/**
 * Get Enhanced Analytics Data with retry
 */
export const getAnalyticsData = async (options?: {
    startDate?: string;
    endDate?: string;
    eventTypes?: string[];
    limit?: number;
}) => {
    return withRobustExecution(
        async () => {
            const headers = await getAuthHeaders();
            const queryParams = new URLSearchParams();

            if (options?.startDate) queryParams.append('startDate', options.startDate);
            if (options?.endDate) queryParams.append('endDate', options.endDate);
            if (options?.eventTypes) queryParams.append('eventTypes', options.eventTypes.join(','));
            if (options?.limit) queryParams.append('limit', options.limit.toString());

            const url = `${ADMIN_API_BASE_URL}/analytics${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
            const response = await fetch(url, { headers });

            if (!response.ok) throw new Error(`Failed to fetch analytics data: ${response.status}`);
            return await response.json();
        },
        {
            circuitBreaker: apiCircuitBreaker,
            operationName: 'get_analytics_data'
        }
    );
};

/**
 * Get Lead Scoring Data with retry
 */
export const getLeadScoringData = async () => {
    return withRobustExecution(
        async () => {
            const headers = await getAuthHeaders();
            const response = await fetch(`${ADMIN_API_BASE_URL}/lead-scoring`, { headers });
            if (!response.ok) throw new Error(`Failed to fetch lead scoring data: ${response.status}`);
            return await response.json();
        },
        {
            circuitBreaker: apiCircuitBreaker,
            operationName: 'get_lead_scoring_data'
        }
    );
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate User ID from session and name
 */
export const generateUserId = (sessionId: string, leadName: string): string => {
    const hash = btoa(`${sessionId}-${leadName}`).replace(/[^a-zA-Z0-9]/g, '');
    return `user_${hash.substring(0, 16)}`;
};

/**
 * Check if enhanced analytics is available
 */
export const isEnhancedAnalyticsAvailable = (): boolean => {
    return typeof window !== 'undefined' && 'crypto' in window;
};

/**
 * Get system health status
 */
export const getSystemHealth = () => {
    return {
        apiCircuitBreaker: {
            state: apiCircuitBreaker.getState(),
            failures: apiCircuitBreaker.getFailures()
        },
        firebaseCircuitBreaker: {
            state: firebaseCircuitBreaker.getState(),
            failures: firebaseCircuitBreaker.getFailures()
        },
        enhancedAnalyticsAvailable: isEnhancedAnalyticsAvailable(),
        timestamp: new Date().toISOString()
    };
};
