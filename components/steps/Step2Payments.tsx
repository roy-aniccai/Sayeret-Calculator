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
  inputMode?: "search" | "email" | "tel" | "text" | "url" | "none" | "numeric" | "decimal";
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

export const Step2Payments: React.FC = () => {
  console.log('Regulator Fix Applied: v1.4 (Manual Input)');
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

  /* New Logic for Shorten Term - Max is 40% of Net Income if available, else standard multiplier */
  const getPaymentRange = () => {
    if (formData.track === TrackType.SHORTEN_TERM) {
      // Logic: Min is current payment, Max is 40% of Net Income (if valid) or fallback to 1.5x current
      const maxIncomeBased = formData.netIncome ? formData.netIncome * 0.4 : currentTotal * 1.5;
      return {
        min: currentTotal,
        max: Math.max(maxIncomeBased, currentTotal * 1.1) // Ensure max is at least 10% more than min
      };
    }

    // For Monthly Reduction (default), range is from Regulatory Min to Current
    // FIXED: Set max exactly to currentTotal so the scale aligns with the "Current Payment" label at the edge
    return {
      min: regulatoryMinPayment,
      max: currentTotal
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
  // FIXED: Changed to 'to left' for RTL support (fills from Right to Left)
  const getSliderStyling = () => {
    const percent = ((formData.targetTotalPayment - minTarget) / (maxTarget - minTarget)) * 100;
    const activeColor = formData.track === TrackType.SHORTEN_TERM ? '#10b981' : '#3b82f6'; // Green for shorten term, Blue for standard

    return {
      background: `linear-gradient(to left, ${activeColor} 0%, ${activeColor} ${percent}%, #e5e7eb ${percent}%, #e5e7eb 100%)`,
      thumbColor: activeColor
    };
  };

  const sliderStyling = getSliderStyling();

  // Helper for dynamic labels
  const getSliderLabels = () => {
    if (formData.track === TrackType.SHORTEN_TERM) {
      return {
        start: 'החזר נוכחי',
        end: 'מקסימום אפשרי'
      };
    }
    return {
      start: 'מינימום אפשרי (30 שנה)',
      end: 'החזר נוכחי'
    };
  };

  const sliderLabels = getSliderLabels();

  const handleManualInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove non-digits
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    const value = parseInt(rawValue);

    // Allow empty string temporarily, otherwise default to 0
    if (isNaN(value)) {
      updateFormData({ targetTotalPayment: 0 });
      return;
    }

    updateFormData({ targetTotalPayment: value });
  };

  const handleManualInputBlur = () => {
    let val = formData.targetTotalPayment;
    // Clamp to valid range on blur
    if (val < minTarget) val = minTarget;
    if (val > maxTarget) val = maxTarget;
    updateFormData({ targetTotalPayment: val });
  };

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

        <div className="space-y-4 pb-32 md:pb-0">
          {/* Current Mortgage Payment */}
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

          {/* Net Income Input */}
          <InputWithTooltip
            label="הכנסה נטו (זוגית)"
            tooltip="משמש לחישוב יכולת ההחזר לפי כללי האצבע"
            name="netIncome"
            inputMode="numeric"
            suffix="₪"
            value={formatNumberWithCommas(formData.netIncome || 0)}
            onChange={handleChange}
            placeholder="20,000"
            icon={<i className={`fa-solid fa-wallet ${accentStyling.split(' ')[0]}`}></i>}
            autoAdvance={true}
          />

          {/* Rule of Thumb Message */}
          {formData.netIncome > 0 && (
            <div className={`${primaryStyling} rounded-lg p-3 text-sm text-gray-800`}>
              <p className={`font-bold mb-1 ${accentStyling.split(' ')[0]}`}><i className="fa-solid fa-circle-info mr-1"></i> כלל אצבע:</p>
              <p>ההחזר החודשי המומלץ הוא עד 33%-35% מההכנסה הפנויה (במקרים חריגים עד 40% ללווים חזקים).</p>
              <p className="mt-1 font-semibold">מקסימום מומלץ עבורכם: כ-{formatNumberWithCommas(Math.round(formData.netIncome * 0.35))} ₪</p>
            </div>
          )}

          {/* Track-specific Target Payment Slider */}
          <div className="space-y-3 pt-2">
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
                    <span className="text-gray-400 text-xs">{sliderLabels.start}</span>
                    <span>{formatNumberWithCommas(minTarget)} ₪</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-gray-400 text-xs">{sliderLabels.end}</span>
                    <span>{formatNumberWithCommas(maxTarget)} ₪</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 text-center">
                {/* Manual Input Field for Payment Target */}
                <div className="relative inline-block">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formatNumberWithCommas(formData.targetTotalPayment)}
                    onChange={handleManualInputChange}
                    onBlur={handleManualInputBlur}
                    className={`text-2xl font-bold mb-1 text-center bg-transparent border-b-2 border-dashed border-gray-300 focus:border-${config.ui.primaryColor}-500 focus:outline-none w-32 ${accentStyling.split(' ')[0]}`}
                  />
                  <span className={`text-2xl font-bold ml-1 ${accentStyling.split(' ')[0]}`}>₪</span>
                </div>
                <div className="text-green-600 font-semibold text-base">
                  <i className="fa-solid fa-piggy-bank mr-2"></i>
                  {savingsAmount < 0 ? `${trackContent.increaseText} ${formatNumberWithCommas(Math.abs(savingsAmount))} ₪ לקיצור שנים` : `${trackContent.reductionText} ${formatNumberWithCommas(savingsAmount)} ₪`}
                </div>
              </div>
            </div>
          </div>

          {/* Track-specific Integrated CTA */}
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:static md:bg-transparent md:border-t-0 md:shadow-none md:p-0 md:mt-0">
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
          </div>


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
  }

  return (
    <div className={`animate-fade-in-up track-${formData.track || 'default'}`}>
      {/* Promoted Subtitle as Primary Step Title */}
      <div className="text-center mb-6">
        <h2 className={`text-2xl font-bold mb-2 ${accentStyling}`}>
          {trackContent.stepDescription}
        </h2>
      </div>

      <div className="space-y-4 pb-32 md:pb-0">
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
                inputMode="none"
                className="w-full h-3 rounded-lg appearance-none cursor-pointer slider"
                style={sliderStyling}
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2 font-medium">
                <div className="flex flex-col items-start">
                  <span className="text-gray-400 text-xs">{sliderLabels.start}</span>
                  <span>{formatNumberWithCommas(minTarget)} ₪</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-gray-400 text-xs">{sliderLabels.end}</span>
                  <span>{formatNumberWithCommas(maxTarget)} ₪</span>
                </div>
              </div>
            </div>

            <div className="mt-3 text-center">
              {/* Manual Input Field for Payment Target */}
              <div className="relative inline-block">
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatNumberWithCommas(formData.targetTotalPayment)}
                  onChange={handleManualInputChange}
                  onBlur={handleManualInputBlur}
                  className={`text-2xl font-bold mb-1 text-center bg-transparent border-b-2 border-dashed border-gray-300 focus:border-${config.ui.primaryColor}-500 focus:outline-none w-32 ${accentStyling.split(' ')[0]}`}
                />
                <span className={`text-2xl font-bold ml-1 ${accentStyling.split(' ')[0]}`}>₪</span>
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
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:static md:bg-transparent md:border-t-0 md:shadow-none md:p-0 md:mt-0">
          <div className={`${primaryStyling} rounded-xl p-4 flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <i className={`fa-solid fa-calculator ${accentStyling.split(' ')[0]} text-xl`}></i>
              <p className={`${accentStyling.split(' ')[0]} text-lg font-medium`}>
                {trackContent.ctaMessage}
              </p>
            </div>
            <Button
              onClick={handleNext}
              className={`px-4 py-2 text-lg ${buttonStyling}`}
            >
              {trackContent.ctaText}
            </Button>
          </div>
        </div>


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