import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FormData, TrackType } from '../types';
import { TrackConfig, getTrackConfigSafe } from '../utils/trackConfig';

interface FormContextType {
  step: number;
  setStep: (step: number) => void;
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  resetForm: () => void;
  nextStep: () => void;
  prevStep: () => void;
  
  // Track-specific methods
  getTrackConfig: () => TrackConfig;
  isTrack: (track: TrackType) => boolean;
  getTrackSpecificValidation: (field: string) => any;
  getTrackSpecificStyling: (component: string) => string;
  
  // Track-aware calculation methods
  getTrackOptimizedRange: (baseValue: number) => { min: number; max: number };
  calculateWithTrackPriority: (data: Partial<FormData>) => any;
}

const initialFormData: FormData = {
  // Step 1
  track: null,
  
  // Step 1 - Debts
  mortgageBalance: 1200000,
  otherLoansBalance: 0,
  bankAccountBalance: 0,
  
  // Step 2 - Monthly Payments
  mortgagePayment: 6500,
  otherLoansPayment: 0,
  targetTotalPayment: 6500,
  
  // Step 3 - Assets
  propertyValue: 2500000,
  
  // Step 4 - Contact
  leadName: '',
  leadPhone: '',
  
  // Step 5 - Simulator
  age: null,
  
  // Legacy fields (keeping for compatibility)
  currentPayment: 6500,
  yearsRemaining: 20,
  netIncome: 0,
  addedMonthlyPayment: 0,
  lumpSum: 0,
  standardLoans: 0,
  highInterestLoans: 0,
  loansPayment: 0,
  urgency: null,
  leadEmail: '',
  termsAccepted: true,
};

const FormContext = createContext<FormContextType | undefined>(undefined);

export const FormProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [sessionId] = useState(() => crypto.randomUUID());

  const [startTime, setStartTime] = useState(Date.now());

  useEffect(() => {
    // track initial page view
    import('../utils/api').then(({ trackEvent }) => {
      trackEvent(sessionId, 'session_start');
    });
  }, [sessionId]);

  useEffect(() => {
    const duration = (Date.now() - startTime) / 1000;
    // Log previous step completion time (if not first load)
    if (step > 1 || duration > 1) {
      import('../utils/api').then(({ trackEvent }) => {
        trackEvent(sessionId, 'step_complete', { step: step === 1 ? 'initial' : step - 1, durationSeconds: duration });
      });
    }

    // Log new step view
    import('../utils/api').then(({ trackEvent }) => {
      trackEvent(sessionId, 'step_view', { step });
    });

    setStartTime(Date.now());
  }, [step, sessionId]);

  const updateFormData = (data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setStep(1);
    setStartTime(Date.now());
    import('../utils/api').then(({ trackEvent }) => {
      trackEvent(sessionId, 'form_reset');
    });
  };

  const logEvents = (type: string, data?: any) => {
    import('../utils/api').then(({ trackEvent }) => {
      trackEvent(sessionId, type, data);
    });
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 6));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  // Track-specific methods
  const getTrackConfig = (): TrackConfig => {
    try {
      return getTrackConfigSafe(formData.track);
    } catch (error) {
      console.error('Failed to get track config:', error);
      // Return a minimal fallback config to prevent crashes
      return getTrackConfigSafe(null);
    }
  };

  const isTrack = (track: TrackType): boolean => {
    return formData.track === track;
  };

  const getTrackSpecificValidation = (field: string): any => {
    const config = getTrackConfig();
    
    switch (field) {
      case 'paymentRange':
        return {
          multiplier: config.validation.paymentRangeMultiplier,
          minIncrease: config.validation.minPaymentIncrease
        };
      case 'termYears':
        return {
          maxYears: config.validation.maxTermYears,
          ageWeightFactor: config.validation.ageWeightFactor
        };
      default:
        return {};
    }
  };

  const getTrackSpecificStyling = (component: string): string => {
    const config = getTrackConfig();
    const primaryColor = config.ui.primaryColor;
    
    switch (component) {
      case 'primary':
        return `text-${primaryColor}-900 bg-${primaryColor}-50 border-${primaryColor}-200`;
      case 'button':
        return `bg-${primaryColor}-600 hover:bg-${primaryColor}-700 text-white`;
      case 'accent':
        return `text-${primaryColor}-600`;
      case 'background':
        return `bg-${primaryColor}-50`;
      default:
        return '';
    }
  };

  const getTrackOptimizedRange = (baseValue: number): { min: number; max: number } => {
    const config = getTrackConfig();
    const multiplier = config.validation.paymentRangeMultiplier;
    const minIncrease = config.validation.minPaymentIncrease;
    
    if (formData.track === TrackType.MONTHLY_REDUCTION) {
      // For payment reduction, allow range below current payment
      return {
        min: Math.max(baseValue * (1 - multiplier), 1000), // Minimum 1000 NIS
        max: baseValue
      };
    } else if (formData.track === TrackType.SHORTEN_TERM) {
      // For term shortening, require payment increase
      return {
        min: baseValue + minIncrease,
        max: baseValue * (1 + multiplier)
      };
    }
    
    // Default range
    return {
      min: baseValue * 0.7,
      max: baseValue * 1.3
    };
  };

  const calculateWithTrackPriority = (data: Partial<FormData>) => {
    const fullData = { ...formData, ...data };
    // Import the calculation function dynamically to avoid circular dependencies
    return import('../utils/calculator').then(({ calculateWithTrackPriority }) => 
      calculateWithTrackPriority(fullData)
    );
  };

  return (
    <FormContext.Provider value={{ 
      step, 
      setStep, 
      formData, 
      updateFormData, 
      resetForm, 
      nextStep, 
      prevStep, 
      sessionId, 
      logEvents,
      getTrackConfig,
      isTrack,
      getTrackSpecificValidation,
      getTrackSpecificStyling,
      getTrackOptimizedRange,
      calculateWithTrackPriority
    } as any}>
      {children}
    </FormContext.Provider>
  );
};

export const useForm = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useForm must be used within a FormProvider');
  }
  return context;
};