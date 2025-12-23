import React, { useState, useCallback } from 'react';
import { useForm } from '../../context/FormContext';
import { Button } from '../ui/Button';
import { formatNumberWithCommas } from '../../utils/helpers';
import { 
  validateLoanParams, 
  currentMortgageParams, 
  calculateMonthlyPayment,
  calculateWeightedMortgageRate,
  calculateWeightedOtherLoansRate
} from '../../utils/mortgageParams';

export const Step5Simulator: React.FC = () => {
  const { formData, updateFormData, resetForm } = useForm();
  const [simulatorYears, setSimulatorYears] = useState(20); // Start with 20 years

  // Calculate what payment would be needed for the selected years
  const calculatePaymentForYears = (years: number) => {
    const mortgageAmount = formData.mortgageBalance;
    const otherLoansAmount = formData.otherLoansBalance + Math.abs(formData.bankAccountBalance);
    const totalAmount = mortgageAmount + otherLoansAmount;
    
    // Use the exact same calculation as in the main calculator
    const mortgageRate = calculateWeightedMortgageRate();
    const otherLoansRate = calculateWeightedOtherLoansRate();
    
    // Calculate weighted rate exactly like in calculator.ts
    const weightedRate = totalAmount > 0 ? 
      (mortgageAmount * mortgageRate + otherLoansAmount * otherLoansRate) / totalAmount : 
      mortgageRate;
    
    return calculateMonthlyPayment(totalAmount, weightedRate, years);
  };

  const newPayment = calculatePaymentForYears(simulatorYears);
  const currentPayment = formData.mortgagePayment + formData.otherLoansPayment;
  
  // Validation with current parameters
  const validation = validateLoanParams(
    formData.mortgageBalance + formData.otherLoansBalance + Math.abs(formData.bankAccountBalance),
    newPayment,
    simulatorYears,
    formData.age || undefined,
    formData.propertyValue
  );

  const maxAllowedYears = validation.maxAllowedTerm || currentMortgageParams.regulations.maxLoanTermYears;

  // Calculate valid years range based on mathematical constraints
  const calculateValidYearsRange = () => {
    if (!formData.age) return { min: 10, max: 30 };
    
    const maxYearsByAge = currentMortgageParams.regulations.maxBorrowerAge - formData.age;
    const maxYears = Math.min(maxYearsByAge, currentMortgageParams.regulations.maxLoanTermYears);
    
    // Minimum years - ensure payment doesn't exceed reasonable limits
    const mortgageAmount = formData.mortgageBalance;
    const otherLoansAmount = formData.otherLoansBalance + Math.abs(formData.bankAccountBalance);
    const totalAmount = mortgageAmount + otherLoansAmount;
    const maxReasonablePayment = currentPayment * 2; // Don't allow more than double current payment
    
    // Use the same weighted rate calculation
    const mortgageRate = calculateWeightedMortgageRate();
    const otherLoansRate = calculateWeightedOtherLoansRate();
    const weightedRate = totalAmount > 0 ? 
      (mortgageAmount * mortgageRate + otherLoansAmount * otherLoansRate) / totalAmount : 
      mortgageRate;
    
    const monthlyRate = weightedRate / 12;
    
    let minYears = 5;
    if (monthlyRate > 0 && totalAmount > 0) {
      // Calculate minimum years needed to keep payment under maxReasonablePayment
      const minPayments = Math.log(1 + (totalAmount * monthlyRate) / maxReasonablePayment) / 
                         Math.log(1 + monthlyRate);
      minYears = Math.max(Math.ceil(minPayments / 12), 5);
    }
    
    return { 
      min: Math.max(minYears, 5), 
      max: Math.min(maxYears, 35) 
    };
  };

  const { min: minYears, max: maxYears } = calculateValidYearsRange();

  const handleYearsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData.age) return;
    const years = parseInt(e.target.value);
    
    // Ensure the years are within valid range
    if (years >= minYears && years <= maxYears) {
      setSimulatorYears(years);
    }
  }, [formData.age, minYears, maxYears]);

  const handleAgeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const age = parseInt(e.target.value) || null;
    updateFormData({ age });
    
    // Reset years to a safe middle value when age changes
    if (age) {
      const newRange = calculateValidYearsRange();
      const safeYears = Math.min(Math.max(simulatorYears, newRange.min), newRange.max);
      setSimulatorYears(safeYears);
    }
  }, [updateFormData, simulatorYears]);

  // Determine colors based on payment comparison
  const paymentDiff = newPayment - currentPayment;
  const isReduction = paymentDiff < 0;
  const gradientColor = isReduction ? 'from-green-400 to-green-600' : 'from-blue-400 to-blue-600'; // Use blue instead of amber

  return (
    <div className="animate-fade-in-up">
      {/* Compact Step Header */}
      <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">סימולטור מיחזור</h2>
      
      {/* All-in-One Calculator */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-4 shadow-lg">
        {/* Age Input Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-calculator text-blue-600 text-lg"></i>
              <h3 className="text-lg font-bold text-gray-900">מחשבון מיחזור משכנתא</h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-gray-900">גיל:</span>
              <div className="relative">
                <input
                  type="number"
                  min="18"
                  max="80"
                  value={formData.age || ''}
                  onChange={handleAgeChange}
                  placeholder="35"
                  className={`w-20 px-3 py-2 text-lg font-bold border-2 rounded-xl focus:outline-none focus:ring-2 text-center shadow-sm ${
                    !formData.age 
                      ? 'border-blue-400 ring-blue-200 bg-blue-50 text-blue-900 placeholder-blue-400' 
                      : 'border-gray-300 focus:ring-blue-500 text-gray-900 bg-white'
                  }`}
                />
                <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-sm text-gray-500">
                  שנים
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Always show calculator */}
        <div className="space-y-5">
          {/* Visual Comparison with Payment Info */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            {/* Summary Header */}
            <div className="text-center mb-4">
              {(() => {
                if (paymentDiff < -100) {
                  return (
                    <div className="bg-green-100 border border-green-300 rounded-lg p-3">
                      <h4 className="text-xl font-bold text-green-700 mb-1">
                        הפחתה של כ-{formatNumberWithCommas(Math.round(Math.abs(paymentDiff)))} ש"ח בחודש!
                      </h4>
                    </div>
                  );
                } else if (paymentDiff < 0) {
                  return (
                    <div className="bg-blue-100 border border-blue-300 rounded-lg p-3">
                      <h4 className="text-xl font-bold text-blue-700 mb-1">
                        הפחתה של כ-{formatNumberWithCommas(Math.round(Math.abs(paymentDiff)))} ש"ח בחודש
                      </h4>
                    </div>
                  );
                } else if (Math.abs(paymentDiff) <= 100) {
                  return (
                    <div className="bg-blue-100 border border-blue-300 rounded-lg p-3">
                      <h4 className="text-xl font-bold text-blue-700 mb-1">
                        החזר דומה לנוכחי
                      </h4>
                    </div>
                  );
                } else {
                  return (
                    <div className="bg-blue-100 border border-blue-300 rounded-lg p-3">
                      <h4 className="text-xl font-bold text-blue-700 mb-1">
                        תוספת של כ-{formatNumberWithCommas(Math.round(paymentDiff))} ש"ח בחודש
                      </h4>
                    </div>
                  );
                }
              })()}
            </div>

            {/* Bar Chart - Single Bar with Current Payment Line */}
            <div className="mb-6">
              <div className="px-4">
                <div className="w-full">
                  {/* Single Payment Bar */}
                  <div className="relative">
                    {/* Single Bar Container */}
                    <div className="relative h-12 bg-gray-200 rounded-lg overflow-hidden">
                      {(() => {
                        // Calculate the range for proper scaling
                        const { min: minYears, max: maxYears } = calculateValidYearsRange();
                        const maxPayment = calculatePaymentForYears(minYears); // Shorter term = higher payment
                        const minPayment = calculatePaymentForYears(maxYears); // Longer term = lower payment
                        
                        // Use the full range for scaling, with some padding
                        const paymentRange = maxPayment - minPayment;
                        const scaledWidth = paymentRange > 0 
                          ? Math.max(((newPayment - minPayment) / paymentRange) * 100, 10)
                          : 50; // Fallback if range calculation fails
                        
                        return (
                          <>
                            {/* New Payment Bar */}
                            <div 
                              className={`absolute left-0 top-0 h-full bg-gradient-to-r ${gradientColor} rounded-lg shadow-sm transition-all duration-700 ease-out`}
                              style={{ 
                                width: `${Math.min(Math.max(scaledWidth, 10), 100)}%`
                              }}
                            >
                              {/* New Payment Amount Inside Bar - only if bar is wide enough */}
                              {scaledWidth >= 30 && (
                                <div className="flex items-center justify-center h-full">
                                  <span className="text-white font-bold text-lg">
                                    {formatNumberWithCommas(Math.round(newPayment))} ש"ח
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            {/* New Payment Amount Outside Bar - when bar is too narrow */}
                            {scaledWidth < 30 && (
                              <div 
                                className="absolute top-1/2 transform -translate-y-1/2 text-gray-800 font-bold text-lg bg-white px-3 py-2 rounded-lg shadow-sm border"
                                style={{ 
                                  left: `${Math.min(Math.max(scaledWidth, 10), 100)}%`,
                                  marginLeft: '12px'
                                }}
                              >
                                {formatNumberWithCommas(Math.round(newPayment))} ש"ח
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                    
                    {/* Current Payment Indicator - Below the bar */}
                    <div className="relative mt-2">
                      <div 
                        className="absolute top-0 transform -translate-x-1/2"
                        style={{ 
                          left: `${(() => {
                            const { min: minYears, max: maxYears } = calculateValidYearsRange();
                            const maxPayment = calculatePaymentForYears(minYears);
                            const minPayment = calculatePaymentForYears(maxYears);
                            const paymentRange = maxPayment - minPayment;
                            return paymentRange > 0
                              ? Math.min(Math.max(((currentPayment - minPayment) / paymentRange) * 100, 0), 100)
                              : 50;
                          })()}%`
                        }}
                      >
                        <div className="flex flex-col items-center">
                          <div className="w-0.5 h-3 bg-gray-600"></div>
                          <div className="bg-gray-600 text-white text-base px-3 py-2 rounded-lg mt-1 whitespace-nowrap font-bold">
                            נוכחי: {formatNumberWithCommas(Math.round(currentPayment))} ש"ח
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Years Slider */}
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <label className="flex items-center justify-between text-lg font-semibold text-gray-900 mb-4">
              <div className="flex items-center">
                <i className="fa-solid fa-sliders mr-2 text-blue-600"></i>
                {formData.age ? `המשכנתא החדשה תיפרס על פני ${simulatorYears} שנים` : 'תקופת המשכנתא החדשה (שנים)'}
              </div>
            </label>
            
            {!formData.age ? (
              /* Locked Slider */
              <div className="relative">
                <div className="relative mb-6">
                  <input
                    type="range"
                    min={10}
                    max={30}
                    value={20}
                    disabled={true}
                    className="w-full h-4 bg-gradient-to-r from-green-300 via-blue-300 to-purple-300 rounded-lg appearance-none slider-enhanced cursor-not-allowed opacity-50"
                  />
                </div>
                
                <div className="flex justify-between text-lg text-gray-400 mb-4">
                  <span>10 שנים</span>
                  <span>30 שנים</span>
                </div>

                {/* Lock overlay */}
                <div className="absolute inset-0 bg-white bg-opacity-80 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <i className="fa-solid fa-lock text-blue-500 text-2xl mb-2"></i>
                    <p className="text-blue-900 font-semibold">הזן גיל למעלה לפתיחת הסימולטור</p>
                  </div>
                </div>
              </div>
            ) : (
              /* Active Slider */
              <>
                <div className="relative mb-6">
                  <input
                    type="range"
                    min={minYears}
                    max={maxYears}
                    value={simulatorYears}
                    onChange={handleYearsChange}
                    className="w-full h-4 bg-gradient-to-r from-green-300 via-blue-300 to-purple-300 rounded-lg appearance-none slider-enhanced cursor-pointer"
                  />
                </div>
                
                <div className="flex justify-between text-lg text-gray-500 mb-4">
                  <span>{minYears} שנים</span>
                  <span>{maxYears} שנים</span>
                </div>

                {/* Validation Messages */}
                {!validation.isValid && (
                  <div className="bg-red-100 border border-red-300 rounded-lg p-3 mb-3">
                    <div className="text-red-700 font-medium text-lg">
                      <i className="fa-solid fa-exclamation-triangle mr-2"></i>
                      {validation.violations[0]}
                    </div>
                  </div>
                )}

                {/* Advanced Info */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-lg text-green-700">
                    <i className="fa-solid fa-check-circle"></i>
                    <span>
                      <span className="font-medium">סימולטור מתקדם פעיל</span> - 
                      מקסימום שנים מותר: {maxAllowedYears} שנים (עד גיל {currentMortgageParams.regulations.maxBorrowerAge})
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-4 space-y-3">
          {/* Primary CTA */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-green-600 text-white w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-green-200">
                <i className="fa-solid fa-shield-heart text-sm"></i>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-lg">חיסכון נוסף בביטוח המשכנתא</h4>
                <p className="text-gray-600 text-lg">ניתן לחסוך כ-<span className="font-bold text-green-600">50,000 ש"ח</span> בביטוח המשכנתא</p>
              </div>
            </div>
            <Button 
              onClick={() => alert("תודה! יועץ בכיר ייצור איתך קשר בשעות הקרובות עם הניתוח המלא והצעה מותאמת אישית.")} 
              className="px-4 py-2 text-lg bg-green-600 hover:bg-green-700"
            >
              <i className="fa-solid fa-phone mr-1"></i>
              לשיחה עם המומחים
            </Button>
          </div>
          
          {/* Secondary CTA */}
          <button onClick={resetForm} className="w-full text-blue-600 font-medium text-lg hover:underline">
            בדוק תרחיש אחר
          </button>
        </div>
      </div>

      <style>{`
        .slider-enhanced::-webkit-slider-thumb {
          appearance: none;
          height: 28px;
          width: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .slider-enhanced::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.6);
        }
        
        .slider-enhanced:disabled::-webkit-slider-thumb {
          background: #9ca3af;
          cursor: not-allowed;
          transform: none;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }
        
        .slider-enhanced::-moz-range-thumb {
          height: 28px;
          width: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
          cursor: pointer;
          border: none;
          transition: all 0.2s ease;
        }
        
        .slider-enhanced::-moz-range-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.6);
        }
        
        .slider-enhanced:disabled::-moz-range-thumb {
          background: #9ca3af;
          cursor: not-allowed;
          transform: none;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }

        .slider-enhanced::-webkit-slider-runnable-track {
          height: 16px;
          border-radius: 8px;
          background: linear-gradient(to right, #10b981, #3b82f6, #8b5cf6);
        }

        .slider-enhanced::-moz-range-track {
          height: 16px;
          border-radius: 8px;
          background: linear-gradient(to right, #10b981, #3b82f6, #8b5cf6);
          border: none;
        }
      `}</style>
    </div>
  );
};