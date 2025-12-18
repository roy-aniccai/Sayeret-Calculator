import React, { useState } from 'react';
import { useForm } from '../../context/FormContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export const Step4Lead: React.FC = () => {
  const { formData, updateFormData, nextStep, prevStep, sessionId } = useForm() as any;
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.leadName || formData.leadName.length < 2) {
      newErrors.leadName = 'נא להזין שם מלא תקין';
    }

    if (!formData.leadPhone || formData.leadPhone.length < 9) {
      newErrors.leadPhone = 'נא להזין מספר טלפון תקין';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.leadEmail && !emailRegex.test(formData.leadEmail)) {
      newErrors.leadEmail = 'כתובת מייל לא תקינה';
    }

    if (!formData.termsAccepted) {
      newErrors.terms = 'חובה לאשר את תנאי השימוש';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const { logEvents } = useForm() as any;
      if (logEvents) {
        logEvents('validation_error', { step: 4, errors: Object.keys(newErrors) });
      }
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const { submitData } = await import('../../utils/api');
      // Pass sessionId along with formData
      await submitData({ ...formData, sessionId });
      nextStep();
    } catch (error) {
      alert('אירעה שגיאה בשליחת הטופס. נסה שנית.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    updateFormData({ [name]: value });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (errors.terms) {
      setErrors(prev => ({ ...prev, terms: '' }));
    }
    updateFormData({ termsAccepted: e.target.checked });
  };

  return (
    <div className="animate-fade-in-up">
      <div className="text-center mb-8">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 text-5xl animate-pulse">
          <i className="fa-solid fa-check"></i>
        </div>
        <h2 className="text-4xl font-extrabold text-gray-900 mb-3">הניתוח מוכן!</h2>
        <p className="text-gray-600 text-xl">נמצאה הזדמנות משמעותית.<br />הזן פרטים לקבלת הדוח המלא.</p>
      </div>

      <div className="space-y-6">
        <Input
          name="leadName"
          value={formData.leadName}
          onChange={handleChange}
          placeholder="שם מלא"
          error={errors.leadName}
        />
        <Input
          name="leadPhone"
          type="tel"
          value={formData.leadPhone}
          onChange={handleChange}
          placeholder="מספר נייד"
          dir="ltr"
          className="text-right"
          error={errors.leadPhone}
        />
        <Input
          name="leadEmail"
          type="email"
          value={formData.leadEmail}
          onChange={handleChange}
          placeholder="מייל (לדוח)"
          dir="ltr"
          className="text-left"
          error={errors.leadEmail}
        />

        <div>
          <div className="flex items-start px-2">
            <input
              id="terms"
              type="checkbox"
              checked={formData.termsAccepted}
              onChange={handleCheckboxChange}
              className={`w-6 h-6 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 mt-1 ${errors.terms ? 'border-red-500 ring-2 ring-red-200' : ''}`}
            />
            <label htmlFor="terms" className="mr-3 text-lg text-gray-600 select-none cursor-pointer">
              אני מאשר קבלת פנייה בנוגע לבדיקת המשכנתא ודברי פרסומת.
            </label>
          </div>
          {errors.terms && <p className="text-lg text-red-600 mt-2 font-medium pr-2">{errors.terms}</p>}
        </div>

        <Button variant="success" fullWidth onClick={handleNext} className="flex items-center justify-center gap-3 py-6">
          <span>הצג את התוצאות שלי</span>
          <i className="fa-solid fa-lock"></i>
        </Button>
        <button onClick={prevStep} className="w-full text-gray-400 text-xl mt-6 font-medium">חזור אחורה</button>
      </div>
    </div>
  );
};