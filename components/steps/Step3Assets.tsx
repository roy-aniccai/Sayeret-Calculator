import React, { useState, useCallback } from 'react';
import { useForm } from '../../context/FormContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Tooltip } from '../ui/Tooltip';
import { formatNumberWithCommas, parseFormattedNumber } from '../../utils/helpers';
import { generateContextualBackText } from '../../utils/navigationContext';

// Enhanced InputWithTooltip using the new Tooltip component
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
      {/* Promoted Subtitle as Primary Step Title */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">נבדוק את שווי הנכסים</h2>
      </div>
      
      <div className="space-y-4">
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
          autoAdvance={true}
        />

        {/* LTV Ratio Display */}
        {formData.propertyValue > 0 && totalDebt > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700 font-medium text-base">יחס מימון (LTV):</span>
              <span className={`text-xl font-bold ${getLtvColor(ltvRatio)}`}>
                {ltvRatio.toFixed(1)}%
              </span>
            </div>
            <p className={`text-base ${getLtvColor(ltvRatio)}`}>
              {getLtvMessage(ltvRatio)}
            </p>
            <div className="mt-2 text-sm text-gray-500">
              סך חובות: {formatNumberWithCommas(totalDebt)} ₪ / שווי נכס: {formatNumberWithCommas(formData.propertyValue)} ₪
            </div>
          </div>
        )}

        {/* Integrated CTA with actionable content */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <i className="fa-solid fa-chart-line text-blue-600 text-lg"></i>
            <div>
              <p className="text-blue-700 text-base font-medium">
                יחס מימון נמוך = תנאים טובים יותר
              </p>
              <p className="text-blue-600 text-sm">
                ככל שהיחס נמוך יותר, החיסכון גדול יותר
              </p>
            </div>
          </div>
          <Button 
            onClick={handleNext} 
            className="px-4 py-2 text-base bg-blue-600 hover:bg-blue-700"
          >
            המשך לחישוב
          </Button>
        </div>

        {/* Secondary CTA for going back */}
        <button onClick={prevStep} className="w-full text-gray-400 text-base mt-4 font-medium hover:text-gray-600 transition-colors">
          {generateContextualBackText(4)}
        </button>
      </div>
    </div>
  );
};