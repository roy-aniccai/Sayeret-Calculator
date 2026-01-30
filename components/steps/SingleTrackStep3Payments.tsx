import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSingleTrackForm } from '../../context/SingleTrackFormContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Tooltip } from '../ui/Tooltip';
import { formatNumberWithCommas, parseFormattedNumber } from '../../utils/helpers';
import { calculateRefinancedPayment } from '../../utils/calculator';
import { currentMortgageParams, calculateMonthlyPayment } from '../../utils/mortgageParams';
import { TrackType } from '../../types';

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
 * SingleTrackStep3Payments - Payment collection step for single-track calculator
 * 
 * This component is adapted from Step2Payments but simplified for single-track use:
 * - Removes track-specific logic and uses fixed styling for monthly reduction
 * - Focuses on monthly reduction optimization
 * - Integrates with SingleTrackFormContext
 * - Uses fixed content instead of dynamic track-based content
 * 
 * Requirements: 1.2, 4.2
 */
export const SingleTrackStep3Payments: React.FC = () => {
  console.log('Single Track Step 3 Payments: v1.0 (Monthly Reduction Focus)');
  const { formData, updateFormData, nextStep } = useSingleTrackForm();
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fixed styling for single-track (monthly reduction focused)
  const primaryStyling = 'bg-blue-50 border border-blue-200';
  const buttonStyling = 'bg-blue-600 hover:bg-blue-700 text-white';
  const accentStyling = 'text-blue-600';

  const showOtherLoansPayment = formData.hasOtherLoans === true;
  // Calculate current total (otherLoansPayment is 0 when user has no other loans)
  const currentTotal = formData.mortgagePayment + formData.otherLoansPayment;

  // Calculate potential savings with maximum term (30 years) - memoized to prevent recalculation
  const savingsEstimate = useMemo(() => {
    const totalAmount = formData.mortgageBalance + formData.otherLoansBalance;

    // Create a compatible FormData object for calculation
    const calculationData = {
      ...formData,
      track: TrackType.MONTHLY_REDUCTION,
      bankAccountBalance: 0, // Exclude bank overdraft from single-track calculations
      currentPayment: formData.mortgagePayment + formData.otherLoansPayment,
      yearsRemaining: 25, // Default assumption
      netIncome: 0,
      addedMonthlyPayment: 0,
      lumpSum: 0,
      standardLoans: 0,
      highInterestLoans: 0,
      loansPayment: 0,
      urgency: null,
      leadEmail: '',
      termsAccepted: false,
      interestedInInsurance: false
    };

    try {
      // Get weighted rate from refinance calculation
      const refinanceResult = calculateRefinancedPayment(calculationData);
      const weightedRate = refinanceResult.breakdown.weightedRate;

      // Calculate payment for max term (30 years) - best case scenario
      const maxTerm = currentMortgageParams.regulations.maxLoanTermYears;
      const minPossiblePayment = calculateMonthlyPayment(totalAmount, weightedRate, maxTerm);
      const regulatoryMinPayment = Math.max(minPossiblePayment, currentMortgageParams.regulations.minMonthlyPayment);

      const potentialSavings = currentTotal - regulatoryMinPayment;
      
      return {
        canSave: potentialSavings > 100, // Only show savings if meaningful (>100 NIS)
        estimatedSavings: Math.max(0, potentialSavings),
        estimatedNewPayment: regulatoryMinPayment,
        isValid: refinanceResult.isValid
      };
    } catch (error) {
      console.error('Error calculating potential savings:', error);
      return {
        canSave: false,
        estimatedSavings: 0,
        estimatedNewPayment: currentTotal,
        isValid: false
      };
    }
  }, [formData.mortgageBalance, formData.otherLoansBalance, formData.mortgagePayment, formData.otherLoansPayment, currentTotal]);

  // Single-track specific content (focused on monthly reduction)
  const stepContent = {
    stepTitle: 'החזרים חודשיים נוכחיים',
    stepDescription: 'כמה אתה משלם היום?',
    mortgageTooltip: 'בסיס לחישוב הערכת החיסכון',
    ctaText: 'המשך לחישוב מדויק',
    ctaMessage: savingsEstimate.canSave 
      ? 'מעולה! יש פוטנציאל לחיסכון' 
      : 'בואו נבדוק את האפשרויות שלך'
  };

  // Set target payment based on estimated savings - use useEffect with stable dependencies
  useEffect(() => {
    const targetPayment = savingsEstimate.canSave 
      ? Math.round(savingsEstimate.estimatedNewPayment)
      : currentTotal;
    
    // Only update if the target payment has actually changed to prevent infinite loops
    if (formData.targetTotalPayment !== targetPayment) {
      updateFormData({ targetTotalPayment: targetPayment });
    }
  }, [savingsEstimate.canSave, savingsEstimate.estimatedNewPayment, currentTotal, formData.targetTotalPayment, updateFormData]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    updateFormData({ [name]: parseFormattedNumber(value) });
  }, [errors, updateFormData]);

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

  return (
    <div className="animate-fade-in-up">
      {/* Step Title */}
      <div className="text-center mb-6">
        <h2 className={`text-2xl font-bold mb-2 ${accentStyling}`}>
          {stepContent.stepDescription}
        </h2>
      </div>

      <div className="space-y-4 pb-32 md:pb-0">
        <InputWithTooltip
          label="החזר משכנתא חודשי נוכחי"
          tooltip={stepContent.mortgageTooltip}
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

        {showOtherLoansPayment && (
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
        )}

        {/* Current Total Display - only when user has other loans (otherwise redundant with mortgage payment) */}
        {showOtherLoansPayment && (
          <div className={`${primaryStyling} rounded-lg p-3`}>
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium text-base">סך החזר חודשי נוכחי:</span>
              <span className={`text-xl font-bold ${accentStyling.split(' ')[0]}`}>
                {formatNumberWithCommas(currentTotal)} ₪
              </span>
            </div>
          </div>
        )}

        {/* Savings Estimate Display - Replaces Target Payment Slider */}
        <div className="space-y-3">
          {savingsEstimate.canSave ? (
            /* Show Estimated Savings */
            <div className={`${primaryStyling} rounded-xl p-4 border-2 border-green-200 bg-gradient-to-br from-green-50 to-blue-50`}>
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <i className="fa-solid fa-calculator text-green-600 text-xl"></i>
                  <h3 className="text-lg font-bold text-gray-900">הערכת חיסכון ראשונית</h3>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-1">
                      {formatNumberWithCommas(Math.round(savingsEstimate.estimatedSavings))} ₪
                    </div>
                    <div className="text-sm text-gray-600 mb-2">חיסכון משוער בחודש</div>
                    
                    <div className="flex justify-between items-center text-sm bg-gray-50 rounded-lg p-2">
                      <span className="text-gray-600">החזר נוכחי:</span>
                      <span className="font-semibold">{formatNumberWithCommas(currentTotal)} ₪</span>
                    </div>
                    <div className="flex justify-between items-center text-sm bg-green-50 rounded-lg p-2 mt-1">
                      <span className="text-green-700">החזר משוער חדש:</span>
                      <span className="font-semibold text-green-700">{formatNumberWithCommas(Math.round(savingsEstimate.estimatedNewPayment))} ₪</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 leading-relaxed">
                  * הערכה ראשונית בהתבסס על ריביות שוק נוכחיות ופריסה מקסימלית של 30 שנה. 
                  החישוב המדויק יתבצע בשלבים הבאים.
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Integrated CTA */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:static md:bg-transparent md:border-t-0 md:shadow-none md:p-0 md:mt-0">
          <div className={`${savingsEstimate.canSave ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'} rounded-xl p-4 flex flex-col gap-4 border-2`}>
            <div className="flex items-center gap-3 w-full">
              <div className={`${savingsEstimate.canSave ? 'bg-green-100' : 'bg-blue-100'} rounded-full p-2 shrink-0 border ${savingsEstimate.canSave ? 'border-green-200' : 'border-blue-200'}`}>
                <i className={`fa-solid fa-calculator ${savingsEstimate.canSave ? 'text-green-600' : 'text-blue-600'} text-xl`}></i>
              </div>
              <p className={`${savingsEstimate.canSave ? 'text-green-800' : 'text-blue-800'} text-lg font-bold leading-tight`}>
                {stepContent.ctaMessage}
              </p>
            </div>
            <Button
              onClick={handleNext}
              className={`w-full py-3 text-xl font-bold shadow-lg ${savingsEstimate.canSave ? 'bg-green-600 hover:bg-green-700' : buttonStyling}`}
            >
              {stepContent.ctaText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};