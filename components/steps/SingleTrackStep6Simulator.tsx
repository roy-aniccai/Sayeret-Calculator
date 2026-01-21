import React, { useState, useCallback, useMemo } from 'react';
import { useSingleTrackForm } from '../../context/SingleTrackFormContext';
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
import { getTrackConfigSafe } from '../../utils/trackConfig';
import { SimulatorVersion } from '../../utils/abTestingUtils';
import { ScenarioCard } from '../ui/ScenarioCard';
import { calculateScenarios, ScenarioInput } from '../../utils/scenarioCalculator';

/**
 * SingleTrackStep6Simulator - Monthly payment reduction simulator for single-track calculator
 * 
 * This component is adapted from Step5Simulator for the single-track flow.
 * It focuses on monthly payment reduction simulation and integrates with SingleTrackFormContext.
 * 
 * Requirements: 1.2, 4.2, 3.1, 3.2, 3.4 - A/B Testing Infrastructure
 */

interface SingleTrackStep6SimulatorProps {
  version?: SimulatorVersion;
}

export const SingleTrackStep6Simulator: React.FC<SingleTrackStep6SimulatorProps> = ({ 
  version = 'A' 
}) => {
  console.log('Single Track Simulator RTL Fix Applied: v1.1 (Consistent Scale)');
  const { 
    formData, 
    updateFormData, 
    resetForm, 
    trackCampaignEvent,
    trackConversion,
    sessionId 
  } = useSingleTrackForm();
  
  // Get track configuration for single-track (always MONTHLY_REDUCTION)
  const config = getTrackConfigSafe(TrackType.MONTHLY_REDUCTION);
  const primaryColor = config.ui.primaryColor;

  const [showDialog, setShowDialog] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: 'סיירת המשכנתא',
      text: 'בואו לבדוק כמה אפשר לחסוך במשכנתא עם המחשבון של סיירת המשכנתא!',
      url: window.location.href
    };

    // Track share attempt
    trackCampaignEvent('single_track_simulator_share_attempt', {
      step: 6,
      shareMethod: navigator.share ? 'native' : 'clipboard',
      version
    });

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        trackCampaignEvent('single_track_simulator_share_success', {
          step: 6,
          shareMethod: 'native',
          version
        });
      } catch (err) {
        // User cancelled or share failed, fallback to copy
        console.log('Share failed:', err);
        trackCampaignEvent('single_track_simulator_share_cancelled', {
          step: 6,
          error: err instanceof Error ? err.message : 'Unknown error',
          version
        });
      }
    } else {
      // Fallback
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 3000);
        trackCampaignEvent('single_track_simulator_share_success', {
          step: 6,
          shareMethod: 'clipboard',
          version
        });
      } catch (err) {
        console.error('Failed to copy text: ', err);
        trackCampaignEvent('single_track_simulator_share_failed', {
          step: 6,
          error: err instanceof Error ? err.message : 'Unknown error',
          version
        });
      }
    }
  };

  // Calculate what payment would be needed for the selected years
  const calculatePaymentForYears = (years: number) => {
    const mortgageAmount = formData.mortgageBalance;
    const otherLoansAmount = formData.otherLoansBalance;
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

  // Calculate valid years range for monthly reduction track - memoized to prevent recalculation
  const { min: minYears, max: maxYears, noSolution } = useMemo(() => {
    // Calculate current payment inside the function
    const currentPayment = formData.mortgagePayment + formData.otherLoansPayment;
    
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
    const otherLoansAmount = formData.otherLoansBalance;
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

    // TRACK: Monthly Payment Reduction (Single Track Focus)
    // Goal: Only show years where NewPayment < CurrentPayment
    // Strategy: Find the minimum year `y` where `Payment(y) < CurrentPayment`
    let minYears = minYearsFinancial;
    let maxYears = absMaxYears;

    if (currentPayment > 0) {
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

    // Final Sanity Check
    minYears = Math.max(minYears, minRegYears);
    maxYears = Math.max(maxYears, minYears); // Ensure max >= min

    if (maxYears < minYears) return { min: 0, max: 0, noSolution: true };

    return { min: minYears, max: maxYears, noSolution: false };
  }, [formData.age, formData.mortgageBalance, formData.otherLoansBalance, formData.oneTimePaymentAmount, formData.mortgagePayment, formData.otherLoansPayment]);

  // Calculate middle value for initial simulator years - memoized to prevent recalculation
  const initialSimulatorYears = useMemo(() => {
    if (noSolution) return 20; // Fallback
    return Math.round((minYears + maxYears) / 2);
  }, [minYears, maxYears, noSolution]);

  const [simulatorYears, setSimulatorYears] = useState(initialSimulatorYears);

  const newPayment = calculatePaymentForYears(simulatorYears);
  const currentPayment = formData.mortgagePayment + formData.otherLoansPayment;

  // Validation with current parameters
  const validation = validateLoanParams(
    formData.mortgageBalance + formData.otherLoansBalance,
    newPayment,
    simulatorYears,
    formData.age || undefined,
    formData.propertyValue
  );

  const maxAllowedYears = validation.maxAllowedTerm || currentMortgageParams.regulations.maxLoanTermYears;

  // Reset/Adjust years if they fall out of range
  React.useEffect(() => {
    if (noSolution) return;

    // Update to middle value if current value is out of range
    if (simulatorYears < minYears || simulatorYears > maxYears) {
      const middleYears = Math.round((minYears + maxYears) / 2);
      // Only update if the value is actually different to prevent infinite loops
      if (simulatorYears !== middleYears) {
        setSimulatorYears(middleYears);
      }
    }
  }, [minYears, maxYears, noSolution, simulatorYears]);

  const handleYearsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const years = parseInt(e.target.value);

    // Ensure the years are within valid range
    if (years >= minYears && years <= maxYears) {
      setSimulatorYears(years);
      
      // Track slider interaction
      trackCampaignEvent('single_track_simulator_years_changed', {
        step: 6,
        years,
        newPayment: calculatePaymentForYears(years),
        currentPayment,
        version
      });
    }
  }, [minYears, maxYears, trackCampaignEvent, currentPayment, version]);

  // Track simulator interaction on component mount
  React.useEffect(() => {
    trackCampaignEvent('single_track_simulator_loaded', {
      step: 6,
      currentPayment,
      version // Track which version is being used
    });
    
    // Track conversion - user has completed the entire single-track flow
    trackConversion('flow_completion', {
      step: 6,
      currentPayment,
      version
    });
  }, [version]); // Include version in dependency array

  // Determine colors based on payment comparison
  const paymentDiff = newPayment - currentPayment;
  const isReduction = paymentDiff < 0;
  const gradientColor = isReduction ? 'from-green-400 to-green-600' : 'from-blue-400 to-blue-600';

  const handleContactExpert = () => {
    // Track expert contact request
    trackCampaignEvent('single_track_simulator_contact_expert', {
      step: 6,
      simulatorYears,
      newPayment,
      currentPayment,
      paymentDiff,
      sessionId,
      version
    });
    
    // Track conversion - user has completed the single-track flow
    trackConversion('contact_expert', {
      step: 6,
      simulatorYears,
      newPayment,
      currentPayment,
      paymentDiff: Math.round(paymentDiff),
      paymentReduction: paymentDiff < 0 ? Math.abs(Math.round(paymentDiff)) : 0,
      version
    });
    
    setShowDialog(true);
  };

  const handleTryAnother = () => {
    // Track restart request
    trackCampaignEvent('single_track_simulator_restart', {
      step: 6,
      simulatorYears,
      newPayment,
      currentPayment,
      paymentDiff,
      version
    });
    
    resetForm();
  };

  // Calculate scenarios for Version B
  const scenarioInput: ScenarioInput = useMemo(() => ({
    mortgageBalance: formData.mortgageBalance,
    otherLoansBalance: formData.otherLoansBalance,
    oneTimePaymentAmount: formData.oneTimePaymentAmount || 0,
    currentMortgagePayment: formData.mortgagePayment,
    currentOtherLoansPayment: formData.otherLoansPayment,
    age: formData.age || undefined,
    propertyValue: formData.propertyValue
  }), [formData]);

  const scenarios = useMemo(() => calculateScenarios(scenarioInput), [scenarioInput]);

  // State for selected scenario in Version B
  const [selectedScenario, setSelectedScenario] = useState<'minimum' | 'maximum' | 'middle' | null>(null);

  // Version B - Scenario Cards Interface
  if (version === 'B') {
    const handleScenarioSelect = (scenarioType: 'minimum' | 'maximum' | 'middle') => {
      setSelectedScenario(scenarioType);
      
      // Track scenario selection
      const scenario = scenarios[`${scenarioType}Scenario`];
      if (scenario) {
        trackCampaignEvent('single_track_scenario_selected', {
          step: 6,
          scenarioType,
          years: scenario.years,
          monthlyReduction: scenario.monthlyReduction,
          newPayment: scenario.monthlyPayment,
          currentPayment,
          version
        });
      }
    };

    return (
      <div className="animate-fade-in-up">
        {/* Promoted Subtitle as Primary Step Title */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">תוצאות הסימולציה</h2>
          <p className="text-gray-600">בחר את התרחיש המתאים לך</p>
        </div>

        {/* Scenario Cards Container */}
        <div className={`bg-gradient-to-br from-${primaryColor}-50 to-indigo-50 border-2 border-${primaryColor}-200 rounded-2xl p-4 shadow-lg`}>
          
          {/* Special Cases Handling */}
          {scenarios.specialCase === 'no-mortgage-savings' && (
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm text-center">
              <div className="mb-4">
                <i className="fa-solid fa-exclamation-triangle text-4xl text-orange-500 mb-3"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                אין אפשרות לחסוך
              </h3>
              <p className="text-gray-600 mb-4">
                בנתונים שהוזנו, לא ניתן להגיע לחיסכון במשכנתא. אולי נוכל לעזור עם ביטוח משכנתא?
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-blue-800 mb-2">חיסכון בביטוח משכנתא</h4>
                <p className="text-blue-700">עד 50,000 ש"ח חיסכון בביטוח משכנתא</p>
              </div>
            </div>
          )}

          {scenarios.specialCase === 'insufficient-savings' && (
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm text-center">
              <div className="mb-4">
                <i className="fa-solid fa-info-circle text-4xl text-blue-500 mb-3"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                חיסכון מוגבל
              </h3>
              <p className="text-gray-600 mb-4">
                החיסכון האפשרי נמוך מ-1000 ש"ח בחודש. נציג יכול לבדוק אפשרויות נוספות.
              </p>
              {scenarios.maximumScenario && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">האפשרות הטובה ביותר</h4>
                  <p className="text-gray-700">
                    חיסכון של {Math.round(scenarios.maximumScenario.monthlyReduction)} ש"ח בחודש
                    על פני {scenarios.maximumScenario.years} שנים
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Normal Scenario Cards - Display exactly three cards */}
          {scenarios.hasValidScenarios && (
            <div className="space-y-4">
              {/* Minimum Scenario Card */}
              {scenarios.minimumScenario && (
                <ScenarioCard
                  type="minimum"
                  years={scenarios.minimumScenario.years}
                  monthlyReduction={scenarios.minimumScenario.monthlyReduction}
                  currentPayment={currentPayment}
                  onClick={() => handleScenarioSelect('minimum')}
                  isSelected={selectedScenario === 'minimum'}
                />
              )}

              {/* Middle Scenario Card */}
              {scenarios.middleScenario && (
                <ScenarioCard
                  type="middle"
                  years={scenarios.middleScenario.years}
                  monthlyReduction={scenarios.middleScenario.monthlyReduction}
                  currentPayment={currentPayment}
                  onClick={() => handleScenarioSelect('middle')}
                  isSelected={selectedScenario === 'middle'}
                />
              )}

              {/* Maximum Scenario Card */}
              {scenarios.maximumScenario && (
                <ScenarioCard
                  type="maximum"
                  years={scenarios.maximumScenario.years}
                  monthlyReduction={scenarios.maximumScenario.monthlyReduction}
                  currentPayment={currentPayment}
                  onClick={() => handleScenarioSelect('maximum')}
                  isSelected={selectedScenario === 'maximum'}
                />
              )}
            </div>
          )}

          {/* Call to Action for Version B */}
          <div className="mt-6 space-y-3">
            <Button
              onClick={handleContactExpert}
              className="w-full py-3 md:py-4 text-lg md:text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-500/30 transform transition-all hover:scale-[1.02]"
            >
              <span className="flex items-center justify-center gap-2">
                <i className="fa-solid fa-phone-volume animate-bounce"></i>
                לשיחה עם המומחים
              </span>
            </Button>

            <button 
              onClick={handleTryAnother} 
              className={`w-full text-${primaryColor}-600 font-medium text-base md:text-lg hover:underline`}
            >
              בדוק תרחיש אחר
            </button>
          </div>
        </div>

        {/* Dialog remains the same for both versions */}
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
    );
  }

  // Version A - Current Slider Interface (Default)

  return (
    <div className="animate-fade-in-up">
      {/* Promoted Subtitle as Primary Step Title */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">תוצאות הסימולציה</h2>
      </div>

      {/* All-in-One Calculator */}
      <div className={`bg-gradient-to-br from-${primaryColor}-50 to-indigo-50 border-2 border-${primaryColor}-200 rounded-2xl p-4 shadow-lg`}>
        {/* Always show calculator - Add extra padding for the large CTA footer */}
        <div className="space-y-5 pb-48 md:pb-4">
          {/* Visual Comparison with Payment Info */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            {/* Summary Header - Focus on Monthly Reduction */}
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
            <div className="mb-2">
              <div className="px-4">
                <div className="w-full">
                  {/* Single Payment Bar */}
                  <div className="relative">
                    {/* Single Bar Container */}
                    <div className="relative h-12 bg-gray-200 rounded-lg overflow-hidden">
                      {(() => {
                        // Calculate the range for proper scaling - use memoized values
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
                            {/* New Payment Bar (Background Layer z-10) */}
                            <div
                              className={`absolute right-0 top-0 h-full bg-gradient-to-l ${gradientColor} rounded-lg shadow-sm transition-all duration-700 ease-out z-10`}
                              style={{
                                width: `${visualWidth}%`
                              }}
                            />

                            {/* New Payment Label Overlay (Foreground Layer z-30) - Always on top of everything */}
                            <div className="absolute inset-0 z-30 pointer-events-none">
                              {/* If bar is wide enough, center text in the bar area */}
                              {visualWidth >= 30 ? (
                                <div
                                  className="absolute right-0 top-0 h-full flex items-center justify-center"
                                  style={{ width: `${visualWidth}%` }}
                                >
                                  <span className="text-white font-bold text-lg whitespace-nowrap px-1">
                                    {formatNumberWithCommas(Math.round(newPayment))} ש"ח
                                  </span>
                                </div>
                              ) : (
                                /* If bar is too narrow, position text to the left of the bar */
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
                            </div>
                          </>
                        );
                      })()}
                    </div>

                    {/* Current Payment Indicator - Below the bar */}
                    <div className="relative mt-0">
                      <div
                        className="absolute top-0 transform translate-x-1/2"
                        style={{
                          right: `${(() => {
                            // Use memoized values for consistent scaling
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
                        <div className="flex flex-col items-center group cursor-help">
                          {/* Tick mark container with absolute positioning for label */}
                          <div className="relative flex items-center">
                            {/* Tick mark - extending up through the bar (h-12 bar + extra) */}
                            <div className="w-1 h-[70px] bg-gray-600 -mt-12 shadow-sm z-10 relative rounded-full"></div>

                            {/* Label Container - Position to prevent overflow */}
                            <div className="absolute left-0 pl-2 top-1 whitespace-nowrap">
                              <div className="flex items-center bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded border border-gray-100 shadow-sm">
                                <span className="text-gray-900 text-lg font-bold leading-none ml-1">
                                  {formatNumberWithCommas(Math.round(currentPayment))}
                                </span>
                                <span className="text-gray-900 text-lg font-bold leading-none">
                                  ש"ח
                                </span>
                                <span className="text-gray-500 text-xs font-semibold mx-1">
                                  (נוכחי)
                                </span>
                              </div>
                            </div>
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
          <div className="bg-white rounded-xl p-3 border border-gray-200">
            <label className="flex items-center justify-between text-base font-semibold text-gray-900 mb-2">
              <div className="flex items-center">
                <i className={`fa-solid fa-sliders mr-2 text-${primaryColor}-600`}></i>
                המשכנתא החדשה תיפרס על פני {simulatorYears} שנים
              </div>
            </label>

            {noSolution ? (
              /* No Solution Message */
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 text-center animate-fade-in">
                <div className="mb-3">
                  <i className="fa-solid fa-triangle-exclamation text-orange-500 text-3xl"></i>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  לא נמצאו אפשרויות להפחתת ההחזר
                </h3>
                <p className="text-gray-600 mb-4">
                  בנתונים שהוזנו, לא ניתן להגיע להחזר חודשי נמוך מהנוכחי, גם בפריסה ל-30 שנה. מומלץ להתייעץ עם מומחה.
                </p>
                <Button
                  onClick={handleContactExpert}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white shadow-md"
                >
                  <i className="fa-solid fa-comments mr-2"></i>
                  דבר עם יועץ לבדיקה ידנית
                </Button>
              </div>
            ) : (
              /* Active Slider */
              <>
                <div className="relative mb-3">
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

                <div className="flex justify-between text-sm text-gray-500 mb-1">
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
          <Button
            onClick={handleContactExpert}
            className="w-full py-3 md:py-4 text-lg md:text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-500/30 transform transition-all hover:scale-[1.02]"
          >
            <span className="flex items-center justify-center gap-2">
              <i className="fa-solid fa-phone-volume animate-bounce"></i>
              לשיחה עם המומחים
            </span>
          </Button>

          {/* Secondary CTA */}
          <button 
            onClick={handleTryAnother} 
            className={`w-full text-${primaryColor}-600 font-medium text-base md:text-lg hover:underline`}
          >
            בדוק תרחיש אחר
          </button>
        </div>

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
    </div>
  );
};