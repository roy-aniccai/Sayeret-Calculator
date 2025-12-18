import React, { useState, useCallback } from 'react';
import { useForm } from '../../context/FormContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { submitData } from '../../utils/api';

// Move InputWithTooltip outside to prevent re-creation
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
}> = ({ label, tooltip, ...inputProps }) => (
  <div>
    <div className="flex items-center gap-2 mb-2">
      <label className="block text-lg font-semibold text-gray-900">
        {label}
      </label>
      <div className="relative group">
        <i className="fa-solid fa-info-circle text-blue-400 hover:text-blue-600 cursor-help text-sm"></i>
        <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-white border border-gray-200 shadow-lg text-gray-700 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-20 max-w-xs">
          {tooltip}
          <div className="absolute top-full left-4 border-4 border-transparent border-t-white"></div>
          <div className="absolute top-full left-4 mt-px border-4 border-transparent border-t-gray-200"></div>
        </div>
      </div>
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
      <h2 className="text-3xl font-extrabold text-gray-900 mb-2 text-center">פרטי קשר</h2>
      <p className="text-gray-600 text-center mb-8">כדי שנוכל להמשיך בתהליך חשוב לנו לוודא שאינך רובוט</p>

      <div className="space-y-6">
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
        />

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
          <div className="flex items-start gap-3">
            <i className="fa-solid fa-shield-check text-green-600 text-xl mt-1"></i>
            <div>
              <h4 className="font-semibold text-green-900 mb-1">פרטיות מובטחת</h4>
              <p className="text-green-700 text-sm">
                כל הפרטים נשמרים בצורה מוצפנת ומשמשים אך ורק לצורך מתן השירות.
                לא נשתף מידע עם צדדים שלישיים ללא הסכמתך המפורשת.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <i className="fa-solid fa-rocket text-blue-600 text-xl mt-1"></i>
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">מה קורה הלאה?</h4>
              <p className="text-blue-700 text-sm">
                תקבל סימולטור אינטראקטיבי שמאפשר לך לשחק עם המספרים ולראות בדיוק
                איך שינויים משפיעים על התשלום החודשי ומספר השנים.
              </p>
            </div>
          </div>
        </div>

        <Button fullWidth onClick={handleNext} className="mt-8" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <i className="fa-solid fa-circle-notch fa-spin"></i>
              מעבד נתונים...
            </span>
          ) : (
            'בואו נראה את התוצאות!'
          )}
        </Button>

        <button
          onClick={prevStep}
          className="w-full text-gray-400 text-xl mt-6 font-medium"
          disabled={isSubmitting}
        >
          חזור אחורה
        </button>
      </div>
    </div>
  );
};