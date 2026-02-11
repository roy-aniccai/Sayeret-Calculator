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
      <div className="flex items-center gap-2 mb-1">
        <label className="block text-base font-semibold text-gray-900">
          {label}
        </label>
        <Tooltip
          content={tooltip}
          position="auto"
          fontSize="base"
          allowWrap={true}
          maxWidth={280}
        >
          <i className="fa-solid fa-info-circle text-blue-400 hover:text-blue-600 cursor-help text-xs"></i>
        </Tooltip>
      </div>
      <Input {...inputProps} label="" className="py-2" />
    </div>
  );
};

interface Recommendation {
  id: number;
  name: string;
  details: string;
  text: string;
  stars: number;
}

const RECOMMENDATIONS: Recommendation[] = [
  {
    id: 1,
    name: "יפה",
    details: "53, קרית עקרון",
    text: "נתקלתי במקרה במחשבון באינטרנט, הקלדתי את נתוני המשכנתא שלי והוצג לי שאני יכולה לצמצם את הוצאת המשכנתא ב 1500 ₪ לחודש. הייתי מעט סקפטית אך החלטתי לנסות, חזר אלי תומר המדהים, תוך כחודש מחזר לי את המשכנתא וחתך לי את ההחזר החודשי, מקצוען אמיתי!!",
    stars: 5
  },
  {
    id: 2,
    name: "חיים",
    details: "48, פתח תקווה",
    text: "תוך כמה קליקים הבנתי שאפשר להקל עלי בעלויות משכנתא החודשיות שתפחו מאוד בשנים האחרונות, אייל יצר איתי קשר, נפגשנו, התרשמתי מאוד לטובה, היום אני חודשיים אחרי ההוזלה של כמעט 2000 ₪ לחודש, ממש חזרתי לנשום מודה לכם מאוד!!!",
    stars: 5
  }
];

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
    otherLoansDescription: '',
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
    <div className="animate-fade-in-up flex flex-col h-full">
      {/* Step Title - Compact */}
      <div className="text-center mb-2">
        <h2 className={`text-xl font-bold mb-1 ${accentStyling}`}>
          {stepContent.stepDescription}
        </h2>
      </div>

      <div className="flex-grow flex flex-col gap-3">
        {/* Mortgage Balance */}
        <InputWithTooltip
          label="יתרת משכנתא נוכחית"
          tooltip={stepContent.mortgageTooltip}
          name="mortgageBalance"
          inputMode="numeric"
          value={formatInputNumber(formData.mortgageBalance)}
          onChange={handleChange}
          placeholder="סכום בש״ח"
          error={errors.mortgageBalance}
          icon={<i className={`fa-solid fa-home ${accentStyling.split(' ')[0]}`}></i>}
          helperText="סכום המשכנתא שנשאר לשלם לבנק"
          autoAdvance={true}
        />

        {/* Other Loans Section - Compact */}
        <div className={`${primaryStyling} rounded-lg p-2.5`}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div>
                <div>
                  <h3 className="text-base font-normal text-gray-900 inline">
                    תרצה להוסיף הלוואות נוספות לבדיקה?
                    <span className="inline-block whitespace-nowrap mr-1 align-middle">
                      <Tooltip
                        content="במידה וישנן הלוואות נוספות רצוי ולרוב ניתן להכניסן תחת המשכנתא וכך להנות מפריסה ארוכה וריבית נמוכה"
                        position="auto"
                        fontSize="base"
                        allowWrap={true}
                        maxWidth={320}
                      >
                        <i className="fa-solid fa-info-circle text-blue-400 hover:text-blue-600 cursor-help text-xs"></i>
                      </Tooltip>
                    </span>
                  </h3>
                </div>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => handleOtherLoansToggle(true)}
                className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${hasOtherLoans
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                כן
              </button>
              <button
                type="button"
                onClick={() => handleOtherLoansToggle(false)}
                className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${!hasOtherLoans
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                לא
              </button>
            </div>
          </div>

          {hasOtherLoans && (
            <div className="mt-2 animate-fade-in">
              <InputWithTooltip
                label="סך כל ההלוואות האחרות"
                tooltip="כולל אשראי אישי, הלוואת רכב, כרטיס אשראי וכל הלוואה אחרת"
                name="otherLoansBalance"
                inputMode="numeric"
                value={formatInputNumber(formData.otherLoansBalance)}
                onChange={handleOtherLoansChange}
                placeholder="סכום בש״ח"
                icon={<i className={`fa-solid fa-credit-card ${accentStyling.split(' ')[0]}`}></i>}
                helperText="סכום כל ההלוואות החוץ-בנקאיות או הלוואות נוספות"
                autoAdvance={true}
              />
            </div>
          )}
        </div>

        {/* Recommendations - Stacked Vertically */}
        <div className="flex flex-col gap-3 mt-1 pb-32">
          {RECOMMENDATIONS.map((rec) => (
            <div
              key={rec.id}
              className="bg-white rounded-lg p-2.5 shadow-sm border border-gray-100"
            >
              <div className="flex text-yellow-400 text-xs mb-1">
                {[...Array(rec.stars)].map((_, i) => (
                  <i key={i} className="fa-solid fa-star"></i>
                ))}
              </div>
              <p className="text-sm text-gray-600 italic leading-snug mb-1.5">
                "{rec.text}"
              </p>
              <div className="font-semibold text-xs text-gray-800">
                {rec.name} ({rec.details})
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky Button Section */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:static md:bg-transparent md:border-t-0 md:shadow-none md:p-0 md:mt-3">
        {/* Validation Errors */}
        {Object.keys(errors).length > 0 && (
          <div className="mb-2 bg-red-50 border border-red-200 rounded-lg p-2">
            <div className="flex items-center text-red-800 text-xs font-medium mb-0.5">
              <i className="fa-solid fa-circle-exclamation ml-1"></i>
              יש לתקן:
            </div>
            <ul className="list-disc list-inside text-xs text-red-700">
              {Object.values(errors).map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <Button
          onClick={handleNext}
          className={`w-full text-lg py-2.5 shadow-md hover:shadow-lg transition-all ${buttonStyling}`}
        >
          {stepContent.ctaText}
          <i className="fa-solid fa-arrow-left mr-2"></i>
        </Button>
      </div>
    </div>
  );
};