import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from '../../context/FormContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Tooltip } from '../ui/Tooltip';
import { formatNumberWithCommas, parseFormattedNumber } from '../../utils/helpers';
import { calculateRefinancedPayment } from '../../utils/calculator';
import { currentMortgageParams, calculateMonthlyPayment } from '../../utils/mortgageParams';
import { TrackType } from '../../types';
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

export const Step2Payments: React.FC = () => {
  const { formData, updateFormData, nextStep, prevStep, getTrackConfig, getTrackSpecificStyling, getTrackOptimizedRange } = useForm();
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get track-specific configuration
  const config = getTrackConfig();
  const primaryStyling = getTrackSpecificStyling('primary');
  const buttonStyling = getTrackSpecificStyling('button');
  const accentStyling = getTrackSpecificStyling('accent');

  // Calculate current total and track-specific slider range
  const currentTotal = formData.mortgagePayment + formData.otherLoansPayment;
  const totalDebt = formData.mortgageBalance + formData.otherLoansBalance + Math.abs(formData.bankAccountBalance);

  // Track-specific content
  const getTrackSpecificContent = () => {
    if (formData.track === TrackType.MONTHLY_REDUCTION) {
      return {
        stepTitle: config.ui.stepTitles[3] || 'החזרים חודשיים נוכחיים',
        stepDescription: config.ui.stepDescriptions[3] || 'כמה אתה משלם היום?',
        mortgageTooltip: config.messaging.tooltips.mortgagePayment || 'בסיס לחישוב החיסכון החודשי',
        targetTooltip: config.messaging.tooltips.targetPayment || 'כמה תרצה לשלם? נמצא את הדרך הטובה ביותר',
        sliderTooltip: config.messaging.tooltips.simulator || 'שחק עם הסליידר לראות אפשרויות הפחתה',
        ctaText: config.messaging.ctaTexts.primary || 'המשך לחישוב',
        ctaMessage: 'נאחד את כל החובות למשכנתא אחת בריבית נמוכה יותר',
        reductionText: 'הפחתה של',
        increaseText: 'תוספת של'
      };
    } else if (formData.track === TrackType.SHORTEN_TERM) {
      return {
        stepTitle: config.ui.stepTitles[3] || 'יכולת תשלום מוגברת',
        stepDescription: config.ui.stepDescriptions[3] || 'כמה אתה יכול לשלם בחודש?',
        mortgageTooltip: config.messaging.tooltips.mortgagePayment || 'ההחזר הנוכחי - נוסיף עליו לקיצור שנים',
        targetTooltip: config.messaging.tooltips.targetPayment || 'כמה אתה מוכן לשלם כדי לקצר שנים?',
        sliderTooltip: config.messaging.tooltips.simulator || 'שחק עם הסליידר לראות כמה שנים תחסוך',
        ctaText: config.messaging.ctaTexts.primary || 'המשך לחישוב',
        ctaMessage: 'נאחד את כל החובות למשכנתא אחת לקיצור שנים מקסימלי',
        reductionText: 'חיסכון של',
        increaseText: 'השקעה נוספת של'
      };
    }

    // Default content
    return {
      stepTitle: 'החזרים חודשיים',
      stepDescription: 'נבדוק את התשלומים הנוכחיים',
      mortgageTooltip: 'בסיס לחישוב החיסכון החודשי',
      targetTooltip: 'כמה תרצה לשלם בחודש?',
      sliderTooltip: 'שחק עם הסליידר לראות אפשרויות',
      ctaText: 'המשך לחישוב',
      ctaMessage: 'נאחד את כל החובות למשכנתא אחת בריבית נמוכה',
      reductionText: 'הפחתה של',
      increaseText: 'תוספת של'
    };
  };

  const trackContent = getTrackSpecificContent();

  // Calculate Regulatory Minimum Payment (Max Term = 30 years)
  const calculateRegulatoryMin = useCallback(() => {
    const totalAmount = formData.mortgageBalance + formData.otherLoansBalance + Math.abs(formData.bankAccountBalance);

    // We need the weighted rate. We can get it from the helper or calculate it similarly to calculateRefinancedPayment
    // For simplicity and consistency, let's use the one from the refinance result or recalculate using standard params
    const refinanceResult = calculateRefinancedPayment(formData);
    const weightedRate = refinanceResult.breakdown.weightedRate;

    // Calculate payment for max term (30 years)
    const maxTerm = currentMortgageParams.regulations.maxLoanTermYears;
    const minPayment = calculateMonthlyPayment(totalAmount, weightedRate, maxTerm);

    // Ensure it's not below the absolute minimum of 1000 NIS
    return Math.max(minPayment, currentMortgageParams.regulations.minMonthlyPayment);
  }, [formData]);

  const regulatoryMinPayment = calculateRegulatoryMin();

  // Track-specific payment range calculation - MODIFIED for new logic
  const getPaymentRange = () => {
    if (formData.track === TrackType.SHORTEN_TERM) {
      // For shorten term, we want to pay MORE, so min is current, max is higher
      const trackRange = getTrackOptimizedRange(currentTotal);
      return {
        min: currentTotal,
        max: trackRange.max
      };
    }

    // For Monthly Reduction (default), range is from Regulatory Min to Current
    // We add a small buffer above current for user freedom, but focus is reduction
    return {
      min: regulatoryMinPayment,
      max: currentTotal * 1.1 // Allow 10% above current just in case
    };
  };

  const { min: minTarget, max: maxTarget } = getPaymentRange();

  useEffect(() => {
    // If current target is out of new bounds, adjust it (only if it hasn't been touched yet or is invalid)
    // We only force it if it's way off to avoid jarring jumps, but primarily we want to start at "Current" or "Optimized"
    // actually, keeping the previous logic of updating targetTotalPayment when inputs change is fine
    // but we should ensure valid bounds
  }, [formData.mortgagePayment, formData.otherLoansPayment]); // reduced dependencies to avoid loops

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    updateFormData({ [name]: parseFormattedNumber(value) });
  }, [errors, updateFormData]);

  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    updateFormData({ targetTotalPayment: value });
  }, [updateFormData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.mortgagePayment) newErrors.mortgagePayment = 'נא להזין החזר משכנתא';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    nextStep();
  };

  const savingsAmount = currentTotal - formData.targetTotalPayment;
  const isReduction = savingsAmount > 0;

  // New clean slider styling (no red/green gradient)
  const getSliderStyling = () => {
    const percent = ((formData.targetTotalPayment - minTarget) / (maxTarget - minTarget)) * 100;
    const activeColor = formData.track === TrackType.SHORTEN_TERM ? '#10b981' : '#3b82f6'; // Green for shorten term, Blue for standard

    return {
      background: `linear-gradient(to right, ${activeColor} 0%, ${activeColor} ${percent}%, #e5e7eb ${percent}%, #e5e7eb 100%)`,
      thumbColor: activeColor
    };
  };

  const sliderStyling = getSliderStyling();

  return (
    <div className={`animate-fade-in-up track-${formData.track || 'default'}`}>
      {/* Promoted Subtitle as Primary Step Title */}
      <div className="text-center mb-6">
        <h2 className={`text-2xl font-bold mb-2 ${accentStyling}`}>
          {trackContent.stepDescription}
        </h2>
      </div>

      <div className="space-y-4">
        <InputWithTooltip
          label="החזר משכנתא חודשי נוכחי"
          tooltip={trackContent.mortgageTooltip}
          name="mortgagePayment"
          inputMode="numeric"
          suffix="₪"
          value={formatNumberWithCommas(formData.mortgagePayment)}
          onChange={handleChange}
          placeholder="6,500"
          error={errors.mortgagePayment}
          icon={<i className={`fa-solid fa-home ${accentStyling.split(' ')[0]}`}></i>}
          autoAdvance={true}
        />

        <InputWithTooltip
          label="החזר הלוואות אחרות חודשי"
          tooltip="החזרים של כל ההלוואות האחרות שלך"
          name="otherLoansPayment"
          inputMode="numeric"
          suffix="₪"
          value={formatNumberWithCommas(formData.otherLoansPayment)}
          onChange={handleChange}
          placeholder="0"
          icon={<i className={`fa-solid fa-credit-card ${accentStyling.split(' ')[0]}`}></i>}
          autoAdvance={true}
        />

        {/* Current Total Display */}
        <div className={`${primaryStyling} rounded-lg p-3`}>
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium text-base">סך החזר חודשי נוכחי:</span>
            <span className={`text-xl font-bold ${accentStyling.split(' ')[0]}`}>
              {formatNumberWithCommas(currentTotal)} ₪
            </span>
          </div>
        </div>

        {/* Track-specific Target Payment Slider */}
        <div className="space-y-3">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="block text-lg font-semibold text-gray-900">
                {formData.track === TrackType.SHORTEN_TERM ? 'יעד תשלום מוגבר לקיצור שנים' : 'יעד החזר חודשי חדש'}
              </label>
              <Tooltip
                content={trackContent.sliderTooltip}
                position="auto"
                fontSize="base"
                allowWrap={true}
                maxWidth={280}
              >
                <i className={`fa-solid fa-info-circle ${accentStyling.split(' ')[0]} hover:opacity-80 cursor-help text-sm`}></i>
              </Tooltip>
            </div>

            <div className="relative">
              <input
                type="range"
                min={minTarget}
                max={maxTarget}
                value={formData.targetTotalPayment}
                onChange={handleSliderChange}
                className="w-full h-3 rounded-lg appearance-none cursor-pointer slider"
                style={sliderStyling}
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2 font-medium">
                <div className="flex flex-col items-start">
                  <span className="text-gray-400 text-xs">מינימום אפשרי (30 שנה)</span>
                  <span>{formatNumberWithCommas(minTarget)} ₪</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-gray-400 text-xs">החזר נוכחי</span>
                  <span>{formatNumberWithCommas(currentTotal)} ₪</span>
                </div>
              </div>
            </div>

            <div className="mt-3 text-center">
              <div className={`text-2xl font-bold mb-1 ${accentStyling.split(' ')[0]}`}>
                {formatNumberWithCommas(formData.targetTotalPayment)} ₪
              </div>
              {formData.track === TrackType.SHORTEN_TERM ? (
                <div className="text-green-600 font-semibold text-base">
                  <i className="fa-solid fa-piggy-bank mr-2"></i>
                  {savingsAmount < 0 ? `${trackContent.increaseText} ${formatNumberWithCommas(Math.abs(savingsAmount))} ₪ לקיצור שנים` : `${trackContent.reductionText} ${formatNumberWithCommas(savingsAmount)} ₪`}
                </div>
              ) : isReduction ? (
                <div className="text-green-600 font-semibold text-base">
                  <i className="fa-solid fa-arrow-down mr-2"></i>
                  {trackContent.reductionText} {formatNumberWithCommas(savingsAmount)} ₪ בחודש
                </div>
              ) : (
                <div className="text-blue-600 font-semibold text-base">
                  <i className="fa-solid fa-arrow-up mr-2"></i>
                  {trackContent.increaseText} {formatNumberWithCommas(Math.abs(savingsAmount))} ₪ בחודש
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Track-specific Integrated CTA */}
        <div className={`${primaryStyling} rounded-lg p-3 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <i className={`fa-solid fa-calculator ${accentStyling.split(' ')[0]} text-lg`}></i>
            <p className={`${accentStyling.split(' ')[0]} text-base font-medium`}>
              {trackContent.ctaMessage}
            </p>
          </div>
          <Button
            onClick={handleNext}
            className={`px-4 py-2 text-base ${buttonStyling}`}
          >
            {trackContent.ctaText}
          </Button>
        </div>

        {/* Secondary CTA for going back */}
        <button onClick={prevStep} className="w-full text-gray-400 text-base mt-4 font-medium hover:text-gray-600 transition-colors">
          {generateContextualBackText(3)}
        </button>
      </div>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: ${sliderStyling.thumbColor};
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: ${sliderStyling.thumbColor};
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
};