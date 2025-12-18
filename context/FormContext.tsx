import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FormData } from '../types';

interface FormContextType {
  step: number;
  setStep: (step: number) => void;
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  resetForm: () => void;
  nextStep: () => void;
  prevStep: () => void;
}

const initialFormData: FormData = {
  track: null,
  propertyValue: 2500000,
  mortgageBalance: 1200000,
  currentPayment: 6500,
  yearsRemaining: 20,
  netIncome: 0,
  addedMonthlyPayment: 0,
  lumpSum: 0,
  standardLoans: 0,
  highInterestLoans: 0,
  loansPayment: 0,
  urgency: null,
  leadName: 'ישראל ישראלי',
  leadPhone: '050-1234567',
  leadEmail: 'israel@example.com',
  termsAccepted: true,
  // Insurance defaults
  isTwoBorrowers: false,
  borrower1Age: 35,
  borrower1Smoker: false,
  borrower2Age: 35,
  borrower2Smoker: false,
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

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 7));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  return (
    <FormContext.Provider value={{ step, setStep, formData, updateFormData, resetForm, nextStep, prevStep, sessionId, logEvents } as any}>
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