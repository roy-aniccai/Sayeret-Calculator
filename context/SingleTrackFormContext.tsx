import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TrackType } from '../types';
import { 
  validateAndFallbackCampaignData, 
  getDefaultSingleTrackExperience,
  type CampaignData 
} from '../utils/campaignUrlParser';

// Single track form data interface tailored to single-track flow
interface SingleTrackFormData {
  // Step tracking
  step: number;
  
  // Step 2 - Debts (excludes bank overdraft for single-track)
  mortgageBalance: number;
  otherLoansBalance: number;
  
  // Step 3 - Monthly Payments (same as original)
  mortgagePayment: number;
  otherLoansPayment: number;
  targetTotalPayment: number;
  
  // Step 4 - Assets (same as original)
  propertyValue: number;
  
  // Step 5 - Contact (same as original)
  leadName: string;
  leadPhone: string;
  interestedInInsurance?: boolean;
  
  // Step 6 - Simulator (same as original)
  age: number | null;
  oneTimePaymentAmount: number;
  
  // Campaign tracking (new)
  campaignId?: string;
  utmParams?: Record<string, string>;
  landingPageViewed?: boolean;
}

// Campaign data interface for URL parameter handling (imported from utils)
// Using the robust CampaignData interface from campaignUrlParser

// Single track form context interface
interface SingleTrackFormContextType {
  step: number;
  setStep: (step: number) => void;
  formData: SingleTrackFormData;
  updateFormData: (data: Partial<SingleTrackFormData>) => void;
  resetForm: () => void;
  nextStep: () => void;
  prevStep: () => void;
  
  // Campaign-specific methods
  campaignData: CampaignData;
  setCampaignData: (data: CampaignData) => void;
  trackCampaignEvent: (eventType: string, eventData?: any) => void;
  trackConversion: (conversionType: string, conversionData?: any) => void;
  
  // Single-track specific methods
  getTrack: () => TrackType;
  isMonthlyReductionTrack: () => boolean;
  
  // Session tracking
  sessionId: string;
}

// Helper function to safely convert legacy data to SingleTrackFormData
const sanitizeLegacyFormData = (data: any): Partial<SingleTrackFormData> => {
  const { bankAccountBalance, ...cleanData } = data;
  
  // Log warning if legacy field is detected
  if (bankAccountBalance !== undefined) {
    console.warn('SingleTrackFormContext: Removing legacy bankAccountBalance field from form data');
  }
  
  return cleanData;
};

// Initial form data with defaults for monthly reduction track
const initialSingleTrackFormData: SingleTrackFormData = {
  // Step tracking
  step: 1,
  
  // Step 2 - Debts (excludes bank overdraft)
  mortgageBalance: 1200000,
  otherLoansBalance: 0,
  
  // Step 3 - Monthly Payments
  mortgagePayment: 6500,
  otherLoansPayment: 0,
  targetTotalPayment: 6500,
  
  // Step 4 - Assets
  propertyValue: 2500000,
  
  // Step 5 - Contact
  leadName: '',
  leadPhone: '',
  interestedInInsurance: false,
  
  // Step 6 - Simulator
  age: null,
  oneTimePaymentAmount: 0,
  
  // Campaign tracking
  campaignId: undefined,
  utmParams: {},
  landingPageViewed: false,
};

// Initial campaign data with error handling
const initialCampaignData: CampaignData = getDefaultSingleTrackExperience();

// Create the context
const SingleTrackFormContext = createContext<SingleTrackFormContextType | undefined>(undefined);

/**
 * SingleTrackFormProvider - Independent form context for single-track calculator
 * 
 * This provider manages form state specifically for the monthly reduction track,
 * including campaign tracking and UTM parameter handling with comprehensive error handling.
 * 
 * Requirements: 1.1, 5.2
 */
export const SingleTrackFormProvider: React.FC<{ 
  children: ReactNode;
  initialCampaignData?: CampaignData;
  initialFormData?: Partial<SingleTrackFormData>;
}> = ({ children, initialCampaignData, initialFormData }) => {
  const [step, setStep] = useState(initialFormData?.step || 1);
  const [formData, setFormData] = useState<SingleTrackFormData>(() => {
    // Sanitize initial form data to remove any legacy fields
    const sanitizedInitialData = initialFormData ? sanitizeLegacyFormData(initialFormData) : {};
    return {
      ...initialSingleTrackFormData,
      ...sanitizedInitialData,
    };
  });
  
  // Use robust campaign data validation
  const [campaignData, setCampaignDataState] = useState<CampaignData>(() => {
    if (initialCampaignData) {
      return validateAndFallbackCampaignData(initialCampaignData);
    }
    return getDefaultSingleTrackExperience();
  });
  
  const [sessionId] = useState(() => {
    try {
      return crypto.randomUUID();
    } catch (error) {
      console.warn('crypto.randomUUID not available, using fallback:', error);
      return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  });
  const [startTime, setStartTime] = useState(Date.now());

  // Initialize campaign data with comprehensive error handling
  useEffect(() => {
    const initializeCampaignData = () => {
      try {
        // Use provided initial data if available
        if (initialCampaignData) {
          const validatedData = validateAndFallbackCampaignData(initialCampaignData);
          setCampaignDataState(validatedData);
          
          // Update form data with campaign information
          setFormData(prev => ({
            ...prev,
            campaignId: validatedData.campaignId,
            utmParams: validatedData.utmParams || {},
          }));
          
          // Log initialization with error context
          if (validatedData.errors.length > 0) {
            console.warn('Campaign data initialized with warnings:', validatedData.errors);
          }
          
          return validatedData;
        }
        
        // Fallback to default experience
        const defaultData = getDefaultSingleTrackExperience();
        setCampaignDataState(defaultData);
        
        setFormData(prev => ({
          ...prev,
          campaignId: defaultData.campaignId,
          utmParams: defaultData.utmParams || {},
        }));
        
        return defaultData;
      } catch (error) {
        console.error('Error initializing campaign data:', error);
        
        // Use default experience on error
        const fallbackData = getDefaultSingleTrackExperience();
        fallbackData.errors.push(`Initialization error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        
        setCampaignDataState(fallbackData);
        setFormData(prev => ({
          ...prev,
          campaignId: fallbackData.campaignId,
          utmParams: fallbackData.utmParams || {},
        }));
        
        return fallbackData;
      }
    };

    const initializedData = initializeCampaignData();

    // Track initial session start with error context
    trackCampaignEvent('single_track_session_start', {
      campaignData: initializedData,
      track: TrackType.MONTHLY_REDUCTION,
      hasErrors: initializedData.errors.length > 0,
      errorCount: initializedData.errors.length,
    });
  }, [initialCampaignData]);

  // Track step changes with error handling
  useEffect(() => {
    try {
      const duration = (Date.now() - startTime) / 1000;
      
      // Log previous step completion time (if not first load)
      if (step > 1 || duration > 1) {
        trackCampaignEvent('single_track_step_complete', {
          step: step === 1 ? 'initial' : step - 1,
          durationSeconds: duration,
          track: TrackType.MONTHLY_REDUCTION,
        });
      }

      // Log new step view
      trackCampaignEvent('single_track_step_view', {
        step,
        track: TrackType.MONTHLY_REDUCTION,
      });

      // Mark landing page as viewed when user reaches step 1
      if (step === 1 && !formData.landingPageViewed) {
        setFormData(prev => ({ ...prev, landingPageViewed: true }));
      }

      setStartTime(Date.now());
    } catch (error) {
      console.error('Error tracking step change:', error);
    }
  }, [step]);

  // Update form data function with validation and legacy data handling
  const updateFormData = (data: Partial<SingleTrackFormData>) => {
    try {
      // Filter out any legacy bankAccountBalance field that might be passed
      const { bankAccountBalance, ...cleanData } = data as any;
      
      // Log warning if legacy field is detected
      if (bankAccountBalance !== undefined) {
        console.warn('SingleTrackFormContext: Ignoring legacy bankAccountBalance field in single-track calculator');
      }
      
      setFormData((prev) => ({ ...prev, ...cleanData }));
    } catch (error) {
      console.error('Error updating form data:', error);
    }
  };

  // Reset form function - returns to landing page while preserving campaign data
  const resetForm = () => {
    try {
      const preservedCampaignData = {
        campaignId: formData.campaignId,
        utmParams: formData.utmParams,
      };
      
      setFormData({
        ...initialSingleTrackFormData,
        ...preservedCampaignData,
      });
      setStep(1);
      setStartTime(Date.now());
      
      trackCampaignEvent('single_track_form_reset', {
        track: TrackType.MONTHLY_REDUCTION,
        campaignData,
      });
    } catch (error) {
      console.error('Error resetting form:', error);
      
      // Force basic reset on error
      setFormData(initialSingleTrackFormData);
      setStep(1);
      setStartTime(Date.now());
    }
  };

  // Navigation functions with bounds checking and error handling
  const nextStep = () => {
    try {
      const newStep = Math.min(Math.max(step + 1, 1), 6);
      setStep(newStep);
      
      // Track step progression
      trackCampaignEvent('single_track_step_next', {
        fromStep: step,
        toStep: newStep,
        track: TrackType.MONTHLY_REDUCTION,
      });
    } catch (error) {
      console.error('Error navigating to next step:', error);
    }
  };

  const prevStep = () => {
    try {
      const newStep = Math.min(Math.max(step - 1, 1), 6);
      setStep(newStep);
      
      // Track step regression
      trackCampaignEvent('single_track_step_prev', {
        fromStep: step,
        toStep: newStep,
        track: TrackType.MONTHLY_REDUCTION,
      });
    } catch (error) {
      console.error('Error navigating to previous step:', error);
    }
  };

  // Campaign data setter with validation and event tracking
  const setCampaignData = (data: CampaignData) => {
    try {
      const validatedData = validateAndFallbackCampaignData(data);
      setCampaignDataState(validatedData);
      
      // Update form data with campaign information
      setFormData(prev => ({
        ...prev,
        campaignId: validatedData.campaignId,
        utmParams: validatedData.utmParams || {},
      }));
      
      trackCampaignEvent('single_track_campaign_data_updated', {
        campaignData: validatedData,
        track: TrackType.MONTHLY_REDUCTION,
        hasErrors: validatedData.errors.length > 0,
      });
    } catch (error) {
      console.error('Error setting campaign data:', error);
    }
  };

  // Campaign event tracking function with error handling
  const trackCampaignEvent = (eventType: string, eventData?: any) => {
    try {
      const eventPayload = {
        sessionId,
        eventType,
        timestamp: new Date().toISOString(),
        track: TrackType.MONTHLY_REDUCTION,
        campaignData,
        step,
        ...eventData,
      };
      
      // Log to console for development (replace with actual analytics in production)
      console.log('Single Track Campaign Event:', eventPayload);
      
      // Import and call actual tracking function dynamically with error handling
      import('../utils/api').then(({ trackEvent }) => {
        trackEvent(sessionId, eventType, eventPayload);
      }).catch(error => {
        console.warn('Failed to track campaign event:', error);
        // Continue operation even if tracking fails
      });
    } catch (error) {
      console.error('Error in trackCampaignEvent:', error);
      // Don't throw - tracking failures shouldn't break the app
    }
  };

  // Dedicated conversion tracking method with error handling
  const trackConversion = (conversionType: string, conversionData?: any) => {
    try {
      const conversionPayload = {
        sessionId,
        eventType: 'single_track_conversion',
        conversionType,
        timestamp: new Date().toISOString(),
        track: TrackType.MONTHLY_REDUCTION,
        campaignData,
        step,
        formData,
        ...conversionData,
      };
      
      // Log conversion event
      console.log('Single Track Conversion:', conversionPayload);
      
      // Track conversion event
      trackCampaignEvent('single_track_conversion', conversionPayload);
      
      // Also send to dedicated conversion endpoint if available
      import('../utils/api').then(({ trackEvent }) => {
        trackEvent(sessionId, 'conversion', conversionPayload);
      }).catch(error => {
        console.warn('Failed to track conversion:', error);
        // Continue operation even if tracking fails
      });
    } catch (error) {
      console.error('Error in trackConversion:', error);
      // Don't throw - tracking failures shouldn't break the app
    }
  };

  // Single-track specific methods
  const getTrack = (): TrackType => {
    return TrackType.MONTHLY_REDUCTION;
  };

  const isMonthlyReductionTrack = (): boolean => {
    return true; // Always true for single-track calculator
  };

  const contextValue: SingleTrackFormContextType = {
    step,
    setStep,
    formData,
    updateFormData,
    resetForm,
    nextStep,
    prevStep,
    campaignData,
    setCampaignData,
    trackCampaignEvent,
    trackConversion,
    getTrack,
    isMonthlyReductionTrack,
    sessionId,
  };

  return (
    <SingleTrackFormContext.Provider value={contextValue}>
      {children}
    </SingleTrackFormContext.Provider>
  );
};

/**
 * useSingleTrackForm - Hook to access single-track form context
 * 
 * This hook provides access to the single-track form state and methods.
 * Must be used within a SingleTrackFormProvider.
 */
export const useSingleTrackForm = () => {
  const context = useContext(SingleTrackFormContext);
  if (!context) {
    throw new Error('useSingleTrackForm must be used within a SingleTrackFormProvider');
  }
  return context;
};

export default SingleTrackFormContext;