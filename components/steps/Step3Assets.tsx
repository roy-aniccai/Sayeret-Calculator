import React, { useState, useCallback } from 'react';
import { useForm } from '../../context/FormContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { formatNumberWithCommas, parseFormattedNumber } from '../../utils/helpers';

// Move InputWithTooltip outside the component to prevent recreation on every render
const InputWithTooltip: React.FC<{
  label: string;
  tooltip: string;
  name: string;
  inputMode?: string;
  suffix?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  icon?: React.ReactNode;
  helperText?: string;
}> = ({ label, tooltip, ...inputProps }) => (
  <div>
    <div className="flex items-center gap-2 mb-2">
      <label className="block text-lg font-semibold text-gray-900">
        {label}
      </label>
      <div className="relative group">
        <i className="fa-solid fa-info-circle text-blue-400 hover:text-blue-600 cursor-help text-sm"></i>
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-white border border-gray-200 shadow-lg text-gray-700 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-20 max-w-xs transform -translate-x-1/2">
          {tooltip}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-white"></div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-px border-4 border-transparent border-t-gray-200"></div>
        </div>
      </div>
    </div>
    <Input {...inputProps} label="" />
  </div>
);

export const Step3Assets: React.FC = () => {
  const { formData, updateFormData, nextStep, prevStep } = useForm();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    updateFormData({ [name]: parseFormattedNumber(value) });
  }, [errors, updateFormData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.propertyValue) newErrors.propertyValue = 'נא להזין שווי נכס';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    nextStep();
  };



  // Calculate loan-to-value ratio
  const totalDebt = formData.mortgageBalance + formData.otherLoansBalance + Math.abs(formData.bankAccountBalance);
  const ltvRatio = formData.propertyValue > 0 ? (totalDebt / formData.propertyValue) * 100 : 0;
  
  const getLtvColor = (ltv: number) => {
    if (ltv <= 60) return 'text-green-600';
    if (ltv <= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getLtvMessage = (ltv: number) => {
    if (ltv <= 60) return 'מצוין! יחס מימון נמוך מאפשר תנאים טובים';
    if (ltv <= 75) return 'טוב! יחס מימון סביר';
    return 'יחס מימון גבוה - עדיין ניתן למחזר';
  };

  return (
    <div className="animate-fade-in-up">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-2 text-center">שווי הנכסים שלך</h2>
      <p className="text-gray-600 text-center mb-8">נדרש לקביעת תנאי המיחזור</p>
      
      <div className="space-y-6">
        <InputWithTooltip
          label="שווי נכס מוערך היום"
          tooltip="קובע את אחוז המימון ותנאי ההלוואה החדשה"
          name="propertyValue"
          inputMode="numeric"
          suffix="₪"
          value={formatNumberWithCommas(formData.propertyValue)}
          onChange={handleChange}
          placeholder="2,500,000"
          error={errors.propertyValue}
          icon={<i className="fa-solid fa-building text-green-500"></i>}
          helperText="ניתן להעריך לפי מחירי שוק או שמאות קודמת"
        />

        {/* LTV Ratio Display */}
        {formData.propertyValue > 0 && totalDebt > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700 font-medium">יחס מימון (LTV):</span>
              <span className={`text-2xl font-bold ${getLtvColor(ltvRatio)}`}>
                {ltvRatio.toFixed(1)}%
              </span>
            </div>
            <p className={`text-sm ${getLtvColor(ltvRatio)}`}>
              {getLtvMessage(ltvRatio)}
            </p>
            <div className="mt-3 text-xs text-gray-500">
              סך חובות: {formatNumberWithCommas(totalDebt)} ₪ / שווי נכס: {formatNumberWithCommas(formData.propertyValue)} ₪
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <div className="flex items-start gap-3">
            <i className="fa-solid fa-chart-line text-blue-600 text-xl mt-1"></i>
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">למה זה חשוב?</h4>
              <p className="text-blue-700 text-sm">
                יחס המימון קובע את הריבית והתנאים שהבנק יציע. 
                ככל שהיחס נמוך יותר, התנאים טובים יותר ואפשרויות החיסכון גדולות יותר.
              </p>
            </div>
          </div>
        </div>

        <Button fullWidth onClick={handleNext} className="mt-8">
          המשך לשלב הבא
        </Button>
        
        <button onClick={prevStep} className="w-full text-gray-400 text-xl mt-6 font-medium">
          חזור אחורה
        </button>
      </div>
    </div>
  );
};