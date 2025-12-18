import React, { useState } from 'react';
import { useForm } from '../../context/FormContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { TrackType, UrgencyLevel } from '../../types';
import { formatNumberWithCommas, parseFormattedNumber } from '../../utils/helpers';

export const Step3Details: React.FC = () => {
  const { formData, updateFormData, nextStep, prevStep } = useForm();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    updateFormData({ [name]: parseFormattedNumber(value) });
  };

  const handleUrgencyChange = (level: UrgencyLevel) => {
    if (errors.urgency) {
      setErrors(prev => ({ ...prev, urgency: '' }));
    }
    updateFormData({ urgency: level });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (formData.track === TrackType.MONTHLY_REDUCTION) {
      if (!formData.netIncome) newErrors.netIncome = 'נא להזין הכנסה נטו';
      if (!formData.urgency) newErrors.urgency = 'נא לבחור רמת דחיפות';
    } 
    else if (formData.track === TrackType.CONSOLIDATION) {
      if (!formData.netIncome) newErrors.netIncome = 'נא להזין הכנסה נטו';
      if (!formData.loansPayment) newErrors.loansPayment = 'נא להזין החזר חודשי';
      if (formData.standardLoans === 0 && formData.highInterestLoans === 0) {
        newErrors.standardLoans = 'נא להזין סכום הלוואות (רגילות או חריגות)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    nextStep();
  };

  const renderContent = () => {
    switch (formData.track) {
      case TrackType.MONTHLY_REDUCTION:
        return (
          <>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">עוד רגע שם...</h2>
            <Input
              label="הכנסה נטו משפחתית?"
              name="netIncome"
              inputMode="numeric"
              suffix="₪"
              value={formatNumberWithCommas(formData.netIncome)}
              onChange={handleChange}
              error={errors.netIncome}
            />
            
            <label className="block text-xl font-bold text-gray-800 mb-4">דחיפות להורדת ההחזר?</label>
            <div className="grid grid-cols-2 gap-4">
              <div 
                onClick={() => handleUrgencyChange(UrgencyLevel.HIGH)}
                className={`border-2 p-6 rounded-2xl text-center cursor-pointer transition-all text-xl font-bold ${formData.urgency === UrgencyLevel.HIGH ? 'bg-blue-50 border-blue-600 text-blue-800 ring-2 ring-blue-200' : 'border-gray-200 hover:border-blue-300'}`}
              >
                דחוף מאוד
              </div>
              <div 
                onClick={() => handleUrgencyChange(UrgencyLevel.MEDIUM)}
                className={`border-2 p-6 rounded-2xl text-center cursor-pointer transition-all text-xl font-bold ${formData.urgency === UrgencyLevel.MEDIUM ? 'bg-blue-50 border-blue-600 text-blue-800 ring-2 ring-blue-200' : 'border-gray-200 hover:border-blue-300'}`}
              >
                נחמד אם אפשר
              </div>
            </div>
            {errors.urgency && <p className="text-lg text-red-600 mt-2 font-medium">{errors.urgency}</p>}
          </>
        );

      case TrackType.SHORTEN_TERM:
        return (
          <>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">בדיקת יכולת האצה</h2>
            <label className="block text-xl font-bold text-gray-800 mb-4">כמה *עוד* תוכל להוסיף להחזר?</label>
            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 mb-8">
              <div className="flex justify-between items-center mb-6">
                <span className="text-lg text-gray-500 font-medium">ללא שינוי</span>
                <span className="text-3xl font-extrabold text-blue-600">+{formatNumberWithCommas(formData.addedMonthlyPayment)} ₪</span>
                <span className="text-lg text-gray-500 font-medium">+2k</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="2000" 
                step="50" 
                value={formData.addedMonthlyPayment}
                onChange={(e) => updateFormData({ addedMonthlyPayment: parseInt(e.target.value) })}
                className="w-full h-4 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <Input
              label="סכומים עתידיים? (קה'ש/ירושה)"
              name="lumpSum"
              type="text"
              inputMode="numeric"
              value={formatNumberWithCommas(formData.lumpSum)}
              onChange={handleChange}
              placeholder="אם אין, השאר ריק"
            />
          </>
        );

      case TrackType.CONSOLIDATION:
        return (
          <>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">איחוד התחייבויות</h2>
            
            <Input
              label="הכנסה נטו משפחתית"
              name="netIncome"
              inputMode="numeric"
              suffix="₪"
              value={formatNumberWithCommas(formData.netIncome)}
              onChange={handleChange}
              error={errors.netIncome}
            />

            <div className="space-y-4">
              <Input
                label="הלוואות רגילות / רכב"
                name="standardLoans"
                inputMode="numeric"
                suffix="₪"
                value={formatNumberWithCommas(formData.standardLoans)}
                onChange={handleChange}
                placeholder="יתרה כוללת"
                error={errors.standardLoans}
              />
              
              <Input
                label='חובות "רעים" (אשראי/מינוס)'
                name="highInterestLoans"
                inputMode="numeric"
                suffix="₪"
                className="border-red-200 focus:border-red-500"
                value={formatNumberWithCommas(formData.highInterestLoans)}
                onChange={handleChange}
                placeholder="יתרה כוללת"
              />
              
              <Input
                label="החזר חודשי על ההלוואות?"
                name="loansPayment"
                inputMode="numeric"
                suffix="₪"
                value={formatNumberWithCommas(formData.loansPayment)}
                onChange={handleChange}
                placeholder="לדוגמה: 4,000"
                error={errors.loansPayment}
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="animate-fade-in-up">
      {renderContent()}
      <Button fullWidth onClick={handleNext} className="mt-8">
        נתח נתונים
      </Button>
      <button onClick={prevStep} className="w-full text-gray-400 text-xl mt-6 font-medium">חזור אחורה</button>
    </div>
  );
};