/**
 * Analytics Utility Functions
 * 
 * This file provides utility functions for analytics data processing,
 * device detection, lead scoring, and data transformation.
 * 
 * Requirements: 3 (User Journey Tracking), 4 (Lead Scoring), 7 (Data Structure)
 */

import { 
  UserProfile, 
  UserEvent, 
  UserSession, 
  EventCategory, 
  DeviceType, 
  ViewportSize,
  LeadScoringConfig,
  LeadTierConfig,
  validateUserProfile,
  validateUserEvent,
  sanitizeUserData,
  EVENT_TYPES
} from '../types/analytics';

// ============================================================================
// DEVICE AND VIEWPORT DETECTION
// ============================================================================

/**
 * Detect device type based on user agent and viewport
 */
export function detectDeviceType(userAgent?: string, viewport?: ViewportSize): DeviceType {
  if (!userAgent && !viewport) return 'DESKTOP';
  
  // Check user agent first
  if (userAgent) {
    const ua = userAgent.toLowerCase();
    if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
      return 'MOBILE';
    }
    if (/tablet|ipad|android(?!.*mobile)/i.test(ua)) {
      return 'TABLET';
    }
  }
  
  // Fallback to viewport size
  if (viewport) {
    if (viewport.width <= 768) return 'MOBILE';
    if (viewport.width <= 1024) return 'TABLET';
  }
  
  return 'DESKTOP';
}

/**
 * Get current viewport size
 */
export function getViewportSize(): ViewportSize {
  if (typeof window !== 'undefined') {
    return {
      width: window.innerWidth || document.documentElement.clientWidth,
      height: window.innerHeight || document.documentElement.clientHeight
    };
  }
  return { width: 1920, height: 1080 }; // Default for server-side
}

/**
 * Get user agent string
 */
export function getUserAgent(): string {
  if (typeof navigator !== 'undefined') {
    return navigator.userAgent;
  }
  return 'Unknown';
}

// ============================================================================
// LEAD SCORING FUNCTIONS
// ============================================================================

/**
 * Lead Scoring Configuration
 */
export const LEAD_SCORING_CONFIG: LeadScoringConfig = {
  profileCompleteness: {
    maxPoints: 30,
    factors: {
      name: 10,
      phone: 10,
      age: 5,
      email: 5
    }
  },
  financialProfile: {
    maxPoints: 40,
    factors: {
      highPropertyValue: 15,    // >2M NIS
      significantMortgage: 10,  // >1M NIS
      highPayments: 10,         // >5K NIS
      additionalLoans: 5
    }
  },
  engagement: {
    maxPoints: 20,
    factors: {
      completedAllSteps: 10,
      timeSpent: 5,             // >2 minutes
      multipleSessions: 5
    }
  },
  intent: {
    maxPoints: 10,
    factors: {
      interestedInInsurance: 5,
      specificTarget: 5
    }
  }
};

/**
 * Lead Tier Configuration
 */
export const LEAD_TIER_CONFIG: LeadTierConfig = {
  HOT: { min: 80, max: 100 },
  WARM: { min: 50, max: 79 },
  COLD: { min: 0, max: 49 }
};

/**
 * Calculate Profile Completeness Score (0-30 points)
 */
export function calculateProfileCompletenessScore(profile: Partial<UserProfile>): number {
  let score = 0;
  const config = LEAD_SCORING_CONFIG.profileCompleteness.factors;
  
  if (profile.leadName && profile.leadName.trim()) score += config.name;
  if (profile.leadPhone && profile.leadPhone.trim()) score += config.phone;
  if (profile.age && profile.age > 0) score += config.age;
  if (profile.leadEmail && profile.leadEmail.trim()) score += config.email;
  
  return Math.min(score, LEAD_SCORING_CONFIG.profileCompleteness.maxPoints);
}

/**
 * Calculate Financial Profile Quality Score (0-40 points)
 */
export function calculateFinancialProfileScore(profile: Partial<UserProfile>): number {
  let score = 0;
  const config = LEAD_SCORING_CONFIG.financialProfile.factors;
  
  // High property value (>2M NIS)
  if (profile.propertyValue && profile.propertyValue > 2000000) {
    score += config.highPropertyValue;
  }
  
  // Significant mortgage balance (>1M NIS)
  if (profile.mortgageBalance && profile.mortgageBalance > 1000000) {
    score += config.significantMortgage;
  }
  
  // High monthly payments (>5K NIS)
  const totalPayments = (profile.mortgagePayment || 0) + (profile.otherLoansPayment || 0);
  if (totalPayments > 5000) {
    score += config.highPayments;
  }
  
  // Additional loans
  if (profile.otherLoansBalance && profile.otherLoansBalance > 0) {
    score += config.additionalLoans;
  }
  
  return Math.min(score, LEAD_SCORING_CONFIG.financialProfile.maxPoints);
}

/**
 * Calculate Engagement Level Score (0-20 points)
 * Note: This requires session data and events, so it's calculated separately
 */
export function calculateEngagementScore(
  profile: Partial<UserProfile>,
  sessionDuration?: number,
  sessionCount?: number
): number {
  let score = 0;
  const config = LEAD_SCORING_CONFIG.engagement.factors;
  
  // Completed all steps (assuming 6 steps total)
  if (profile.completedSteps && profile.completedSteps.length >= 6) {
    score += config.completedAllSteps;
  }
  
  // Time spent on form (>2 minutes = 120 seconds)
  if (sessionDuration && sessionDuration > 120) {
    score += config.timeSpent;
  }
  
  // Multiple sessions
  if (sessionCount && sessionCount > 1) {
    score += config.multipleSessions;
  }
  
  return Math.min(score, LEAD_SCORING_CONFIG.engagement.maxPoints);
}

/**
 * Calculate Intent Indicators Score (0-10 points)
 */
export function calculateIntentScore(profile: Partial<UserProfile>): number {
  let score = 0;
  const config = LEAD_SCORING_CONFIG.intent.factors;
  
  // Interested in insurance
  if (profile.interestedInInsurance === true) {
    score += config.interestedInInsurance;
  }
  
  // Specific target payment (different from current)
  if (profile.targetTotalPayment && profile.mortgagePayment && 
      Math.abs(profile.targetTotalPayment - profile.mortgagePayment) > 100) {
    score += config.specificTarget;
  }
  
  return Math.min(score, LEAD_SCORING_CONFIG.intent.maxPoints);
}

/**
 * Calculate Total Lead Score
 */
export function calculateLeadScore(
  profile: Partial<UserProfile>,
  sessionDuration?: number,
  sessionCount?: number
): { score: number; breakdown: Record<string, number>; factors: string[] } {
  const profileScore = calculateProfileCompletenessScore(profile);
  const financialScore = calculateFinancialProfileScore(profile);
  const engagementScore = calculateEngagementScore(profile, sessionDuration, sessionCount);
  const intentScore = calculateIntentScore(profile);
  
  const totalScore = profileScore + financialScore + engagementScore + intentScore;
  
  const breakdown = {
    profileCompleteness: profileScore,
    financialProfile: financialScore,
    engagement: engagementScore,
    intent: intentScore
  };
  
  // Generate qualification factors
  const factors: string[] = [];
  if (profileScore >= 20) factors.push('Complete Profile');
  if (financialScore >= 25) factors.push('High-Value Financial Profile');
  if (engagementScore >= 15) factors.push('High Engagement');
  if (intentScore >= 8) factors.push('Strong Intent Signals');
  if (profile.propertyValue && profile.propertyValue > 3000000) factors.push('Premium Property');
  if (profile.mortgageBalance && profile.mortgageBalance > 1500000) factors.push('Large Mortgage');
  
  return { score: totalScore, breakdown, factors };
}

/**
 * Determine Lead Tier based on score
 */
export function determineLeadTier(score: number): 'HOT' | 'WARM' | 'COLD' {
  if (score >= LEAD_TIER_CONFIG.HOT.min) return 'HOT';
  if (score >= LEAD_TIER_CONFIG.WARM.min) return 'WARM';
  return 'COLD';
}

// ============================================================================
// EVENT PROCESSING FUNCTIONS
// ============================================================================

/**
 * Create Enhanced Event Data
 */
export function createEnhancedEvent(
  sessionId: string,
  eventType: string,
  eventData?: any,
  userId?: string
): Partial<UserEvent> {
  const viewport = getViewportSize();
  const userAgent = getUserAgent();
  const device = detectDeviceType(userAgent, viewport);
  
  // Determine event category
  let eventCategory: EventCategory = 'INTERACTION';
  if (eventType.includes('step') || eventType.includes('navigation')) {
    eventCategory = 'NAVIGATION';
  } else if (eventType.includes('submit') || eventType.includes('conversion')) {
    eventCategory = 'CONVERSION';
  } else if (eventType.includes('error')) {
    eventCategory = 'ERROR';
  }
  
  return {
    sessionId,
    userId,
    eventType,
    eventCategory,
    eventData: sanitizeUserData(eventData || {}),
    userAgent,
    viewport,
    device,
    timestamp: new Date() as any // Will be converted to Firestore Timestamp
  };
}

/**
 * Process Step Progression Events
 */
export function processStepProgression(events: UserEvent[]): {
  stepProgression: number[];
  maxStepReached: number;
  completedSteps: number[];
  abandonmentPoint?: number;
} {
  const stepEvents = events
    .filter(e => e.eventType === EVENT_TYPES.STEP_VIEW)
    .sort((a, b) => a.timestamp.toMillis() - b.timestamp.toMillis());
  
  const stepProgression: number[] = [];
  const completedSteps: number[] = [];
  let maxStepReached = 0;
  
  stepEvents.forEach(event => {
    const step = event.eventData?.step || event.step;
    if (typeof step === 'number') {
      stepProgression.push(step);
      maxStepReached = Math.max(maxStepReached, step);
      
      // Mark as completed if user progressed beyond this step
      if (!completedSteps.includes(step)) {
        completedSteps.push(step);
      }
    }
  });
  
  // Determine abandonment point (last step before significant time gap)
  let abandonmentPoint: number | undefined;
  if (stepProgression.length > 1) {
    const lastStep = stepProgression[stepProgression.length - 1];
    const secondLastStep = stepProgression[stepProgression.length - 2];
    
    // If user didn't complete the form and stopped at a specific step
    if (lastStep < 6 && !events.some(e => e.eventType === EVENT_TYPES.FORM_SUBMIT)) {
      abandonmentPoint = lastStep;
    }
  }
  
  return {
    stepProgression: [...new Set(stepProgression)], // Remove duplicates
    maxStepReached,
    completedSteps: completedSteps.sort((a, b) => a - b),
    abandonmentPoint
  };
}

/**
 * Calculate Session Duration
 */
export function calculateSessionDuration(events: UserEvent[]): number {
  if (events.length === 0) return 0;
  
  const sortedEvents = events.sort((a, b) => a.timestamp.toMillis() - b.timestamp.toMillis());
  const firstEvent = sortedEvents[0];
  const lastEvent = sortedEvents[sortedEvents.length - 1];
  
  return (lastEvent.timestamp.toMillis() - firstEvent.timestamp.toMillis()) / 1000; // Convert to seconds
}

// ============================================================================
// DATA TRANSFORMATION FUNCTIONS
// ============================================================================

/**
 * Create User Session from Events
 */
export function createUserSessionFromEvents(
  sessionId: string,
  events: UserEvent[],
  userId?: string
): Partial<UserSession> {
  if (events.length === 0) {
    return {
      id: sessionId,
      userId,
      pageViews: 0,
      stepProgression: [],
      maxStepReached: 0,
      bounceRate: true,
      converted: false
    };
  }
  
  const sortedEvents = events.sort((a, b) => a.timestamp.toMillis() - b.timestamp.toMillis());
  const firstEvent = sortedEvents[0];
  const lastEvent = sortedEvents[sortedEvents.length - 1];
  
  const stepData = processStepProgression(events);
  const duration = calculateSessionDuration(events);
  
  // Determine conversion
  const converted = events.some(e => 
    e.eventType === EVENT_TYPES.FORM_SUBMIT || 
    e.eventType === EVENT_TYPES.LEAD_QUALIFIED
  );
  
  const conversionEvent = events.find(e => 
    e.eventType === EVENT_TYPES.FORM_SUBMIT || 
    e.eventType === EVENT_TYPES.LEAD_QUALIFIED
  );
  
  return {
    id: sessionId,
    userId,
    startTime: firstEvent.timestamp,
    endTime: lastEvent.timestamp,
    duration,
    pageViews: events.filter(e => e.eventType === EVENT_TYPES.STEP_VIEW).length,
    stepProgression: stepData.stepProgression,
    maxStepReached: stepData.maxStepReached,
    bounceRate: stepData.stepProgression.length <= 1,
    converted,
    conversionStep: conversionEvent?.step,
    landingPage: firstEvent.eventData?.landingPage || 'unknown'
  };
}

// ============================================================================
// EXPORT UTILITY FUNCTIONS
// ============================================================================

export {
  validateUserProfile,
  validateUserEvent,
  sanitizeUserData
};