import React, { useState, useCallback } from 'react';
import { useForm } from '../../context/FormContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Tooltip } from '../ui/Tooltip';
import { formatNumberWithCommas, parseFormattedNumber } from '../../utils/helpers';
import { generateContextualBackText } from '../../utils/navigationContext';
import { TrackType } from '../../types';

// Enhanced InputWithTooltip using the new Tooltip component
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
  const { getTrackConfig } = useForm();
  const config = getTrackConfig();
  const primaryColor = config.ui.primaryColor;

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
          <i className={`fa-solid fa-info-circle text-${primaryColor}-400 hover:text-${primaryColor}-600 cursor-help text-sm`}></i>
        </Tooltip>
      </div>
      <Input {...inputProps} label="" />
    </div>
  );
};

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

  // Add state for future funds toggle
  const [hasFutureFunds, setHasFutureFunds] = useState(false);
  const handleFutureFundsToggle = (hasFunds: boolean) => {
    setHasFutureFunds(hasFunds);
    if (!hasFunds) {
      updateFormData({ oneTimePaymentAmount: 0 });
    }
  };

  const isShortenTerm = formData.track === TrackType.SHORTEN_TERM;

  if (isShortenTerm) {
    return (
      <div className="animate-fade-in-up">
        {/* Promoted Subtitle as Primary Step Title */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">סכומים חד-פעמיים עתידיים</h2>
        </div>

        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">האם יש לך סכומים עתידיים?</h3>
            <p className="text-sm text-gray-700 mb-3">
              קרנות השתלמות, ירושות או כל סכום שצפוי להשתחרר ויכול לשמש לצמצום הקרן.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleFutureFundsToggle(true)}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${hasFutureFunds
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-green-50'
                  }`}
              >
                כן
              </button>
              <button
                type="button"
                onClick={() => handleFutureFundsToggle(false)}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${!hasFutureFunds
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-green-50'
                  }`}
              >
                לא
              </button>
            </div>
          </div>

          {hasFutureFunds && (
            <div className="animate-fade-in">
              <InputWithTooltip
                label="סכום חד פעמי צפוי"
                tooltip="סכום זה ישמש להקטנת קרן המשכנתא וקיצור תקופה"
                name="oneTimePaymentAmount"
                inputMode="numeric"
                suffix="₪"
                value={formatNumberWithCommas(formData.oneTimePaymentAmount || 0)}
                onChange={handleChange}
                placeholder="100,000"
                icon={<i className="fa-solid fa-piggy-bank text-green-500"></i>}
                autoAdvance={true}
              />

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3 text-sm text-yellow-800">
                <p className="font-bold mb-1"><i className="fa-solid fa-triangle-exclamation mr-1"></i> שים לב:</p>
                <p>פירעון מוקדם עשוי להיות כרוך בעמלות פירעון. המחשבון מניח שימוש מלא בסכום לצמצום הקרן.</p>
              </div>
            </div>
          )}

          {/* Integrated CTA */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between mt-6">
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-check-circle text-green-600 text-lg"></i>
              <div>
                <p className="text-green-700 text-base font-medium">
                  מוכנים לסימולציה!
                </p>
                <p className="text-green-600 text-sm">
                  נראה כמה שנים אפשר לחסוך
                </p>
              </div>
            </div>
            <Button
              onClick={handleNext}
              className="px-4 py-2 text-base bg-green-600 hover:bg-green-700"
            >
              הצג תוצאות
            </Button>
          </div>

          {/* Secondary CTA for going back */}
          <button onClick={prevStep} className="w-full text-gray-400 text-base mt-4 font-medium hover:text-gray-600 transition-colors">
            {generateContextualBackText(4)}
          </button>
        </div>
      </div>
    );
  }



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
          icon={<i className="fa-solid fa-building text-blue-500"></i>}
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