import React, { useState, useCallback } from 'react';
import { useForm } from '../../context/FormContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Tooltip } from '../ui/Tooltip';
import { formatNumberWithCommas, parseFormattedNumber } from '../../utils/helpers';
import { TrackType } from '../../types';
import { generateContextualBackText } from '../../utils/navigationContext';

// Enhanced InputWithTooltip using the new Tooltip component
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

export const Step1Debts: React.FC = () => {
  const { formData, updateFormData, nextStep, prevStep, getTrackConfig, getTrackSpecificStyling } = useForm();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasOtherLoans, setHasOtherLoans] = useState(formData.otherLoansBalance > 0);
  const [hasBankOverdraft, setHasBankOverdraft] = useState(formData.bankAccountBalance < 0);

  // Get track-specific configuration
  const config = getTrackConfig();
  const primaryStyling = getTrackSpecificStyling('primary');
  const buttonStyling = getTrackSpecificStyling('button');
  const accentStyling = getTrackSpecificStyling('accent');

  // Track-specific content
  const getTrackSpecificContent = () => {
    if (formData.track === TrackType.MONTHLY_REDUCTION) {
      return {
        stepTitle: config.ui.stepTitles[2] || 'מצב חובות נוכחי',
        stepDescription: config.ui.stepDescriptions[2] || 'נבדוק את המצב הכספי הנוכחי',
        mortgageTooltip: config.messaging.tooltips.mortgagePayment || 'נדרש לחישוב הריבית החדשה ואפשרויות המיחזור',
        otherLoansDescription: '',
        overdraftDescription: 'חובות בריבית גבוהה שכדאי לאחד למשכנתא',
        ctaText: config.messaging.ctaTexts.primary || 'המשך לחישוב',
        ctaMessage: 'מידע מדויק = חיסכון מדויק יותר בתשלום החודשי'
      };
    } else if (formData.track === TrackType.SHORTEN_TERM) {
      return {
        stepTitle: config.ui.stepTitles[2] || 'מצב חובות לאיחוד',
        stepDescription: config.ui.stepDescriptions[2] || 'נאחד את כל החובות למשכנתא אחת',
        mortgageTooltip: config.messaging.tooltips.mortgagePayment || 'נדרש לחישוב הריבית החדשה ואפשרויות המיחזור',
        otherLoansDescription: 'נאחד את כל החובות למשכנתא אחת לקיצור שנים',
        overdraftDescription: 'חובות בריבית גבוהה שנאחד למשכנתא לחיסכון מקסימלי',
        ctaText: config.messaging.ctaTexts.primary || 'המשך לחישוב',
        ctaMessage: 'מידע מדויק = חיסכון מקסימלי בשנים ובריבית'
      };
    }

    // Default content
    return {
      stepTitle: 'נתוני משכנתא והלוואות',
      stepDescription: 'נבדוק את המצב הכספי הנוכחי',
      mortgageTooltip: 'נדרש לחישוב הריבית החדשה ואפשרויות המיחזור',
      otherLoansDescription: 'נאחד את כל החובות למשכנתא אחת בריבית נמוכה',
      overdraftDescription: 'חובות בריבית גבוהה שכדאי לאחד למשכנתא',
      ctaText: 'המשך לחישוב',
      ctaMessage: 'מידע מדויק = חיסכון מדויק יותר'
    };
  };

  const trackContent = getTrackSpecificContent();

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

  const handleBankOverdraftChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFormattedNumber(e.target.value);
    updateFormData({ bankAccountBalance: -value });
  }, [updateFormData]);

  const handleOtherLoansToggle = useCallback((hasLoans: boolean) => {
    setHasOtherLoans(hasLoans);
    // Don't reset data when toggling - keep it persistent
  }, []);

  const handleBankOverdraftToggle = useCallback((hasOverdraft: boolean) => {
    setHasBankOverdraft(hasOverdraft);
    // Don't reset data when toggling - keep it persistent
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.mortgageBalance) newErrors.mortgageBalance = 'נא להזין יתרת משכנתא';
    if (formData.track === TrackType.SHORTEN_TERM) {
      if (!formData.propertyValue) newErrors.propertyValue = 'נא להזין שווי נכס';
      if (!formData.yearsRemaining) newErrors.yearsRemaining = 'נא להזין שנים נותרות';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    nextStep();
  };

  // Condition for Shorten Term track
  const isShortenTerm = formData.track === TrackType.SHORTEN_TERM;

  if (isShortenTerm) {
    return (
      <div className={`animate-fade-in-up track-${formData.track || 'default'}`}>
        {/* Promoted Subtitle as Primary Step Title */}
        <div className="text-center mb-6">
          <h2 className={`text-2xl font-bold mb-2 ${accentStyling}`}>
            {trackContent.stepDescription}
          </h2>
        </div>

        {/* Add padding bottom to prevent content from being hidden behind sticky footer */}
        <div className="space-y-4 pb-32 md:pb-0">
          {/* Property Value (Moved from Step 3) */}
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
            icon={<i className={`fa-solid fa-home ${accentStyling.split(' ')[0]}`}></i>}
            autoAdvance={true}
          />

          {/* Mortgage Balance */}
          <InputWithTooltip
            label="יתרת משכנתא נוכחית"
            tooltip={trackContent.mortgageTooltip}
            name="mortgageBalance"
            inputMode="numeric"
            suffix="₪"
            value={formatNumberWithCommas(formData.mortgageBalance)}
            onChange={handleChange}
            placeholder="1,200,000"
            error={errors.mortgageBalance}
            icon={<i className={`fa-solid fa-file-invoice-dollar ${accentStyling.split(' ')[0]}`}></i>}
            autoAdvance={true}
          />

          {/* Remaining Years */}
          <InputWithTooltip
            label="שנים נותרות לסיום המשכנתא"
            tooltip="כ כמה שנים נשארו עד לסיום המשכנתא הנוכחית?"
            name="yearsRemaining"
            inputMode="numeric"
            value={formData.yearsRemaining?.toString() || ''}
            onChange={handleChange}
            placeholder="20"
            error={errors.yearsRemaining}
            icon={<i className={`fa-solid fa-hourglass-half ${accentStyling.split(' ')[0]}`}></i>}
            autoAdvance={true}
          />
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
            {trackContent.ctaText}
            <i className="fa-solid fa-arrow-left mr-2"></i>
          </Button>
        </div>


      </div>
    );
  }

  return (
    <div className={`animate-fade-in-up track-${formData.track || 'default'}`}>
      {/* Promoted Subtitle as Primary Step Title */}
      <div className="text-center mb-6">
        <h2 className={`text-2xl font-bold mb-2 ${accentStyling}`}>
          {trackContent.stepDescription}
        </h2>
      </div>

      {/* Add padding bottom to prevent content from being hidden behind sticky footer */}
      <div className="space-y-4 pb-32 md:pb-0">
        {/* Mortgage Balance */}
        <InputWithTooltip
          label="יתרת משכנתא נוכחית"
          tooltip={trackContent.mortgageTooltip}
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
              <div>
                <h3 className="text-base font-semibold text-gray-900">תרצה להוסיף הלוואות נוספות לבדיקה?</h3>
                <p className="text-xs text-gray-500 mt-1">במידה וישנן הלוואות נוספות רצוי ולרוב ניתן להכניסן תחת המשכנתא וכך להנות מפריסה ארוכה וריבית נמוכה</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleOtherLoansToggle(true)}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${hasOtherLoans
                  ? buttonStyling.replace('hover:bg-', 'bg-').split(' ')[0] + ' text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                כן
              </button>
              <button
                type="button"
                onClick={() => handleOtherLoansToggle(false)}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${!hasOtherLoans
                  ? buttonStyling.replace('hover:bg-', 'bg-').split(' ')[0] + ' text-white'
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
                {trackContent.otherLoansDescription}
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

        {/* Bank Overdraft Section */}
        <div className={`${primaryStyling} rounded-lg p-3`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <i className={`fa-solid fa-university ${accentStyling.split(' ')[0]} text-lg`}></i>
              <h3 className="text-base font-semibold text-gray-900">האם יש מינוס בבנק?</h3>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleBankOverdraftToggle(true)}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${hasBankOverdraft
                  ? buttonStyling.replace('hover:bg-', 'bg-').split(' ')[0] + ' text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                כן
              </button>
              <button
                type="button"
                onClick={() => handleBankOverdraftToggle(false)}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${!hasBankOverdraft
                  ? buttonStyling.replace('hover:bg-', 'bg-').split(' ')[0] + ' text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                לא
              </button>
            </div>
          </div>

          {hasBankOverdraft && (
            <div className="mt-3">
              <p className="text-xs text-gray-600 mb-2">
                {trackContent.overdraftDescription}
              </p>
              <InputWithTooltip
                label="סכום המינוס הממוצע"
                tooltip="הסכום הממוצע שאתה במינוס בחשבון הבנק - חוב בריבית גבוהה"
                name="bankOverdraftAmount"
                inputMode="numeric"
                suffix="₪"
                value={formatNumberWithCommas(Math.abs(formData.bankAccountBalance))}
                onChange={handleBankOverdraftChange}
                placeholder="5,000"
                icon={<i className={`fa-solid fa-university ${accentStyling.split(' ')[0]}`}></i>}
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
          {trackContent.ctaText}
          <i className="fa-solid fa-arrow-left mr-2"></i>
        </Button>
      </div>


    </div>
  );
};