import React, { useState, useCallback } from 'react';
import { useForm } from '../../context/FormContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Tooltip } from '../ui/Tooltip';
import { submitData } from '../../utils/api';

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

export const Step4Contact: React.FC = () => {
  // cast useForm to any to access sessionId if strictly typed interface doesn't have it yet
  const { formData, updateFormData, nextStep, prevStep, sessionId } = useForm() as any;
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    updateFormData({ [name]: value });
  }, [errors, updateFormData]);

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
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // Submit data to backend
      await submitData({ ...formData, sessionId });
      // Proceed to next step regardless of backend result? 
      // Usually better to block if it fails, but for lead capture sometimes we want to be permissive.
      // Here we will block and show error on failure to ensure data quality.
      nextStep();
    } catch (error) {
      console.error('Submission failed:', error);
      alert('אירעה שגיאה בשליחת הנתונים. אנא נסה שנית.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in-up">
      {/* Compact Step Header */}
      <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">פרטי קשר</h2>

      <div className="space-y-4">
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

        {/* Privacy assurance integrated with CTA */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <i className="fa-solid fa-shield-check text-green-600 text-lg"></i>
            <div>
              <p className="text-green-700 text-base font-medium">פרטיות מובטחת</p>
              <p className="text-green-600 text-sm">מידע מוצפן ומאובטח</p>
            </div>
          </div>
        </div>

        {/* Main CTA with actionable content */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <i className="fa-solid fa-rocket text-blue-600 text-lg"></i>
            <div>
              <p className="text-blue-700 text-base font-medium">קבל סימולטור אינטראקטיבי</p>
              <p className="text-blue-600 text-sm">שחק עם המספרים וראה את החיסכון</p>
            </div>
          </div>
          <Button 
            onClick={handleNext} 
            className="px-4 py-2 text-base bg-blue-600 hover:bg-blue-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <i className="fa-solid fa-circle-notch fa-spin"></i>
                מעבד...
              </span>
            ) : (
              'בואו נראה!'
            )}
          </Button>
        </div>

        {/* Secondary CTA for going back */}
        <button
          onClick={prevStep}
          className="w-full text-gray-400 text-base mt-4 font-medium hover:text-gray-600 transition-colors"
          disabled={isSubmitting}
        >
          חזור אחורה
        </button>
      </div>
    </div>
  );
};