import React, { useState, useCallback } from 'react';
import { useSingleTrackForm } from '../../context/SingleTrackFormContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Tooltip } from '../ui/Tooltip';
import { formatNumberWithCommas, parseFormattedNumber } from '../../utils/helpers';

// Enhanced InputWithTooltip using the Tooltip component
const InputWithTooltip: React.FC<{
  label: string;
  tooltip: string;
  name: string;
  inputMode?: "search" | "text" | "email" | "tel" | "url" | "none" | "numeric" | "decimal";
  suffix?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  icon?: React.ReactNode;
  helperText?: string;
  autoAdvance?: boolean;
  maxLength?: number;
}> = ({ label, tooltip, ...inputProps }) => {
  return (
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
};

/**
 * SingleTrackStep2Debts - Debt collection step for single-track calculator
 * 
 * This component is adapted from Step1Debts but simplified for single-track use:
 * - Removes track-specific logic and styling
 * - Focuses on monthly reduction flow
 * - Integrates with SingleTrackFormContext
 * - Uses fixed styling instead of dynamic track-based styling
 * 
 * Requirements: 1.2, 4.2
 */
export const SingleTrackStep2Debts: React.FC = () => {
  const { formData, updateFormData, nextStep, prevStep } = useSingleTrackForm();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasOtherLoans, setHasOtherLoans] = useState(formData.hasOtherLoans ?? formData.otherLoansBalance > 0);

  // Fixed styling for single-track (monthly reduction focused)
  const primaryStyling = 'bg-blue-50 border border-blue-200';
  const buttonStyling = 'bg-blue-600 hover:bg-blue-700 text-white';
  const accentStyling = 'text-blue-600';

  // Single-track specific content (focused on monthly reduction)
  const stepContent = {
    stepTitle: 'מצב חובות נוכחי',
    stepDescription: 'נבדוק את המצב הכספי הנוכחי',
    mortgageTooltip: 'נדרש לחישוב הריבית החדשה ואפשרויות המיחזור',
    otherLoansDescription: 'נאחד את כל החובות למשכנתא אחת בריבית נמוכה יותר',
    ctaText: 'המשך לחישוב',
    ctaMessage: 'מידע מדויק = חיסכון מדויק יותר בתשלום החודשי'
  };

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFormattedNumber(value);

    // Clear error when user types
    setErrors(prev => {
      if (prev[name]) {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      }
      return prev;
    });

    updateFormData({ [name]: numValue });
  }, [updateFormData]);

  const handleOtherLoansChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFormattedNumber(e.target.value);
    updateFormData({ otherLoansBalance: value });
  }, [updateFormData]);

  const handleOtherLoansToggle = useCallback((hasLoans: boolean) => {
    setHasOtherLoans(hasLoans);
    updateFormData({
      hasOtherLoans: hasLoans,
      ...(hasLoans ? {} : { otherLoansBalance: 0, otherLoansPayment: 0 }),
    });
  }, [updateFormData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.mortgageBalance) newErrors.mortgageBalance = 'נא להזין יתרת משכנתא';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    nextStep();
  };

  return (
    <div className="animate-fade-in-up">
      {/* Step Title */}
      <div className="text-center mb-6">
        <h2 className={`text-2xl font-bold mb-2 ${accentStyling}`}>
          {stepContent.stepDescription}
        </h2>
      </div>

      {/* Add padding bottom to prevent content from being hidden behind sticky footer */}
      <div className="space-y-4 pb-32 md:pb-0">
        {/* Mortgage Balance */}
        <InputWithTooltip
          label="יתרת משכנתא נוכחית"
          tooltip={stepContent.mortgageTooltip}
          name="mortgageBalance"
          inputMode="numeric"
          suffix="₪"
          value={formatNumberWithCommas(formData.mortgageBalance)}
          onChange={handleChange}
          placeholder="1,200,000"
          error={errors.mortgageBalance}
          icon={<i className={`fa-solid fa-home ${accentStyling.split(' ')[0]}`}></i>}
          autoAdvance={true}
        />

        {/* Other Loans Section */}
        <div className={`${primaryStyling} rounded-lg p-3`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <i className={`fa-solid fa-credit-card ${accentStyling.split(' ')[0]} text-lg`}></i>
              <h3 className="text-base font-semibold text-gray-900">האם יש לך הלוואות נוספות?</h3>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleOtherLoansToggle(true)}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${hasOtherLoans
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                כן
              </button>
              <button
                type="button"
                onClick={() => handleOtherLoansToggle(false)}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${!hasOtherLoans
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                לא
              </button>
            </div>
          </div>

          {hasOtherLoans && (
            <div className="mt-3">
              <p className="text-xs text-gray-600 mb-2">
                {stepContent.otherLoansDescription}
              </p>
              <InputWithTooltip
                label="סך כל ההלוואות האחרות"
                tooltip="כולל אשראי אישי, הלוואת רכב, כרטיס אשראי וכל הלוואה אחרת"
                name="otherLoansBalance"
                inputMode="numeric"
                suffix="₪"
                value={formatNumberWithCommas(formData.otherLoansBalance)}
                onChange={handleOtherLoansChange}
                placeholder="150,000"
                icon={<i className={`fa-solid fa-credit-card ${accentStyling.split(' ')[0]}`}></i>}
                autoAdvance={true}
              />
            </div>
          )}
        </div>
      </div>

      {/* Sticky Footer for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:static md:bg-transparent md:border-t-0 md:shadow-none md:p-0 md:mt-6">
        {/* Validation Errors - Included in sticky footer to be visible */}
        {Object.keys(errors).length > 0 && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 mx-auto max-w-md md:max-w-none">
            <div className="flex items-center text-red-800 font-medium mb-1">
              <i className="fa-solid fa-circle-exclamation ml-2"></i>
              יש לתקן את השגיאות הבאות:
            </div>
            <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
              {Object.values(errors).map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Primary CTA */}
        <Button
          onClick={handleNext}
          className={`w-full text-lg py-3 shadow-lg hover:shadow-xl transition-all ${buttonStyling}`}
        >
          {stepContent.ctaText}
          <i className="fa-solid fa-arrow-left mr-2"></i>
        </Button>
      </div>
    </div>
  );
};