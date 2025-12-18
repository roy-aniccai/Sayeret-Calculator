import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from '../../context/FormContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { formatNumberWithCommas, parseFormattedNumber } from '../../utils/helpers';
import { calculateRefinancedPayment } from '../../utils/calculator';
import { currentMortgageParams } from '../../utils/mortgageParams';

// Move InputWithTooltip outside the component to prevent recreation on every render
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
}> = ({ label, tooltip, ...inputProps }) => (
  <div>
    <div className="flex items-center gap-2 mb-2">
      <label className="block text-lg font-semibold text-gray-900">
        {label}
      </label>
      <div className="relative group">
        <i className="fa-solid fa-info-circle text-blue-400 hover:text-blue-600 cursor-help text-sm"></i>
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-white border border-gray-200 shadow-lg text-gray-700 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-20 max-w-xs transform -translate-x-1/2">
          {tooltip}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-white"></div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-px border-4 border-transparent border-t-gray-200"></div>
        </div>
      </div>
    </div>
    <Input {...inputProps} label="" />
  </div>
);

export const Step2Payments: React.FC = () => {
  const { formData, updateFormData, nextStep, prevStep } = useForm();
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate current total and slider range with regulatory limits
  const currentTotal = formData.mortgagePayment + formData.otherLoansPayment;
  const totalDebt = formData.mortgageBalance + formData.otherLoansBalance + Math.abs(formData.bankAccountBalance);

  // חישוב מגבלות רגולטוריות
  const refinanceResult = calculateRefinancedPayment(formData);
  const minPaymentByRegulation = Math.max(
    currentMortgageParams.regulations.minMonthlyPayment,
    refinanceResult.breakdown.totalAmount * (refinanceResult.breakdown.weightedRate / 12) + 100
  );

  // Use percentage-based range from parameters (default 30%)
  const rangePercent = currentMortgageParams.simulator.paymentRangePercent;
  const rangeAmount = Math.round(currentTotal * rangePercent);

  const minTarget = Math.max(minPaymentByRegulation, currentTotal - rangeAmount);
  const maxTarget = currentTotal + rangeAmount;

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

  return (
    <div className="animate-fade-in-up">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-2 text-center">החזרים חודשיים</h2>
      <p className="text-gray-600 text-center mb-8">מה אתה משלם היום ומה היעד שלך?</p>

      <div className="space-y-6">
        <InputWithTooltip
          label="החזר משכנתא חודשי נוכחי"
          tooltip="בסיס לחישוב החיסכון החודשי"
          name="mortgagePayment"
          inputMode="numeric"
          suffix="₪"
          value={formatNumberWithCommas(formData.mortgagePayment)}
          onChange={handleChange}
          placeholder="6,500"
          error={errors.mortgagePayment}
          icon={<i className="fa-solid fa-home text-blue-500"></i>}
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
          icon={<i className="fa-solid fa-credit-card text-purple-500"></i>}
        />

        {/* Current Total Display */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium">סך החזר חודשי נוכחי:</span>
            <span className="text-2xl font-bold text-gray-900">
              {formatNumberWithCommas(currentTotal)} ₪
            </span>
          </div>
        </div>

        {/* Target Payment Slider */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <label className="block text-lg font-semibold text-gray-900">
                יעד החזר חודשי חדש
              </label>
              <div className="relative group">
                <i className="fa-solid fa-info-circle text-blue-400 hover:text-blue-600 cursor-help text-sm"></i>
                <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-white border border-gray-200 shadow-lg text-gray-700 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-20 max-w-xs">
                  כמה אתה רוצה לשלם בחודש? שחק עם הסליידר לראות אפשרויות
                  <div className="absolute top-full right-4 border-4 border-transparent border-t-white"></div>
                  <div className="absolute top-full right-4 mt-px border-4 border-transparent border-t-gray-200"></div>
                </div>
              </div>
            </div>

            <div className="relative">
              <input
                type="range"
                min={minTarget}
                max={maxTarget}
                value={formData.targetTotalPayment}
                onChange={handleSliderChange}
                className="w-full h-3 bg-gradient-to-r from-green-200 via-yellow-200 to-red-200 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, 
                    #10b981 0%, 
                    #10b981 ${((currentTotal - formData.targetTotalPayment + rangeAmount) / (rangeAmount * 2)) * 100}%, 
                    #ef4444 ${((currentTotal - formData.targetTotalPayment + rangeAmount) / (rangeAmount * 2)) * 100}%, 
                    #ef4444 100%)`
                }}
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>{formatNumberWithCommas(minTarget)} ₪</span>
                <span>{formatNumberWithCommas(maxTarget)} ₪</span>
              </div>
            </div>

            <div className="mt-4 text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {formatNumberWithCommas(formData.targetTotalPayment)} ₪
              </div>
              {isReduction ? (
                <div className="text-green-600 font-semibold">
                  <i className="fa-solid fa-arrow-down mr-2"></i>
                  הפחתה של {formatNumberWithCommas(savingsAmount)} ₪ בחודש
                </div>
              ) : (
                <div className="text-blue-600 font-semibold">
                  <i className="fa-solid fa-arrow-up mr-2"></i>
                  תוספת של {formatNumberWithCommas(Math.abs(savingsAmount))} ₪ בחודש
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <div className="flex items-start gap-3">
            <i className="fa-solid fa-calculator text-blue-600 text-xl mt-1"></i>
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">איך זה עובד?</h4>
              <p className="text-blue-700 text-sm">
                נאחד את כל החובות למשכנתא אחת בריבית נמוכה ונפרוס מחדש לפי היעד שלך.
                ככל שתבחר החזר נמוך יותר, התקופה תתארך אבל התזרים החודשי ישתפר.
              </p>
            </div>
          </div>
        </div>

        <Button fullWidth onClick={handleNext} className="mt-8">
          המשך לשלב הבא
        </Button>

        <button onClick={prevStep} className="w-full text-gray-400 text-xl mt-6 font-medium">
          חזור אחורה
        </button>
      </div>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: #3b82f6;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: #3b82f6;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
};