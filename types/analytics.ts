/**
 * Enhanced Analytics Data Structures
 * 
 * This file defines the comprehensive data structures for the enhanced analytics system,
 * including user profiles, events, sessions, and lead scoring.
 * 
 * Requirements: 7 (Data Structure Enhancement), 4 (Lead Scoring), 3 (User Journey Tracking)
 */

import { Timestamp } from 'firebase/firestore';

// ============================================================================
// USER PROFILE INTERFACES
// ============================================================================

/**
 * Enhanced User Profile Interface
 * 
 * Comprehensive user data structure that includes contact information,
 * financial profile, campaign attribution, lead scoring, and CRM integration.
 */
export interface UserProfile {
  // Core Identity
  id: string;                    // Auto-generated document ID
  sessionId: string;             // Unique session identifier
  createdAt: Timestamp;          // First interaction timestamp
  updatedAt: Timestamp;          // Last update timestamp
  
  // Contact Information
  leadName: string;              // שם מלא
  leadPhone: string;             // מספר טלפון
  leadEmail?: string;            // Email (optional)
  age?: number;                  // גיל
  
  // Financial Profile
  mortgageBalance: number;       // יתרת משכנתא נוכחית
  otherLoansBalance: number;     // סך ההלוואות האחרות
  mortgagePayment: number;       // החזר משכנתא חודשי נוכחי
  otherLoansPayment: number;     // החזר הלוואות אחרות חודשי
  propertyValue: number;         // שווי נכס מוערך כיום
  targetTotalPayment: number;    // Target monthly payment
  oneTimePaymentAmount: number;  // One-time payment capability
  
  // Preferences and Interests
  interestedInInsurance?: boolean;
  track: 'MONTHLY_REDUCTION' | 'SHORTEN_TERM' | null;
  
  // Campaign Attribution
  campaignId?: string;
  utmParams: Record<string, string>;
  referrer?: string;
  landingPage?: string;
  
  // Lead Qualification
  leadScore: number;             // Calculated lead score (0-100)
  leadTier: 'HOT' | 'WARM' | 'COLD';
  qualificationFactors: string[];
  
  // CRM Integration
  crmStatus: 'PENDING' | 'SYNCED' | 'FAILED';
  crmLeadId?: string;            // Scalla CRM lead ID
  crmSyncedAt?: Timestamp;
  crmErrors?: string[];
  
  // Journey Completion
  completedSteps: number[];      // Array of completed step numbers
  conversionStep?: number;       // Step where conversion occurred
  isConverted: boolean;
  conversionTimestamp?: Timestamp;
}

/**
 * User Profile Validation Schema
 */
export interface UserProfileValidation {
  required: (keyof UserProfile)[];
  optional: (keyof UserProfile)[];
  numeric: (keyof UserProfile)[];
  strings: (keyof UserProfile)[];
  arrays: (keyof UserProfile)[];
}

export const USER_PROFILE_VALIDATION: UserProfileValidation = {
  required: ['id', 'sessionId', 'createdAt', 'leadName', 'leadPhone', 'mortgageBalance', 'propertyValue'],
  optional: ['leadEmail', 'age', 'campaignId', 'crmLeadId', 'conversionStep'],
  numeric: ['mortgageBalance', 'otherLoansBalance', 'mortgagePayment', 'otherLoansPayment', 'propertyValue', 'targetTotalPayment', 'oneTimePaymentAmount', 'leadScore', 'age'],
  strings: ['id', 'sessionId', 'leadName', 'leadPhone', 'leadEmail', 'campaignId', 'referrer', 'landingPage', 'crmLeadId'],
  arrays: ['completedSteps', 'qualificationFactors', 'crmErrors']
};

// ============================================================================
// EVENT INTERFACES
// ============================================================================

/**
 * Enhanced User Event Interface
 * 
 * Comprehensive event tracking structure for user interactions,
 * including categorization, context, and performance metrics.
 */
export interface UserEvent {
  id: string;                    // Auto-generated document ID
  userId: string;                // Reference to user document
  sessionId: string;             // Session identifier
  timestamp: Timestamp;          // Event timestamp
  
  // Event Classification
  eventType: string;             // Event type identifier
  eventCategory: EventCategory;  // Event category
  
  // Event Context
  step?: number;                 // Current form step
  component?: string;            // UI component involved
  action?: string;               // Specific action taken
  
  // Event Data
  eventData: Record<string, any>; // Flexible event data
  
  // Performance Metrics
  duration?: number;             // Time spent on action (ms)
  previousStep?: number;         // Previous step (for navigation)
  
  // Technical Context
  userAgent?: string;
  viewport?: ViewportSize;
  device?: DeviceType;
}

/**
 * Event Categories for classification
 */
export type EventCategory = 'NAVIGATION' | 'INTERACTION' | 'CONVERSION' | 'ERROR';

/**
 * Device Type Detection
 */
export type DeviceType = 'MOBILE' | 'TABLET' | 'DESKTOP';

/**
 * Viewport Size Interface
 */
export interface ViewportSize {
  width: number;
  height: number;
}

/**
 * Event Type Constants
 */
export const EVENT_TYPES = {
  // Navigation Events
  SESSION_START: 'session_start',
  STEP_VIEW: 'step_view',
  STEP_COMPLETE: 'step_complete',
  STEP_NEXT: 'step_next',
  STEP_PREV: 'step_prev',
  FORM_RESET: 'form_reset',
  
  // Interaction Events
  FIELD_FOCUS: 'field_focus',
  FIELD_BLUR: 'field_blur',
  FIELD_CHANGE: 'field_change',
  BUTTON_CLICK: 'button_click',
  TOOLTIP_VIEW: 'tooltip_view',
  
  // Conversion Events
  LEAD_QUALIFIED: 'lead_qualified',
  FORM_SUBMIT: 'form_submit',
  CRM_SYNC: 'crm_sync',
  APPOINTMENT_SCHEDULED: 'appointment_scheduled',
  
  // Error Events
  API_ERROR: 'api_error',
  VALIDATION_ERROR: 'validation_error',
  CRM_SYNC_ERROR: 'crm_sync_error',
  
  // Single Track Events
  SINGLE_TRACK_SESSION_START: 'single_track_session_start',
  SINGLE_TRACK_STEP_VIEW: 'single_track_step_view',
  SINGLE_TRACK_STEP_COMPLETE: 'single_track_step_complete',
  SINGLE_TRACK_CONVERSION: 'single_track_conversion'
} as const;

// ============================================================================
// SESSION INTERFACES
// ============================================================================

/**
 * User Session Interface
 * 
 * Tracks complete user sessions including metrics, attribution, and conversion data.
 */
export interface UserSession {
  id: string;                    // Session ID
  userId?: string;               // Reference to user (if converted)
  startTime: Timestamp;
  endTime?: Timestamp;
  duration?: number;             // Session duration in seconds
  
  // Session Metrics
  pageViews: number;
  stepProgression: number[];     // Steps visited in order
  maxStepReached: number;
  bounceRate: boolean;           // True if single page view
  
  // Attribution
  campaignData: Record<string, any>;
  referrer?: string;
  landingPage: string;
  
  // Conversion
  converted: boolean;
  conversionStep?: number;
  conversionValue?: number;      // Estimated lead value
}

// ============================================================================
// LEAD SCORING INTERFACES
// ============================================================================

/**
 * Lead Scoring Configuration
 */
export interface LeadScoringConfig {
  profileCompleteness: {
    maxPoints: 30;
    factors: {
      name: 10;
      phone: 10;
      age: 5;
      email: 5;
    };
  };
  financialProfile: {
    maxPoints: 40;
    factors: {
      highPropertyValue: 15;    // >2M NIS
      significantMortgage: 10;  // >1M NIS
      highPayments: 10;         // >5K NIS
      additionalLoans: 5;
    };
  };
  engagement: {
    maxPoints: 20;
    factors: {
      completedAllSteps: 10;
      timeSpent: 5;             // >2 minutes
      multipleSessions: 5;
    };
  };
  intent: {
    maxPoints: 10;
    factors: {
      interestedInInsurance: 5;
      specificTarget: 5;
    };
  };
}

/**
 * Lead Tier Thresholds
 */
export interface LeadTierConfig {
  HOT: { min: 80; max: 100 };
  WARM: { min: 50; max: 79 };
  COLD: { min: 0; max: 49 };
}

// ============================================================================
// CRM INTEGRATION INTERFACES
// ============================================================================

/**
 * Scalla CRM Payload Interface
 */
export interface ScallaCRMPayload {
  full_name: string;
  phone_number: string;
  age?: number;
  mortgage_balance: number;
  other_loans_balance: number;
  mortgage_payment: number;
  other_loans_payment: number;
  property_value: number;
  status: string;
  lead_score: number;
  campaign_source?: string;
  utm_params?: Record<string, string>;
  created_at: string;
}

/**
 * CRM Status Values (Hebrew)
 */
export const CRM_STATUS_VALUES = {
  MEETING_SCHEDULED: 'תואמה פגישה',
  WAITING_MORTGAGE_ADVISOR: 'מחכה לשיחה מיועץ משכנתא',
  WAITING_INSURANCE_AGENT: 'מחכה לשיחה מסוכן ביטוח'
} as const;

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate User Profile Data
 */
export function validateUserProfile(data: Partial<UserProfile>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check required fields
  USER_PROFILE_VALIDATION.required.forEach(field => {
    if (!data[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  });
  
  // Validate numeric fields
  USER_PROFILE_VALIDATION.numeric.forEach(field => {
    if (data[field] !== undefined && (typeof data[field] !== 'number' || isNaN(data[field] as number))) {
      errors.push(`Invalid numeric value for field: ${field}`);
    }
  });
  
  // Validate lead score range
  if (data.leadScore !== undefined && (data.leadScore < 0 || data.leadScore > 100)) {
    errors.push('Lead score must be between 0 and 100');
  }
  
  // Validate phone number format (basic)
  if (data.leadPhone && !/^\d{9,10}$/.test(data.leadPhone.replace(/[-\s]/g, ''))) {
    errors.push('Invalid phone number format');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate User Event Data
 */
export function validateUserEvent(data: Partial<UserEvent>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Required fields
  if (!data.sessionId) errors.push('Missing sessionId');
  if (!data.eventType) errors.push('Missing eventType');
  if (!data.eventCategory) errors.push('Missing eventCategory');
  
  // Validate event category
  if (data.eventCategory && !['NAVIGATION', 'INTERACTION', 'CONVERSION', 'ERROR'].includes(data.eventCategory)) {
    errors.push('Invalid event category');
  }
  
  // Validate device type
  if (data.device && !['MOBILE', 'TABLET', 'DESKTOP'].includes(data.device)) {
    errors.push('Invalid device type');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Calculate Lead Score based on user profile data
 */
export function calculateLeadScore(profile: Partial<UserProfile>): number {
  let score = 0;
  
  // Profile Completeness (30 points max)
  if (profile.leadName) score += 10;
  if (profile.leadPhone) score += 10;
  if (profile.age) score += 5;
  if (profile.leadEmail) score += 5;
  
  // Financial Profile (40 points max)
  if (profile.propertyValue && profile.propertyValue > 2000000) score += 15; // >2M NIS
  if (profile.mortgageBalance && profile.mortgageBalance > 1000000) score += 10; // >1M NIS
  if (profile.mortgagePayment && profile.mortgagePayment > 5000) score += 10; // >5K NIS
  if (profile.otherLoansBalance && profile.otherLoansBalance > 0) score += 5;
  
  // Engagement (20 points max)
  if (profile.completedSteps && profile.completedSteps.length >= 6) score += 10; // All steps
  if (profile.isConverted) score += 10; // Conversion bonus
  
  // Intent (10 points max)
  if (profile.interestedInInsurance) score += 5;
  if (profile.targetTotalPayment && profile.targetTotalPayment > 0) score += 5;
  
  return Math.min(100, Math.max(0, score));
}

/**
 * Determine Lead Tier based on lead score
 */
export function determineLeadTier(score: number): 'HOT' | 'WARM' | 'COLD' {
  if (score >= 80) return 'HOT';
  if (score >= 50) return 'WARM';
  return 'COLD';
}

/**
 * Create Enhanced Event with automatic enrichment
 */
export function createEnhancedEvent(
  sessionId: string,
  eventType: string,
  eventData: Record<string, any> = {},
  userId?: string
): Partial<UserEvent> {
  return {
    sessionId,
    eventType,
    eventData,
    userId,
    timestamp: new Date() as any, // Will be converted to Firestore Timestamp
    eventCategory: determineEventCategory(eventType),
    device: detectDeviceType(),
    viewport: getViewportSize()
  };
}

/**
 * Helper function to determine event category
 */
function determineEventCategory(eventType: string): EventCategory {
  if (eventType.includes('step') || eventType.includes('navigation')) return 'NAVIGATION';
  if (eventType.includes('conversion') || eventType.includes('submit')) return 'CONVERSION';
  if (eventType.includes('error')) return 'ERROR';
  return 'INTERACTION';
}

/**
 * Helper function to detect device type
 */
function detectDeviceType(): DeviceType {
  if (typeof window === 'undefined') return 'DESKTOP';
  
  const width = window.innerWidth;
  if (width <= 768) return 'MOBILE';
  if (width <= 1024) return 'TABLET';
  return 'DESKTOP';
}

/**
 * Helper function to get viewport size
 */
function getViewportSize(): ViewportSize {
  if (typeof window === 'undefined') return { width: 1920, height: 1080 };
  
  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
}

/**
 * Sanitize User Data
 * 
 * Remove sensitive information and normalize data for storage
 */
export function sanitizeUserData(data: any): any {
  const sanitized = { ...data };
  
  // Remove any potential sensitive fields
  delete sanitized.password;
  delete sanitized.creditCard;
  delete sanitized.ssn;
  
  // Normalize phone number
  if (sanitized.leadPhone) {
    sanitized.leadPhone = sanitized.leadPhone.replace(/[-\s]/g, '');
  }
  
  // Normalize email
  if (sanitized.leadEmail) {
    sanitized.leadEmail = sanitized.leadEmail.toLowerCase().trim();
  }
  
  // Ensure numeric fields are numbers
  USER_PROFILE_VALIDATION.numeric.forEach(field => {
    if (sanitized[field] !== undefined) {
      sanitized[field] = Number(sanitized[field]) || 0;
    }
  });
  
  return sanitized;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Firebase Document Reference Type
 */
export type FirebaseDocumentData = {
  [key: string]: any;
};

/**
 * Analytics Query Options
 */
export interface AnalyticsQueryOptions {
  limit?: number;
  startDate?: Date;
  endDate?: Date;
  eventTypes?: string[];
  sessionIds?: string[];
}

/**
 * Export all types for easy importing
 */
export type {
  UserProfile,
  UserEvent,
  UserSession,
  ScallaCRMPayload,
  EventCategory,
  DeviceType,
  ViewportSize,
  LeadScoringConfig,
  LeadTierConfig
};