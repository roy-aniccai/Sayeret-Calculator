import React, { useState, useCallback } from 'react';
import { useSingleTrackForm } from '../../context/SingleTrackFormContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Tooltip } from '../ui/Tooltip';
import { formatNumberWithCommas, parseFormattedNumber, formatInputNumber } from '../../utils/helpers';

// Enhanced InputWithTooltip using the Tooltip component
const InputWithTooltip: React.FC<{
  label: string;
  tooltip: string;
  name: string;
  inputMode?: "search" | "text" | "email" | "tel" | "url" | "numeric" | "none" | "decimal";
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
 * SingleTrackStep4Assets - Assets collection step for single-track calculator
 * 
 * This component is adapted from Step3Assets but simplified for single-track use:
 * - Removes track-specific logic and styling
 * - Focuses on monthly reduction flow
 * - Integrates with SingleTrackFormContext
 * - Uses fixed styling instead of dynamic track-based styling
 * - Always shows monthly reduction focused content
 * 
 * Requirements: 1.2, 4.2
 */
export const SingleTrackStep4Assets: React.FC = () => {
  const { formData, updateFormData, nextStep, prevStep } = useSingleTrackForm();
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fixed styling for single-track (monthly reduction focused)
  const primaryStyling = 'bg-blue-50 border border-blue-200';
  const buttonStyling = 'bg-blue-600 hover:bg-blue-700 text-white';
  const accentStyling = 'text-blue-600';

  // Single-track specific content (focused on additional details)
  const stepContent = {
    stepTitle: 'פרטים נוספים',
    propertyValueTooltip: 'קובע את אחוז המימון ותנאי ההלוואה החדשה',
    propertyValueHelper: 'ניתן להעריך לפי מחירי שוק או שמאות קודמת',
    ctaText: 'המשך לחישוב',
    ctaTitle: 'כמעט סיימנו!',
    ctaMessage: 'עוד כמה פרטים ונוכל לחשב את החיסכון שלך'
  };

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
    if (!formData.age) {
      newErrors.age = 'נא להזין גיל';
    } else if (formData.age < 18) {
      newErrors.age = 'גיל מינימלי: 18 שנים';
    } else if (formData.age > 120) {
      newErrors.age = 'גיל מקסימלי: 120 שנים';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    nextStep();
  };

  // Calculate loan-to-value ratio for internal use only
  const totalDebt = formData.mortgageBalance + formData.otherLoansBalance;
  const ltvRatio = formData.propertyValue > 0 ? (totalDebt / formData.propertyValue) * 100 : 0;

  return (
    <div className="animate-fade-in-up">
      {/* Step Title */}
      <div className="text-center mb-6">
        <h2 className={`text-2xl font-bold mb-2 ${accentStyling}`}>
          {stepContent.stepTitle}
        </h2>
      </div>

      <div className="space-y-4 pb-32 md:pb-0">
        <InputWithTooltip
          label="שווי נכס מוערך היום"
          tooltip={stepContent.propertyValueTooltip}
          name="propertyValue"
          inputMode="numeric"
          value={formatInputNumber(formData.propertyValue)}
          onChange={handleChange}
          placeholder="סכום בש״ח"
          error={errors.propertyValue}
          icon={<i className={`fa-solid fa-building ${accentStyling.split(' ')[0]}`}></i>}
          helperText="ניתן להעריך לפי מחירי שוק או שמאות קודמת"
          autoAdvance={true}
        />

        <InputWithTooltip
          label="גיל הלווה הצעיר ביותר"
          tooltip="הגיל משפיע על תקופת ההלוואה המקסימלית ותנאי המימון"
          name="age"
          inputMode="numeric"
          value={formData.age?.toString() || ''}
          onChange={handleChange}
          placeholder="גיל בשנים"
          error={errors.age}
          icon={<i className={`fa-solid fa-user ${accentStyling.split(' ')[0]}`}></i>}
          helperText="גיל בין 18 ל-120 שנים"
          maxLength={3}
        />

        {/* LTV Ratio Display - REMOVED for simplified UI */}
      </div>

      {/* Sticky Footer for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:static md:bg-transparent md:border-t-0 md:shadow-none md:p-0 md:mt-0">
        {/* Validation Errors */}
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

        {/* Integrated CTA with actionable content */}
        <div className={`${primaryStyling} rounded-xl p-4 flex flex-col gap-4`}>
          <div className="flex items-center gap-3 w-full">
            <div className="bg-blue-100 rounded-full p-2 shrink-0">
              <i className={`fa-solid fa-chart-line ${accentStyling.split(' ')[0]} text-xl`}></i>
            </div>
            <div>
              <p className="text-blue-800 text-lg font-bold leading-tight">
                {stepContent.ctaTitle}
              </p>
              <p className="text-blue-700 text-sm">
                {stepContent.ctaMessage}
              </p>
            </div>
          </div>
          <Button
            onClick={handleNext}
            className={`w-full py-3 text-xl font-bold shadow-lg ${buttonStyling}`}
          >
            {stepContent.ctaText}
            <i className="fa-solid fa-arrow-left mr-2"></i>
          </Button>
        </div>
      </div>
    </div>
  );
};