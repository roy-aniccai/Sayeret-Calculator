import React, { useState, useCallback } from 'react';
import { useForm } from '../../context/FormContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { formatNumberWithCommas, formatYearsAndMonths } from '../../utils/helpers';
import { calculateRefinancedPayment } from '../../utils/calculator';
import { validateLoanParams, currentMortgageParams, calculateMonthlyPayment } from '../../utils/mortgageParams';
import { getSimulatedBarColorScheme, getCurrentBarColorScheme } from '../../utils/colorScheme';

// Move InputWithTooltip outside the component to prevent recreation on every render
const InputWithTooltip: React.FC<{
  label: string;
  tooltip: string;
  name: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
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

export const Step5Simulator: React.FC = () => {
  const { formData, updateFormData, resetForm } = useForm();
  const [simulatorPayment, setSimulatorPayment] = useState(formData.targetTotalPayment);

  // Calculate refinancing with regulatory validation
  const refinanceResult = calculateRefinancedPayment({
    ...formData,
    targetTotalPayment: simulatorPayment
  });
  
  const currentRefinanceResult = calculateRefinancedPayment(formData);
  
  // Validation with current parameters
  const validation = validateLoanParams(
    refinanceResult.breakdown.totalAmount,
    simulatorPayment,
    refinanceResult.termYears,
    formData.age || undefined,
    formData.propertyValue
  );

  const simulatedYears = refinanceResult.termYears;
  const currentYears = currentRefinanceResult.termYears;
  const maxAllowedYears = validation.maxAllowedTerm || currentMortgageParams.regulations.maxLoanTermYears;

  // Get color schemes for bars
  const simulatedColorScheme = getSimulatedBarColorScheme(currentYears, simulatedYears);
  const currentColorScheme = getCurrentBarColorScheme();

  const handlePaymentChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData.age) return; // Don't allow changes if no age is entered
    const value = parseInt(e.target.value);
    
    // Calculate what the term would be with this payment
    const testResult = calculateRefinancedPayment({
      ...formData,
      targetTotalPayment: value
    });
    
    // Check if this payment would result in valid loan terms
    const testValidation = validateLoanParams(
      testResult.breakdown.totalAmount,
      value,
      testResult.termYears,
      formData.age || undefined,
      formData.propertyValue
    );
    
    // Only update if the combination is valid
    if (testValidation.isValid) {
      setSimulatorPayment(value);
    }
  }, [formData]);

  const handleAgeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const age = parseInt(e.target.value) || null;
    updateFormData({ age });
  }, [updateFormData]);



  // Calculate valid payment range based on regulatory constraints and percentage
  const calculateValidPaymentRange = () => {
    const currentPayment = formData.targetTotalPayment;
    const rangePercent = currentMortgageParams.simulator.paymentRangePercent;
    
    // Calculate percentage-based range (this should be the primary range)
    const percentageMin = Math.round(currentPayment * (1 - rangePercent));
    const percentageMax = Math.round(currentPayment * (1 + rangePercent));
    
    // Basic regulatory minimum (don't over-constrain)
    const regulatoryMin = currentMortgageParams.regulations.minMonthlyPayment;
    
    // Apply minimal constraints to percentage range
    const minValidPayment = Math.max(percentageMin, regulatoryMin);
    const maxValidPayment = Math.min(percentageMax, 50000); // Cap at reasonable maximum
    
    return { min: minValidPayment, max: maxValidPayment };
  };
  
  const { min: minPayment, max: maxPayment } = calculateValidPaymentRange();

  return (
    <div className="animate-fade-in-up">
      {/* Compact Step Header */}
      <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">סימולטור מיחזור</h2>
      
      {/* All-in-One Calculator */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-4 shadow-lg">
        {/* Age Input Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-calculator text-blue-600 text-lg"></i>
              <h3 className="text-lg font-bold text-gray-900">מחשבון מיחזור משכנתא</h3>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xl font-bold text-gray-900">גיל:</span>
              <div className="relative">
                <input
                  type="number"
                  min="18"
                  max="80"
                  value={formData.age || ''}
                  onChange={handleAgeChange}
                  placeholder="35"
                  className={`w-24 px-4 py-3 text-2xl font-bold border-2 rounded-xl focus:outline-none focus:ring-2 text-center shadow-sm ${
                    !formData.age 
                      ? 'border-blue-400 ring-blue-200 bg-blue-50 text-blue-900 placeholder-blue-400' 
                      : 'border-gray-300 focus:ring-blue-500 text-gray-900 bg-white'
                  }`}
                />
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500">
                  שנים
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Always show calculator - bars visible, slider locked without age */}
        <div className="space-y-4">
            {/* Visual Comparison with Payment Info */}
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              {/* Summary Header */}
              <div className="text-center mb-4">
                {(() => {
                  const paymentDiff = simulatorPayment - (formData.mortgagePayment + formData.otherLoansPayment);
                  const yearsDiff = currentYears - simulatedYears;
                  
                  // Case 1: Shorter term AND lower payment (ideal scenario)
                  if (yearsDiff > 0.1 && paymentDiff < 0) {
                    return (
                      <div className="bg-green-100 border border-green-300 rounded-lg p-4">
                        <h4 className="text-xl font-bold text-green-700 mb-2">
                          <i className="fa-solid fa-star mr-2"></i>
                          מצב אידיאלי! חיסכון כפול
                        </h4>
                        <div className="space-y-1">
                          <p className="text-green-600">
                            ✓ קיצור המשכנתא ב-{yearsDiff.toFixed(1)} שנים
                          </p>
                          <p className="text-green-600">
                            ✓ הפחתת תשלום ב-{formatNumberWithCommas(Math.abs(paymentDiff))} ש"ח בחודש
                          </p>
                        </div>
                      </div>
                    );
                  }
                  
                  // Case 2: Shorter term with higher payment
                  if (yearsDiff > 0.1 && paymentDiff > 0) {
                    return (
                      <div className="bg-green-100 border border-green-300 rounded-lg p-4">
                        <h4 className="text-xl font-bold text-green-700 mb-2">
                          <i className="fa-solid fa-arrow-down mr-2"></i>
                          קיצור המשכנתא ב-{yearsDiff.toFixed(1)} שנים
                        </h4>
                        <p className="text-green-600">
                          תוספת של {formatNumberWithCommas(paymentDiff)} ש"ח בחודש
                        </p>
                      </div>
                    );
                  }
                  
                  // Case 3: Longer term with lower payment
                  if (yearsDiff < -0.1 && paymentDiff < 0) {
                    return (
                      <div className="bg-amber-100 border border-amber-300 rounded-lg p-4">
                        <h4 className="text-xl font-bold text-amber-700 mb-2">
                          <i className="fa-solid fa-arrow-up mr-2"></i>
                          הארכת המשכנתא ב-{Math.abs(yearsDiff).toFixed(1)} שנים
                        </h4>
                        <p className="text-amber-600">
                          הפחתה של {formatNumberWithCommas(Math.abs(paymentDiff))} ש"ח בחודש
                        </p>
                      </div>
                    );
                  }
                  
                  // Case 4: Longer term with higher payment (unusual)
                  if (yearsDiff < -0.1 && paymentDiff > 0) {
                    return (
                      <div className="bg-red-100 border border-red-300 rounded-lg p-4">
                        <h4 className="text-xl font-bold text-red-700 mb-2">
                          <i className="fa-solid fa-exclamation-triangle mr-2"></i>
                          הארכת המשכנתא ב-{Math.abs(yearsDiff).toFixed(1)} שנים
                        </h4>
                        <p className="text-red-600">
                          תוספת של {formatNumberWithCommas(paymentDiff)} ש"ח בחודש
                        </p>
                      </div>
                    );
                  }
                  
                  // Case 5: Same term
                  return (
                    <div className="bg-blue-100 border border-blue-300 rounded-lg p-4">
                      <h4 className="text-xl font-bold text-blue-700 mb-2">
                        <i className="fa-solid fa-equals mr-2"></i>
                        אותה תקופת משכנתא
                      </h4>
                      <p className="text-blue-600">
                        {Math.abs(paymentDiff) < 50 ? 'אותו החזר חודשי' : 
                         paymentDiff > 0 ? `תוספת של ${formatNumberWithCommas(paymentDiff)} ש"ח בחודש` :
                         `הפחתה של ${formatNumberWithCommas(Math.abs(paymentDiff))} ש"ח בחודש`}
                      </p>
                    </div>
                  );
                })()}
              </div>

              {/* Bar Chart with Years and Payments */}
              <div className="flex justify-between items-end h-64 gap-6 mb-4">
                {(() => {
                  // Calculate dynamic range for better visual comparison
                  const minYears = Math.min(currentYears, simulatedYears);
                  const maxYears = Math.max(currentYears, simulatedYears);
                  const yearsDiff = maxYears - minYears;
                  
                  // Create a wider visual range - use 30% padding around the actual range
                  const padding = Math.max(yearsDiff * 0.3, 2); // At least 2 years padding
                  const visualMin = Math.max(minYears - padding, 5); // Don't go below 5 years
                  const visualMax = Math.min(maxYears + padding, 35); // Don't go above 35 years
                  const visualRange = visualMax - visualMin;
                  
                  // Calculate heights based on the dynamic range
                  const currentHeight = Math.max(((currentYears - visualMin) / visualRange) * 200, 60);
                  const simulatedHeight = Math.max(((simulatedYears - visualMin) / visualRange) * 200, 60);
                  
                  return (
                    <>
                      {/* Current State Bar */}
                      <div className="flex-1 flex flex-col justify-end items-center">
                        <div className="text-center mb-4">
                          <div className="text-lg font-bold" style={{ color: currentColorScheme.headerTextColor }}>
                            {formatYearsAndMonths(currentYears)}
                          </div>
                          <div className="text-sm text-gray-600">מצב נוכחי</div>
                        </div>
                        <div 
                          className="bar-container w-full rounded-lg transition-all duration-700 ease-out flex flex-col items-center justify-end shadow-md relative pb-4"
                          style={{ 
                            height: `${currentHeight}px`,
                            minHeight: '60px',
                            background: currentColorScheme.barGradient
                          }}
                        >
                          <div className="text-white font-bold text-center">
                            <div className="text-lg">{Math.floor(currentYears)}</div>
                            <div className="text-xs">שנים</div>
                            {currentYears % 1 > 0.1 && (
                              <div className="text-xs">{Math.round((currentYears % 1) * 12)} חודשים</div>
                            )}
                          </div>
                        </div>
                        <div 
                          className="text-center mt-4 rounded-lg p-2 w-full"
                          style={{ 
                            backgroundColor: currentColorScheme.paymentBoxBg,
                            color: currentColorScheme.paymentBoxText
                          }}
                        >
                          <div className="text-xs">החזר נוכחי</div>
                          <div className="font-bold text-sm">
                            {formatNumberWithCommas(formData.mortgagePayment + formData.otherLoansPayment)} ₪
                          </div>
                        </div>
                      </div>

                      {/* Simulated State Bar - Dynamic Colors */}
                      <div className="flex-1 flex flex-col justify-end items-center">
                        <div className="text-center mb-4">
                          <div className="text-lg font-bold" style={{ color: simulatedColorScheme.headerTextColor }}>
                            {formatYearsAndMonths(simulatedYears)}
                          </div>
                          <div className="text-sm text-gray-600">לאחר מיחזור</div>
                        </div>
                        <div 
                          className="bar-container w-full rounded-lg transition-all duration-700 ease-out flex flex-col items-center justify-end shadow-lg relative pb-4"
                          style={{ 
                            height: `${simulatedHeight}px`,
                            minHeight: '60px',
                            background: simulatedColorScheme.barGradient
                          }}
                        >
                          <div className="text-white font-bold text-center">
                            <div className="text-lg">{Math.floor(simulatedYears)}</div>
                            <div className="text-xs">שנים</div>
                            {simulatedYears % 1 > 0.1 && (
                              <div className="text-xs">{Math.round((simulatedYears % 1) * 12)} חודשים</div>
                            )}
                          </div>
                        </div>
                        <div 
                          className="text-center mt-4 rounded-lg p-2 w-full"
                          style={{ 
                            backgroundColor: simulatedColorScheme.paymentBoxBg,
                            color: simulatedColorScheme.paymentBoxText
                          }}
                        >
                          <div className="text-xs">החזר חדש</div>
                          <div className="font-bold text-sm">
                            {formatNumberWithCommas(simulatorPayment)} ₪
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Payment Slider */}
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <label className="block text-base font-semibold text-gray-900 mb-3">
                <i className="fa-solid fa-sliders mr-2 text-blue-600"></i>
                החזר חודשי (₪)
              </label>
              
              {!formData.age ? (
                /* Simple Locked Slider */
                <div className="relative">
                  <div className="relative mb-4">
                    <input
                      type="range"
                      min={minPayment}
                      max={maxPayment}
                      value={formData.targetTotalPayment}
                      disabled={true}
                      className="w-full h-4 bg-gradient-to-r from-green-300 via-blue-300 to-purple-300 rounded-lg appearance-none slider-enhanced cursor-not-allowed opacity-50"
                    />
                    <div 
                      className="absolute top-6 transform translate-x-1/2 bg-gray-500 text-white px-2 py-1 rounded text-xs font-bold pointer-events-none"
                      style={{
                        right: `${((formData.targetTotalPayment - minPayment) / (maxPayment - minPayment)) * 100}%`
                      }}
                    >
                      {formatNumberWithCommas(formData.targetTotalPayment)} ₪
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm text-gray-400 mb-3">
                    <span>{formatNumberWithCommas(minPayment)} ₪</span>
                    <span>{formatNumberWithCommas(maxPayment)} ₪</span>
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
                  <div className="relative mb-4">
                    <input
                      type="range"
                      min={minPayment}
                      max={maxPayment}
                      value={simulatorPayment}
                      onChange={handlePaymentChange}
                      disabled={!formData.age}
                      className={`w-full h-4 bg-gradient-to-r from-green-300 via-blue-300 to-purple-300 rounded-lg appearance-none slider-enhanced ${
                        formData.age ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                      }`}
                    />
                    <div 
                      className="absolute top-6 transform translate-x-1/2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold pointer-events-none transition-all duration-300"
                      style={{
                        right: `${((simulatorPayment - minPayment) / (maxPayment - minPayment)) * 100}%`
                      }}
                    >
                      {formatNumberWithCommas(simulatorPayment)} ₪
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm text-gray-500 mb-3">
                    <span>{formatNumberWithCommas(minPayment)} ₪</span>
                    <span>{formatNumberWithCommas(maxPayment)} ₪</span>
                  </div>

                  {/* Validation Messages */}
                  {!validation.isValid && (
                    <div className="bg-red-100 border border-red-300 rounded-lg p-2 mb-3">
                      <div className="text-red-700 font-medium">
                        <i className="fa-solid fa-exclamation-triangle mr-2"></i>
                        {validation.violations[0]}
                      </div>
                    </div>
                  )}

                  {/* Advanced Info */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                    <div className="flex items-center gap-2 text-sm text-green-700">
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

        {/* Call to Action with integrated insurance savings message */}
        <div className="mt-4 space-y-3">
          {/* Primary CTA with insurance savings integrated */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-green-600 text-white w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-green-200">
                <i className="fa-solid fa-shield-heart text-sm"></i>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-base">חיסכון נוסף בביטוח המשכנתא</h4>
                <p className="text-gray-600 text-sm">ניתן לחסוך כ-<span className="font-bold text-green-600">50,000 ש"ח</span> בביטוח המשכנתא</p>
              </div>
            </div>
            <Button 
              onClick={() => alert("תודה! יועץ בכיר ייצור איתך קשר בשעות הקרובות עם הניתוח המלא והצעה מותאמת אישית.")} 
              className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700"
            >
              <i className="fa-solid fa-phone mr-1"></i>
              לשיחה עם המומחים
            </Button>
          </div>
          
          {/* Secondary CTA */}
          <button onClick={resetForm} className="w-full text-blue-600 font-medium text-base hover:underline">
            בדוק תרחיש אחר
          </button>
        </div>
      </div>

      <style jsx>{`
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

        /* Remove any default backgrounds and ensure clean bar display */
        .bar-container {
          background: transparent;
        }
        
        /* Animation for bars */
        @keyframes barGrow {
          from {
            height: 0;
          }
          to {
            height: var(--target-height);
          }
        }
      `}</style>
    </div>
  );
};