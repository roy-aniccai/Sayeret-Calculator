import React, { useState } from 'react';
import { useForm } from '../../context/FormContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { TrackType } from '../../types';
import { formatNumberWithCommas, parseFormattedNumber } from '../../utils/helpers';

export const Step2Baseline: React.FC = () => {
  const { formData, updateFormData, nextStep, prevStep, setStep } = useForm();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    updateFormData({ [name]: parseFormattedNumber(value) });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.propertyValue) newErrors.propertyValue = 'נא להזין שווי נכס';
    if (!formData.mortgageBalance) newErrors.mortgageBalance = 'נא להזין יתרת משכנתא';
    if (!formData.currentPayment) newErrors.currentPayment = 'נא להזין החזר חודשי';
    if (!formData.yearsRemaining) newErrors.yearsRemaining = 'נא להזין שנים שנותרו';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;

    if (formData.track === TrackType.INSURANCE_ONLY) {
      setStep(6);
    } else {
      nextStep();
    }
  };

  return (
    <div className="animate-fade-in-up">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">נתוני בסיס</h2>
      <div className="space-y-6">
        <Input
          label="שווי נכס מוערך היום"
          name="propertyValue"
          inputMode="numeric"
          suffix="₪"
          value={formatNumberWithCommas(formData.propertyValue)}
          onChange={handleChange}
          placeholder="2,500,000"
          error={errors.propertyValue}
        />

        <Input
          label="יתרת משכנתא (בערך)"
          name="mortgageBalance"
          inputMode="numeric"
          suffix="₪"
          value={formatNumberWithCommas(formData.mortgageBalance)}
          onChange={handleChange}
          placeholder="1,200,000"
          error={errors.mortgageBalance}
        />

        <Input
          label="החזר חודשי (רק משכנתא)"
          name="currentPayment"
          inputMode="numeric"
          suffix="₪"
          value={formatNumberWithCommas(formData.currentPayment)}
          onChange={handleChange}
          placeholder="6,500"
          error={errors.currentPayment}
        />

        <Input
          label="כמה שנים נותרו?"
          name="yearsRemaining"
          type="number"
          icon={<i className="fa-regular fa-calendar"></i>}
          value={formData.yearsRemaining || ''}
          onChange={handleChange}
          placeholder="20"
          hideSpinner={false}
          error={errors.yearsRemaining}
        />

        <Button fullWidth onClick={handleNext} className="mt-6">
          המשך לשלב הבא
        </Button>
        <button onClick={prevStep} className="w-full text-gray-400 text-xl mt-6 font-medium">חזור אחורה</button>
      </div>
    </div>
  );
};