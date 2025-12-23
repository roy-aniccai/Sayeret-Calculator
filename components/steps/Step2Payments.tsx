import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from '../../context/FormContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Tooltip } from '../ui/Tooltip';
import { formatNumberWithCommas, parseFormattedNumber } from '../../utils/helpers';
import { calculateRefinancedPayment } from '../../utils/calculator';
import { currentMortgageParams } from '../../utils/mortgageParams';
import { TrackType } from '../../types';

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

  // חישוב מגבלות רגולטוריות
  const refinanceResult = calculateRefinancedPayment(formData);
  const minPaymentByRegulation = Math.max(
    currentMortgageParams.regulations.minMonthlyPayment,
    refinanceResult.breakdown.totalAmount * (refinanceResult.breakdown.weightedRate / 12) + 100
  );

  // Track-specific payment range calculation
  const getPaymentRange = () => {
    if (formData.track) {
      const trackRange = getTrackOptimizedRange(currentTotal);
      return {
        min: Math.max(minPaymentByRegulation, trackRange.min),
        max: trackRange.max
      };
    }
    
    // Default range
    const rangePercent = currentMortgageParams.simulator.paymentRangePercent;
    const rangeAmount = Math.round(currentTotal * rangePercent);
    return {
      min: Math.max(minPaymentByRegulation, currentTotal - rangeAmount),
      max: currentTotal + rangeAmount
    };
  };

  const { min: minTarget, max: maxTarget } = getPaymentRange();

  useEffect(() => {
    // Update target when individual payments change
    const newTotal = formData.mortgagePayment + formData.otherLoansPayment;
    updateFormData({ targetTotalPayment: newTotal });
  }, [formData.mortgagePayment, formData.otherLoansPayment]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Clear error when user types
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

  // Track-specific slider styling and behavior
  const getSliderStyling = () => {
    const colorClass = formData.track === TrackType.MONTHLY_REDUCTION ? 'green' : 'blue';
    if (formData.track === TrackType.SHORTEN_TERM) {
      colorClass = 'green'; // Green for term shortening (savings focus)
    }
    
    return {
      background: `linear-gradient(to right, 
        #10b981 0%, 
        #10b981 ${((currentTotal - formData.targetTotalPayment + (maxTarget - minTarget)/2) / (maxTarget - minTarget)) * 100}%, 
        #ef4444 ${((currentTotal - formData.targetTotalPayment + (maxTarget - minTarget)/2) / (maxTarget - minTarget)) * 100}%, 
        #ef4444 100%)`,
      thumbColor: formData.track === TrackType.MONTHLY_REDUCTION ? '#3b82f6' : '#10b981'
    };
  };

  const sliderStyling = getSliderStyling();

  return (
    <div className={`animate-fade-in-up track-${formData.track || 'default'}`}>
      {/* Track-specific Step Header */}
      <div className="text-center mb-6">
        <h2 className={`text-2xl font-bold mb-2 ${accentStyling}`}>
          {trackContent.stepTitle}
        </h2>
        <p className="text-gray-600 text-sm">
          {trackContent.stepDescription}
        </p>
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
            <span className="text-gray-700 font-medium text-sm">סך החזר חודשי נוכחי:</span>
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
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{formatNumberWithCommas(minTarget)} ₪</span>
                <span>{formatNumberWithCommas(maxTarget)} ₪</span>
              </div>
            </div>

            <div className="mt-3 text-center">
              <div className={`text-2xl font-bold mb-1 ${accentStyling.split(' ')[0]}`}>
                {formatNumberWithCommas(formData.targetTotalPayment)} ₪
              </div>
              {formData.track === TrackType.SHORTEN_TERM ? (
                <div className="text-green-600 font-semibold text-sm">
                  <i className="fa-solid fa-piggy-bank mr-2"></i>
                  {savingsAmount < 0 ? `${trackContent.increaseText} ${formatNumberWithCommas(Math.abs(savingsAmount))} ₪ לקיצור שנים` : `${trackContent.reductionText} ${formatNumberWithCommas(savingsAmount)} ₪`}
                </div>
              ) : isReduction ? (
                <div className="text-green-600 font-semibold text-sm">
                  <i className="fa-solid fa-arrow-down mr-2"></i>
                  {trackContent.reductionText} {formatNumberWithCommas(savingsAmount)} ₪ בחודש
                </div>
              ) : (
                <div className="text-blue-600 font-semibold text-sm">
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
            <p className={`${accentStyling.split(' ')[0]} text-sm font-medium`}>
              {trackContent.ctaMessage}
            </p>
          </div>
          <Button 
            onClick={handleNext} 
            className={`px-4 py-2 text-sm ${buttonStyling}`}
          >
            {trackContent.ctaText}
          </Button>
        </div>

        {/* Secondary CTA for going back */}
        <button onClick={prevStep} className="w-full text-gray-400 text-base mt-4 font-medium hover:text-gray-600 transition-colors">
          {config.messaging.ctaTexts.secondary || 'חזור אחורה'}
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