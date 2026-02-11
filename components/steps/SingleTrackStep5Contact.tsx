import React, { useState, useCallback } from 'react';
import { useSingleTrackForm } from '../../context/SingleTrackFormContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Tooltip } from '../ui/Tooltip';
import { Checkbox } from '../ui/Checkbox';

import { useNotification } from '../../context/NotificationContext';
import { submitData, updateSubmission } from '../../utils/api';
import { generateContextualBackText } from '../../utils/navigationContext';
import { TrackType } from '../../types';
import { getTrackConfigSafe } from '../../utils/trackConfig';
import { calculateScenarios, ScenarioInput } from '../../utils/scenarioCalculator';
import { getMaxSavingsScenario } from '../../utils/scenarioHelpers';
import { SimulationResult } from '../../types/analytics';

// Enhanced InputWithTooltip using the new Tooltip component
const InputWithTooltip: React.FC<{
  label: string;
  tooltip: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  inputMode?: "text" | "search" | "email" | "tel" | "url" | "none" | "numeric" | "decimal";
  icon?: React.ReactNode;
  disabled?: boolean;
  autoAdvance?: boolean;
  maxLength?: number;
}> = ({ label, tooltip, ...inputProps }) => (
  <div>
    <div className="flex items-center gap-2 mb-2">
      <label className="block text-lg font-semibold text-gray-900">
        {label}
      </label>
      <Tooltip
        content={tooltip}
        position="auto"
        fontSize="base"
        allowWrap={true}
        maxWidth={280}
      >
        <i className="fa-solid fa-info-circle text-blue-400 hover:text-blue-600 cursor-help text-sm"></i>
      </Tooltip>
    </div>
    <Input {...inputProps} label="" />
  </div>
);

/**
 * SingleTrackStep5Contact - Contact information collection for single-track calculator
 * 
 * This component is adapted from Step4Contact for the single-track flow.
 * It integrates with SingleTrackFormContext and focuses on the monthly reduction track.
 * 
 * Requirements: 1.2, 4.2
 */
export const SingleTrackStep5Contact: React.FC = () => {
  const {
    formData,
    updateFormData,
    nextStep,
    prevStep,
    sessionId,
    trackCampaignEvent,
    trackConversion,
    setSubmissionDocId,
    sendSubmissionUpdate,
    submissionDocId
  } = useSingleTrackForm();

  // Get track configuration for single-track (always MONTHLY_REDUCTION)
  const config = getTrackConfigSafe(TrackType.MONTHLY_REDUCTION);
  const primaryColor = config.ui.primaryColor;

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showErrorAlert } = useNotification();

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === 'checkbox' ? checked : value;

    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    updateFormData({ [name]: finalValue });

    // Track form interaction for campaign analytics
    trackCampaignEvent('single_track_contact_field_change', {
      field: name,
      step: 5,
      hasValue: !!finalValue
    });
  }, [errors, updateFormData, trackCampaignEvent]);

  const validatePhone = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const phoneRegex = /^05[0-58]\d{7}$/;

    // Check for logical spam (repeated or sequential)
    if (/^(\d)\1+$/.test(cleanPhone)) return false; // Repeated
    if ('0123456789'.includes(cleanPhone) || '9876543210'.includes(cleanPhone)) return false; // Sequential

    return phoneRegex.test(cleanPhone);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.leadName.trim()) {
      newErrors.leadName = 'נא להזין שם';
    }

    if (!formData.leadPhone.trim()) {
      newErrors.leadPhone = 'נא להזין מספר טלפון';
    } else if (!validatePhone(formData.leadPhone)) {
      newErrors.leadPhone = 'נא להזין מספר טלפון תקין';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validate()) {
      trackCampaignEvent('single_track_contact_validation_failed', {
        step: 5,
        errors: Object.keys(errors)
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Track contact submission attempt
      trackCampaignEvent('single_track_contact_submit_start', {
        step: 5,
        hasName: !!formData.leadName,
        hasPhone: !!formData.leadPhone,
        isUpdate: !!submissionDocId
      });

      // Calculate scenarios before submission
      const scenarioInput: ScenarioInput = {
        mortgageBalance: formData.mortgageBalance,
        otherLoansBalance: formData.otherLoansBalance,
        currentMortgagePayment: formData.mortgagePayment,
        currentOtherLoansPayment: formData.otherLoansPayment,
        age: formData.age || undefined,
        propertyValue: formData.propertyValue
      };

      const calculationResult = calculateScenarios(scenarioInput);

      // Determine the MAX savings scenario for storage using the helper
      // This ensures we always store the "best case" even if the user sees something else
      const maxScenario = getMaxSavingsScenario(calculationResult);

      // Default fallback logic just in case helper returns null (empty scenarios)
      let scenario: 'HIGH_SAVING' | 'LOW_SAVING' | 'NO_SAVING' = 'NO_SAVING';
      if (maxScenario && maxScenario.monthlyReduction > 0) {
        scenario = maxScenario.monthlyReduction > 500 ? 'HIGH_SAVING' : 'LOW_SAVING';
      } else if (calculationResult.specialCase === 'insufficient-savings') {
        scenario = 'LOW_SAVING';
      }

      const simulationResult: SimulationResult = {
        scenario,
        monthlySavings: maxScenario?.monthlyReduction || 0,
        newMortgageDurationYears: maxScenario?.years || 0,
        canSave: scenario !== 'NO_SAVING',
        timestamp: new Date().toISOString()
      };

      // Prepare payload
      const payload = {
        sessionId,
        leadName: formData.leadName,
        leadPhone: formData.leadPhone,
        mortgageBalance: formData.mortgageBalance,
        otherLoansBalance: formData.otherLoansBalance,
        mortgagePayment: formData.mortgagePayment,
        otherLoansPayment: formData.otherLoansPayment,
        propertyValue: formData.propertyValue,
        age: formData.age || null,
        simulationResult,
        utmParams: formData.utmParams || {},
        interestedInInsurance: formData.interestedInInsurance ?? null
      };

      if (submissionDocId) {
        // UPDATE existing submission
        await updateSubmission(submissionDocId, {
          ...payload,
          contactUpdate: {
            leadName: formData.leadName,
            leadPhone: formData.leadPhone,
            interestedInInsurance: formData.interestedInInsurance
          }
        });

        trackCampaignEvent('single_track_contact_resubmit_success', {
          submissionId: submissionDocId,
          wasUpdate: true
        });
      } else {
        // CREATE new submission
        const submissionResponse = await submitData(payload);

        // Store the submission ID for subsequent updates
        if (submissionResponse && submissionResponse.id) {
          setSubmissionDocId(submissionResponse.id);
        }

        trackCampaignEvent('single_track_contact_submit_success', {
          submissionId: submissionResponse?.id,
          wasUpdate: false
        });
      }

      // Track conversion
      trackConversion('lead_submission', {
        step: 5,
        value: simulationResult.monthlySavings
      });

      // Proceed to next step
      nextStep();
    } catch (error) {
      console.error('Submission failed:', error);
      trackCampaignEvent('single_track_contact_submit_failed', {
        step: 5,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      showErrorAlert(
        'שגיאה בשליחת הנתונים',
        'אירעה שגיאה בשליחת הנתונים. אנא בדוק את החיבור לאינטרנט ונסה שנית.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in-up">
      {/* Promoted Subtitle as Primary Step Title */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">נשלח לך את התוצאות</h2>
      </div>

      <div className="space-y-4 pb-96 md:pb-0">
        <Input
          label="שם מלא"
          name="leadName"
          value={formData.leadName}
          onChange={handleChange}
          placeholder="שם מלא"
          error={errors.leadName}
          icon={<i className="fa-solid fa-user text-blue-500"></i>}
          disabled={isSubmitting}
        />

        <InputWithTooltip
          label="מספר טלפון"
          tooltip="מאמת שאתה לא בוט ומאפשר לנו ליצור קשר לתיאום פגישה"
          name="leadPhone"
          inputMode="tel"
          value={formData.leadPhone}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, ''); // Remove non-digits

            // Allow empty string to clear input
            if (val === '') {
              updateFormData({ leadPhone: '' });
              // Clear specific errors if field is empty (optional, depending on UX preference)
              if (errors.leadPhone) {
                setErrors(prev => {
                  const newErr = { ...prev };
                  delete newErr.leadPhone;
                  return newErr;
                });
              }
              return;
            }

            // Limit to 10 digits
            if (val.length > 10) return;

            // Format for display: 05X-XXXXXXX
            let formatted = val;
            if (val.length > 3) {
              formatted = val.slice(0, 3) + '-' + val.slice(3);
            }

            // Update form data with raw digits (or formatted if preferred, but usually raw is better for storage)
            // Storing formatted for display in input, but stripping for validation/submission might be needed depending on form handling.
            // Here we store the formatted value in the context state to be displayed in the input.
            // The context usually holds the display value for text inputs.
            updateFormData({ leadPhone: formatted });

            // Live Validation
            const newErrors = { ...errors };

            // Check prefix (must be 05X)
            if (val.length >= 2 && val.substring(0, 2) !== '05') {
              newErrors.leadPhone = 'מספר נייד חייב להתחיל ב-05';
            } else if (val.length === 10) {
              // Full length checks
              const prefix = val.substring(0, 3);
              // Valid 3rd digits: 0-5, 8
              if (!['050', '051', '052', '053', '054', '055', '058'].includes(prefix)) {
                newErrors.leadPhone = 'קידומת לא תקינה';
              } else if (/^(\d)\1+$/.test(val)) { // Check for repeated digits (e.g., 0500000000)
                newErrors.leadPhone = 'מספר לא תקין (ספרות חוזרות)';
              } else if ('0123456789'.includes(val) || '9876543210'.includes(val)) { // Sequential
                newErrors.leadPhone = 'מספר לא תקין (ספרות עוקבות)';
              } else {
                delete newErrors.leadPhone; // Valid!
              }
            } else {
              // Partial input - clear error if it was "required" or specific format error that might differ
              if (newErrors.leadPhone !== 'נא להזין מספר טלפון') {
                delete newErrors.leadPhone;
              }
            }
            setErrors(newErrors);
          }}
          placeholder="מספר נייד (05X-XXXXXXX)"
          error={errors.leadPhone}
          icon={<i className="fa-solid fa-phone text-green-500"></i>}
          disabled={isSubmitting}
          autoAdvance={true}
          maxLength={11} // 10 digits + 1 hyphen
        />

        {/* WhatsApp Report Message */}
        <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
          <i className="fa-brands fa-whatsapp text-green-600 text-lg"></i>
          <span className="text-green-700 text-sm font-medium">נשלח לך דוח מפורט לוואטסאפ</span>
        </div>
      </div>

      {/* Submit Actions */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:static md:bg-transparent md:border-t-0 md:shadow-none md:p-0 md:mt-8 space-y-3">

        {/* Privacy assurance - Moved to footer */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <i className="fa-solid fa-shield-check text-green-600 text-lg"></i>
            <div>
              <p className="text-green-700 text-base font-medium">פרטיות מובטחת</p>
              <p className="text-green-600 text-sm">מידע מוצפן ומאובטח</p>
            </div>
          </div>
        </div>



        <Button
          onClick={handleNext}
          className={`w-full text-xl py-4 shadow-xl hover:shadow-2xl transition-all bg-${primaryColor}-600 hover:bg-${primaryColor}-700 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'transform hover:scale-[1.02]'
            }`}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <i className="fa-solid fa-circle-notch fa-spin"></i>
              מעבד נתונים...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              בואו נראה!
              <i className="fa-solid fa-arrow-left mr-2"></i>
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};