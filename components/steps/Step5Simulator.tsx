import React, { useState, useCallback } from 'react';
import { useForm } from '../../context/FormContext';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { formatNumberWithCommas } from '../../utils/helpers';
import {
  validateLoanParams,
  currentMortgageParams,
  calculateMonthlyPayment,
  calculateWeightedMortgageRate,
  calculateWeightedOtherLoansRate
} from '../../utils/mortgageParams';
import { TrackType } from '../../types';
import { generateContextualBackText } from '../../utils/navigationContext';

export const Step5Simulator: React.FC = () => {
  console.log('Simulator RTL Fix Applied: v1.1 (Consistent Scale)');
  const { formData, updateFormData, resetForm, getTrackConfig } = useForm();
  const config = getTrackConfig();
  const primaryColor = config.ui.primaryColor;

  const [simulatorYears, setSimulatorYears] = useState(20); // Start with 20 years
  const [showDialog, setShowDialog] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: 'סיירת המשכנתא',
      text: 'בואו לבדוק כמה אפשר לחסוך במשכנתא עם המחשבון של סיירת המשכנתא!',
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or share failed, fallback to copy
        console.log('Share failed:', err);
      }
    } else {
      // Fallback
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 3000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    }
  };

  // Calculate what payment would be needed for the selected years
  const calculatePaymentForYears = (years: number) => {
    const mortgageAmount = formData.mortgageBalance;
    const otherLoansAmount = formData.otherLoansBalance + Math.abs(formData.bankAccountBalance);
    // Reduce total amount by one-time payment if available
    const oneTimePayment = formData.oneTimePaymentAmount || 0;
    const totalAmount = Math.max(0, mortgageAmount + otherLoansAmount - oneTimePayment);

    // Use the exact same calculation as in the main calculator
    const mortgageRate = calculateWeightedMortgageRate();
    const otherLoansRate = calculateWeightedOtherLoansRate();

    // Calculate weighted rate exactly like in calculator.ts
    const weightedRate = totalAmount > 0 ?
      (mortgageAmount * mortgageRate + otherLoansAmount * otherLoansRate) / totalAmount :
      mortgageRate;

    return calculateMonthlyPayment(totalAmount, weightedRate, years);
  };

  // Logic to solve for years based on target payment (for Shorten Term track)
  const calculateYearsForPayment = (targetPayment: number) => {
    const mortgageAmount = formData.mortgageBalance;
    const otherLoansAmount = formData.otherLoansBalance + Math.abs(formData.bankAccountBalance);
    const oneTimePayment = formData.oneTimePaymentAmount || 0;
    const totalAmount = Math.max(0, mortgageAmount + otherLoansAmount - oneTimePayment);

    const mortgageRate = calculateWeightedMortgageRate();
    const otherLoansRate = calculateWeightedOtherLoansRate();
    const weightedRate = totalAmount > 0 ?
      (mortgageAmount * mortgageRate + otherLoansAmount * otherLoansRate) / totalAmount :
      mortgageRate;

    // Iterate to find the closest year match
    // Standard constraints: 5 to 30 years
    let closestYears = 20;
    let minDiff = Infinity;

    for (let y = 4; y <= 35; y++) {
      const p = calculateMonthlyPayment(totalAmount, weightedRate, y);
      const diff = Math.abs(p - targetPayment);
      if (diff < minDiff) {
        minDiff = diff;
        closestYears = y;
      }
    }
    return closestYears;
  };

  // Initialize years based on track intent
  React.useEffect(() => {
    if (formData.track === TrackType.SHORTEN_TERM && formData.targetTotalPayment > 0) {
      const optimalYears = calculateYearsForPayment(formData.targetTotalPayment);
      setSimulatorYears(optimalYears);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only on mount to set initial state based on previous steps

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

  // Calculate valid years range based on mathematical constraints AND Track Type
  const calculateValidYearsRange = useCallback(() => {
    // Basic Regulatory Constraints
    const minRegYears = 5; // Minimum 5 years by regulation/logic
    const maxRegYears = 30; // Standard max years

    // 1. Age Constraint
    let maxYearsByAge = 35; // Default if no age
    if (formData.age) {
      maxYearsByAge = currentMortgageParams.regulations.maxBorrowerAge - formData.age;
    }
    const absMaxYears = Math.min(maxYearsByAge, currentMortgageParams.regulations.maxLoanTermYears);

    // 2. Financial Constraints (Min Years) - Standard Min Payment Logic
    const mortgageAmount = formData.mortgageBalance;
    const otherLoansAmount = formData.otherLoansBalance + Math.abs(formData.bankAccountBalance);
    const oneTimePayment = formData.oneTimePaymentAmount || 0;
    const totalAmount = Math.max(0, mortgageAmount + otherLoansAmount - oneTimePayment);
    const maxReasonablePayment = currentPayment * 2.5; // Allow a bit more flexibility

    // Calculate weighted rate
    const mortgageRate = calculateWeightedMortgageRate();
    const otherLoansRate = calculateWeightedOtherLoansRate();
    const weightedRate = totalAmount > 0 ?
      (mortgageAmount * mortgageRate + otherLoansAmount * otherLoansRate) / totalAmount :
      mortgageRate;
    const monthlyRate = weightedRate / 12;

    // Calculate absolute minimum years to fit maxReasonablePayment
    let minYearsFinancial = 5;
    if (monthlyRate > 0 && totalAmount > 0) {
      const minPayments = Math.log(1 + (totalAmount * monthlyRate) / maxReasonablePayment) /
        Math.log(1 + monthlyRate);
      minYearsFinancial = Math.max(Math.ceil(minPayments / 12), 5);
    }

    // --- TRACK SPECIFIC LOGIC ---
    let minYears = minYearsFinancial;
    let maxYears = absMaxYears;

    // TRACK: Monthly Payment Reduction
    // Goal: Only show years where NewPayment < CurrentPayment
    // Strategy: Find the minimum year `y` where `Payment(y) < CurrentPayment`
    if (formData.track === TrackType.MONTHLY_REDUCTION && currentPayment > 0) {
      // We want to force the user to see results better than today.
      // So valid range starts from the year that gives a lower payment.
      // Payment decreases as years increase.
      // So we need to find the SMALLEST year that satisfies Payment < CurrentPayment

      let firstValidYear = -1;
      // Scan from min possible to max possible
      for (let y = minYearsFinancial; y <= maxYears; y++) {
        const p = calculateMonthlyPayment(totalAmount, weightedRate, y);
        if (p < currentPayment) {
          firstValidYear = y;
          break;
        }
      }

      if (firstValidYear !== -1) {
        minYears = firstValidYear;
      } else {
        // No solution found where payment is lower
        return { min: 0, max: 0, noSolution: true };
      }
    }

    // TRACK: Shorten Term
    // Goal: Only show years where Term <= CurrentTerm (and ideally Payment is manageable)
    // Constraint: MaxYears must effectively be <= CurrentYearsRemaining
    if (formData.track === TrackType.SHORTEN_TERM && formData.yearsRemaining) {
      // The user wants to SHORTEN the term. Showing 30 years when they have 15 left is irrelevant.
      // We might allow a small buffer (e.g. +1 year) just in case, but strictly "Shorten" means <= Current.
      // Let's stick to strict <= Current to be helpful.

      const currentRemaining = formData.yearsRemaining;
      maxYears = Math.min(maxYears, currentRemaining);

      // Note: If the new amount is much larger (consolidated loans), 
      // keeping the same years might result in huge payments. 
      // But the user selected "Shorten Term", so we assume they want this constraint.

      if (maxYears < minYears) {
        // Impossible to shorten term with reasonable payments (violates financial min)
        return { min: 0, max: 0, noSolution: true };
      }
    }

    // Final Sanity Check
    minYears = Math.max(minYears, minRegYears);
    maxYears = Math.max(maxYears, minYears); // Ensure max >= min

    if (maxYears < minYears) return { min: 0, max: 0, noSolution: true };

    return { min: minYears, max: maxYears, noSolution: false };
  }, [formData.age, formData.track, formData.yearsRemaining, formData.mortgageBalance, formData.otherLoansBalance, formData.bankAccountBalance, formData.oneTimePaymentAmount, currentPayment]);

  const { min: minYears, max: maxYears, noSolution } = calculateValidYearsRange();

  // Reset/Adjust years if they fall out of range
  React.useEffect(() => {
    if (noSolution) return;

    if (simulatorYears < minYears) setSimulatorYears(minYears);
    else if (simulatorYears > maxYears) setSimulatorYears(maxYears);

  }, [minYears, maxYears, noSolution, simulatorYears]);

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
    // Years will self-correct via the useEffect above
  }, [updateFormData]);

  // Determine colors based on payment comparison
  const paymentDiff = newPayment - currentPayment;
  const isReduction = paymentDiff < 0;
  const gradientColor = isReduction ? 'from-green-400 to-green-600' : 'from-blue-400 to-blue-600'; // Use blue instead of amber

  return (
    <div className="animate-fade-in-up">
      {/* Promoted Subtitle as Primary Step Title */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">תוצאות הסימולציה</h2>
      </div>

      {/* All-in-One Calculator */}
      <div className={`bg-gradient-to-br from-${primaryColor}-50 to-indigo-50 border-2 border-${primaryColor}-200 rounded-2xl p-4 shadow-lg`}>
        {/* Age Input Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 w-full justify-start">
              <span className="text-lg font-bold text-gray-900">גיל:</span>
              <div className="relative">
                <input
                  type="number"
                  min="18"
                  max="80"
                  value={formData.age || ''}
                  onChange={handleAgeChange}
                  placeholder="35"
                  className={`w-20 px-3 py-2 text-lg font-bold border-2 rounded-xl focus:outline-none focus:ring-2 text-center shadow-sm ${!formData.age
                    ? `border-${primaryColor}-400 ring-${primaryColor}-200 bg-${primaryColor}-50 text-${primaryColor}-900 placeholder-${primaryColor}-400`
                    : `border-gray-300 focus:ring-${primaryColor}-500 text-gray-900 bg-white`
                    }`}
                />
                <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-sm text-gray-500">
                  שנים
                </div>
              </div>

              {/* Status Message */}
              <div className="mr-2 animate-fade-in">
                {formData.age ? (
                  <div className="flex items-start text-green-800 text-sm font-bold bg-green-100 px-3 py-2 rounded-xl border-2 border-green-200 shadow-sm max-w-[200px] leading-tight">
                    <i className="fa-solid fa-check-circle ml-2 mt-0.5 text-green-600 text-lg"></i>
                    <span>
                      סימולטור פעיל - מקסימום: {maxAllowedYears} שנים (עד גיל {currentMortgageParams.regulations.maxBorrowerAge})
                    </span>
                  </div>
                ) : (
                  <div className={`flex items-center text-gray-500 text-sm font-medium animate-pulse`}>
                    <i className="fa-solid fa-circle-info ml-1.5 text-blue-400"></i>
                    הזן גיל לפתיחת הסימולטור
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Always show calculator - Add extra padding for the large CTA footer */}
        <div className="space-y-5 pb-48 md:pb-4">
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
                    <div className={`bg-${primaryColor}-100 border border-${primaryColor}-300 rounded-lg p-3`}>
                      <h4 className={`text-xl font-bold text-${primaryColor}-700 mb-1`}>
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

                        // Use the full range for scaling
                        const paymentRange = maxPayment - minPayment;

                        // Consistent linear scaling function mapping value to visual % (5% to 100%)
                        // We reserve 5% as minimum visual width/padding to avoid invisible bars or edgeclipping
                        const getVisualPercent = (amount: number) => {
                          if (paymentRange <= 0) return 50;
                          const rawPercent = Math.min(Math.max(((amount - minPayment) / paymentRange), 0), 1);
                          return 5 + (rawPercent * 95); // Map 0-1 to 5-100
                        };

                        const visualWidth = getVisualPercent(newPayment);
                        const visualMarkerPos = getVisualPercent(currentPayment);

                        return (
                          <>
                            {/* New Payment Bar */}
                            <div
                              className={`absolute right-0 top-0 h-full bg-gradient-to-l ${gradientColor} rounded-lg shadow-sm transition-all duration-700 ease-out`}
                              style={{
                                width: `${visualWidth}%`
                              }}
                            >
                              {/* New Payment Amount Inside Bar - only if bar is wide enough */}
                              {visualWidth >= 30 && (
                                <div className="flex items-center justify-center h-full">
                                  <span className="text-white font-bold text-lg">
                                    {formatNumberWithCommas(Math.round(newPayment))} ש"ח
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* New Payment Amount Outside Bar - when bar is too narrow */}
                            {visualWidth < 30 && (
                              <div
                                className="absolute top-1/2 transform -translate-y-1/2 text-gray-800 font-bold text-lg bg-white px-3 py-2 rounded-lg shadow-sm border"
                                style={{
                                  right: `${visualWidth}%`,
                                  marginRight: '12px'
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
                        className="absolute top-0 transform translate-x-1/2"
                        style={{
                          right: `${(() => {
                            const { min: minYears, max: maxYears } = calculateValidYearsRange();
                            const maxPayment = calculatePaymentForYears(minYears);
                            const minPayment = calculatePaymentForYears(maxYears);
                            const paymentRange = maxPayment - minPayment;

                            // Replicate the exact same scaling logic
                            const getVisualPercent = (amount: number) => {
                              if (paymentRange <= 0) return 50;
                              const rawPercent = Math.min(Math.max(((amount - minPayment) / paymentRange), 0), 1);
                              return 5 + (rawPercent * 95);
                            };

                            return getVisualPercent(currentPayment);
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
                <i className={`fa-solid fa-sliders mr-2 text-${primaryColor}-600`}></i>
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
                    <i className={`fa-solid fa-lock text-${primaryColor}-500 text-2xl mb-2`}></i>
                    <p className={`text-${primaryColor}-900 font-semibold`}>הזן גיל למעלה לפתיחת הסימולטור</p>
                  </div>
                </div>
              </div>
            ) : noSolution ? (
              /* No Solution Message */
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 text-center animate-fade-in">
                <div className="mb-3">
                  <i className="fa-solid fa-triangle-exclamation text-orange-500 text-3xl"></i>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {formData.track === TrackType.MONTHLY_REDUCTION
                    ? 'לא נמצאו אפשרויות להפחתת ההחזר'
                    : 'לא ניתן לקצר את תקופת המשכנתא'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {formData.track === TrackType.MONTHLY_REDUCTION
                    ? 'בנתונים שהוזנו, לא ניתן להגיע להחזר חודשי נמוך מהנוכחי, גם בפריסה ל-30 שנה. מומלץ להתייעץ עם מומחה.'
                    : 'בנתונים שהוזנו, קיצור התקופה מעבר למצב הנוכחי יחייב החזר חודשי גבוה מאוד שאינו עומד בכללי הרגולציה.'}
                </p>
                <Button
                  onClick={() => setShowDialog(true)}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white shadow-md"
                >
                  <i className="fa-solid fa-comments mr-2"></i>
                  דבר עם יועץ לבדיקה ידנית
                </Button>
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
                    inputMode="none"
                    onFocus={(e) => e.target.blur()} // Prevent keyboard on mobile
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
              </>
            )}
          </div>
        </div>

        {/* Call to Action */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:static md:bg-transparent md:border-t-0 md:shadow-none md:p-0 md:mt-4 space-y-3">
          {/* Primary CTA */}
          {/* Primary CTA */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 md:p-6 flex flex-col gap-4 md:gap-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="bg-green-600 text-white w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-green-200 animate-pulse">
                <i className="fa-solid fa-shield-heart text-lg md:text-xl"></i>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-lg md:text-xl">חיסכון נוסף בביטוח המשכנתא</h4>
                <p className="text-gray-700 text-base md:text-lg">ניתן לחסוך כ-<span className="font-bold text-green-700">50,000 ש"ח</span> בביטוח</p>
              </div>
            </div>
            <Button
              onClick={() => setShowDialog(true)}
              className="w-full py-3 md:py-4 text-lg md:text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-500/30 transform transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="flex items-center justify-center gap-2">
                <i className="fa-solid fa-phone-volume animate-bounce"></i>
                לשיחה עם המומחים
              </span>
            </Button>
          </div>

          {/* Secondary CTA */}
          <button onClick={resetForm} className={`w-full text-${primaryColor}-600 font-medium text-base md:text-lg hover:underline hidden md:block`}>
            בדוק תרחיש אחר
          </button>
        </div>

        {/* Mobile-only secondary CTA outside the sticky footer so it scrolls */}
        <button onClick={resetForm} className={`w-full text-${primaryColor}-600 font-medium text-base mt-2 hover:underline md:hidden pb-4`}>
          בדוק תרחיש אחר
        </button>

        <Dialog
          isOpen={showDialog}
          onClose={() => setShowDialog(false)}
          title="סיירת המשכנתא"
          confirmText="תודה, מעולה!"
        >
          <p>
            תודה שבחרת בנו!
            <br />
            קיבלנו את הפנייה שלך, ויועץ מומחה מסיירת המשכנתא כבר עובר על הנתונים.
            <br />
            נחזור אליך בהקדם עם ניתוח מלא והצעה שתחסוך לך כסף.
            <br />
            שיהיה יום נפלא!
          </p>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-gray-600 mb-4 font-medium">אהבת? שתף עם חברים:</p>
            <div className="flex flex-col items-center gap-3">
              <Button
                variant="secondary"
                onClick={handleShare}
                className={`w-full !bg-white !border-2 !border-${primaryColor}-200 hover:!bg-${primaryColor}-50 !text-${primaryColor}-700 gap-2 !rounded-xl !py-3`}
              >
                <i className={`fa-solid ${copySuccess ? 'fa-check' : 'fa-share-nodes'}`}></i>
                {copySuccess ? 'הקישור הועתק!' : 'שתף את המחשבון'}
              </Button>

              {copySuccess && (
                <span className="text-green-600 text-sm animate-fade-in font-medium">
                  הקישור הועתק ללוח בהצלחה
                </span>
              )}
            </div>
          </div>
        </Dialog>
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
    </div >
  );
};