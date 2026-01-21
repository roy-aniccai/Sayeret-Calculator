import React, { useState, useCallback } from 'react';
import { useSingleTrackForm } from '../../context/SingleTrackFormContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Tooltip } from '../ui/Tooltip';
import { Checkbox } from '../ui/Checkbox';
import { MarketingMessage, MARKETING_MESSAGES } from '../ui/MarketingMessage';
import { submitData } from '../../utils/api';
import { generateContextualBackText } from '../../utils/navigationContext';
import { TrackType } from '../../types';
import { getTrackConfigSafe } from '../../utils/trackConfig';

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
    trackConversion
  } = useSingleTrackForm();
  
  // Get track configuration for single-track (always MONTHLY_REDUCTION)
  const config = getTrackConfigSafe(TrackType.MONTHLY_REDUCTION);
  const primaryColor = config.ui.primaryColor;
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    const phoneRegex = /^0[5-9]\d{8}$/;
    return phoneRegex.test(phone.replace(/[-\s]/g, ''));
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
        hasPhone: !!formData.leadPhone
      });

      // Submit data to backend with single-track context
      await submitData({ 
        ...formData, 
        sessionId,
        track: TrackType.MONTHLY_REDUCTION,
        isSingleTrack: true
      });
      
      // Track successful submission
      trackCampaignEvent('single_track_contact_submit_success', {
        step: 5
      });
      
      // Track conversion - user has provided contact information (lead conversion)
      trackConversion('lead_submission', {
        step: 5
      });
      
      // Proceed to next step (simulator)
      nextStep();
    } catch (error) {
      console.error('Submission failed:', error);
      
      // Track submission failure
      trackCampaignEvent('single_track_contact_submit_failed', {
        step: 5,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      alert('אירעה שגיאה בשליחת הנתונים. אנא נסה שנית.');
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
          placeholder="ישראל ישראלי"
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
          onChange={handleChange}
          placeholder="050-1234567"
          error={errors.leadPhone}
          icon={<i className="fa-solid fa-phone text-green-500"></i>}
          disabled={isSubmitting}
          autoAdvance={true}
          maxLength={11}
        />

        {/* Marketing Message for Phone Number Entry */}
        <MarketingMessage
          message={MARKETING_MESSAGES.whatsappReport}
          variant="whatsapp-report"
          className="mt-2"
        />
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