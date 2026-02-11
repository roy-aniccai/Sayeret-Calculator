import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useSingleTrackForm } from '../../context/SingleTrackFormContext';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { Input } from '../ui/Input';
import { Checkbox } from '../ui/Checkbox';
import { useNotification } from '../../context/NotificationContext';
import { submitData } from '../../utils/api';
import { ContactOptionsPage } from '../ContactOptionsPage';
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
import { ScenarioCard } from '../ui/ScenarioCard';
import { calculateScenarios, ScenarioInput } from '../../utils/scenarioCalculator';
import { SimulatorFooter } from './SimulatorFooter';
import { NoSavingsCard } from './NoSavingsCard';
import { InsufficientSavingsCard } from './InsufficientSavingsCard';

/**
 * SingleTrackStep6Simulator - Monthly payment reduction simulator
 * 
 * Shows 3 scenario cards (minimum, middle, maximum) for mortgage refinancing.
 */
export const SingleTrackStep6Simulator: React.FC = () => {
  console.log('Single Track Simulator RTL Fix Applied: v1.1 (Consistent Scale)');
  const {
    formData,
    updateFormData,
    resetForm,
    trackCampaignEvent,
    trackConversion,
    sessionId,
    sendSubmissionUpdate,
    submissionDocId
  } = useSingleTrackForm();

  // Get track configuration for single-track (always MONTHLY_REDUCTION)
  const config = getTrackConfigSafe(TrackType.MONTHLY_REDUCTION);
  const primaryColor = config.ui.primaryColor;

  const [showContactOptions, setShowContactOptions] = useState(false);
  const [showLeadDialog, setShowLeadDialog] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Lead Form State
  const [leadName, setLeadName] = useState(formData.leadName || '');
  const [leadPhone, setLeadPhone] = useState(formData.leadPhone || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<{ name?: string, phone?: string }>({});
  const { showSuccessAlert, showErrorAlert } = useNotification();

  const validatePhone = (phone: string) => {
    const phoneRegex = /^0[5-9]\d{8}$/;
    return phoneRegex.test(phone.replace(/[-\s]/g, ''));
  };

  const handleLeadSubmit = async () => {
    // Validation
    const errors: { name?: string, phone?: string } = {};
    if (!leadName.trim()) errors.name = 'נא להזין שם מלא';
    if (!leadPhone.trim()) errors.phone = 'נא להזין מספר טלפון';
    else if (!validatePhone(leadPhone)) errors.phone = 'מספר טלפון לא תקין';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      // If we have a submission ID, update it
      if (submissionDocId) {
        await sendSubmissionUpdate({
          contactUpdate: {
            leadName,
            leadPhone,
          },
          action: {
            type: 'UPDATE_CONTACT_DETAILS',
            timestamp: new Date().toISOString()
          }
        });

        // Update local form data as well
        updateFormData({ leadName, leadPhone });
      } else {
        // Fallback to new submission if no ID (should generally not happen here)
        await submitData({
          sessionId,
          leadName,
          leadPhone,
          mortgageBalance: formData.mortgageBalance,
          otherLoansBalance: formData.otherLoansBalance,
          mortgagePayment: formData.mortgagePayment,
          otherLoansPayment: formData.otherLoansPayment,
          propertyValue: formData.propertyValue,
          age: formData.age || null,
          interestedInInsurance: true,
          simulationResult: null,
        });
      }

      setShowLeadDialog(false);
      showSuccessAlert('הפרטים נשלחו בהצלחה!', 'מומחה יחזור אליך בהקדם לבחינת חיסכון בביטוח.');

      // Keep the form values for UX, don't clear them immediately in case they re-open
      // setLeadName(''); 
      // setLeadPhone('');

      // Track lead form submission
      if (window.dataLayer) {
        window.dataLayer.push({ event: 'lead_form_submit' });
      }

      // Track conversion
      trackConversion('insurance_lead_submitted', {
        step: 6
      });

    } catch (error) {
      console.error('Submission error:', error);
      showErrorAlert('שגיאה', 'אירעה שגיאה בשליחת הפרטים, אנא נסה שנית.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'סיירת המשכנתא',
      text: 'בואו לבדוק כמה אפשר לחסוך במשכנתא עם המחשבון של סיירת המשכנתא!',
      url: window.location.href
    };

    // Track share attempt
    trackCampaignEvent('single_track_simulator_share_attempt', {
      step: 6,
      shareMethod: navigator.share ? 'native' : 'clipboard'
    });

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        trackCampaignEvent('single_track_simulator_share_success', {
          step: 6,
          shareMethod: 'native'
        });
      } catch (err) {
        // User cancelled or share failed, fallback to copy
        console.log('Share failed:', err);
        trackCampaignEvent('single_track_simulator_share_cancelled', {
          step: 6,
          error: err instanceof Error ? err.message : 'Unknown error'
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
          shareMethod: 'clipboard'
        });
      } catch (err) {
        console.error('Failed to copy text: ', err);
        trackCampaignEvent('single_track_simulator_share_failed', {
          step: 6,
          error: err instanceof Error ? err.message : 'Unknown error'
        });
      }
    }
  };

  // Calculate what payment would be needed for the selected years
  const calculatePaymentForYears = (years: number) => {
    const mortgageAmount = formData.mortgageBalance;
    const otherLoansAmount = formData.otherLoansBalance;
    const totalAmount = Math.max(0, mortgageAmount + otherLoansAmount);

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
    const totalAmount = Math.max(0, mortgageAmount + otherLoansAmount);
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
  }, [formData.age, formData.mortgageBalance, formData.otherLoansBalance, formData.mortgagePayment, formData.otherLoansPayment]);

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
        currentPayment
      });
    }
  }, [minYears, maxYears, trackCampaignEvent, currentPayment]);

  // Track simulator interaction on component mount
  React.useEffect(() => {
    trackCampaignEvent('single_track_simulator_loaded', {
      step: 6,
      currentPayment
    });

    // Track conversion - user has completed the entire single-track flow
    trackConversion('flow_completion', {
      step: 6,
      currentPayment
    });
  }, []);

  // Determine colors based on payment comparison
  const paymentDiff = newPayment - currentPayment;
  const isReduction = paymentDiff < 0;
  const gradientColor = isReduction ? 'from-green-400 to-green-600' : 'from-blue-400 to-blue-600';

  const handleContactExpert = () => {
    // Track action in submission log
    if (submissionDocId) {
      sendSubmissionUpdate({
        action: {
          type: 'CLICK_SAVE_FOR_ME',
          timestamp: new Date().toISOString(),
          details: {
            simulatorYears,
            newPayment,
            currentPayment,
            paymentDiff
          }
        }
      }).catch(err => console.error('Failed to log contact expert click:', err));
    }

    // Track expert contact request
    trackCampaignEvent('single_track_simulator_contact_expert', {
      step: 6,
      simulatorYears,
      newPayment,
      currentPayment,
      paymentDiff,
      sessionId
    });

    // Track conversion - user has completed the single-track flow
    trackConversion('contact_expert', {
      step: 6,
      simulatorYears,
      newPayment,
      currentPayment,
      paymentDiff: Math.round(paymentDiff),
      paymentReduction: paymentDiff < 0 ? Math.abs(Math.round(paymentDiff)) : 0
    });

    // Determine correct dialog to open based on state
    // 'no-mortgage-savings' -> Lead Dialog (Insurance only)
    // 'insufficient-savings' -> Contact Options (Calendly/Details) like normal success
    const isNoSolution = noSolution || scenarios.specialCase === 'no-mortgage-savings';

    if (isNoSolution) {
      setShowLeadDialog(true);
    } else {
      setShowContactOptions(true);
    }
  };

  const handleTryAnother = () => {
    // Track action in submission log
    if (submissionDocId) {
      sendSubmissionUpdate({
        action: {
          type: 'CLICK_TRY_ANOTHER',
          timestamp: new Date().toISOString()
        }
      }).catch(err => console.error('Failed to log try another click:', err));
    }

    // Track restart request
    trackCampaignEvent('single_track_simulator_restart', {
      step: 6,
      simulatorYears,
      newPayment,
      currentPayment,
      paymentDiff
    });

    resetForm();
  };

  // Calculate scenarios
  const scenarioInput: ScenarioInput = useMemo(() => ({
    mortgageBalance: formData.mortgageBalance,
    otherLoansBalance: formData.otherLoansBalance,
    currentMortgagePayment: formData.mortgagePayment,
    currentOtherLoansPayment: formData.otherLoansPayment,
    age: formData.age || undefined,
    propertyValue: formData.propertyValue
  }), [formData]);

  const scenarios = useMemo(() => calculateScenarios(scenarioInput), [scenarioInput]);

  // State for selected scenario
  const [selectedScenario, setSelectedScenario] = useState<'minimum' | 'maximum' | 'middle' | null>(null);

  const renderLeadDialog = () => (
    <Dialog
      isOpen={showLeadDialog}
      onClose={() => setShowLeadDialog(false)}
      title={null}
      showCloseButton={true}
      showIcon={false}
      showFooterButton={false}
    >
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">אשמח שיחזרו אלי</h3>
        <p className="text-gray-600 mb-6">
          השאר פרטים ויועץ מומחה יחזור אליך בהקדם עם ניתוח מלא והצעה מותאמת אישית.
        </p>

        <div className="space-y-4 text-right">
          <Input
            label="שם מלא"
            value={leadName}
            onChange={(e) => {
              setLeadName(e.target.value);
              if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
            }}
            error={formErrors.name}
            placeholder="ישראל ישראלי"
          />

          <Input
            label="טלפון"
            value={leadPhone}
            onChange={(e) => {
              setLeadPhone(e.target.value);
              if (formErrors.phone) setFormErrors({ ...formErrors, phone: '' });
            }}
            error={formErrors.phone}
            placeholder="050-0000000"
            inputMode="tel"
          />

          <div className="bg-green-50 rounded-xl p-4 border border-green-200 mb-4 text-right">
            <Checkbox
              checked={formData.interestedInInsurance ?? true}
              onChange={(checked) => {
                updateFormData({ interestedInInsurance: checked });

                if (submissionDocId) {
                  sendSubmissionUpdate({
                    contactUpdate: {
                      interestedInInsurance: checked
                    },
                    action: {
                      type: 'TOGGLE_INSURANCE',
                      timestamp: new Date().toISOString(),
                      details: { checked }
                    }
                  }).catch(err => console.error('Failed to log insurance toggle:', err));
                }
              }}
              label="מעוניין גם בחיסכון בביטוח משכנתא"
              description="עד 50,000 ש״ח חיסכון נוסף - בדיקה חינמית"
            />
          </div>

          <Button
            onClick={handleLeadSubmit}
            disabled={isSubmitting}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white text-lg font-bold rounded-xl mt-4 shadow-lg"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <i className="fa-solid fa-circle-notch fa-spin"></i>
                שולח...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <i className="fa-solid fa-paper-plane"></i>
                אישור ושליחה למומחה
              </span>
            )}
          </Button>
        </div>
      </div>
    </Dialog>
  );

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
        currentPayment
      });
    }
  };

  return (
    <div className="animate-fade-in-up">
      {/* Promoted Subtitle as Primary Step Title */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">תוצאות הסימולציה</h2>
        {scenarios.specialCase !== 'no-mortgage-savings' && (
          <p className="text-gray-600">בחר את התרחיש המתאים לך</p>
        )}
      </div>

      {/* Scenario Cards Container */}
      <div className={`bg-gradient-to-br from-${primaryColor}-50 to-indigo-50 border-2 border-${primaryColor}-200 rounded-2xl p-4 shadow-lg mb-20 md:mb-4`}>

        {/* Special Cases Handling */}
        {scenarios.specialCase === 'no-mortgage-savings' && (
          <NoSavingsCard />
        )}

        {scenarios.specialCase === 'insufficient-savings' && scenarios.maximumScenario && (
          <InsufficientSavingsCard
            maximumScenario={scenarios.maximumScenario}
            currentPayment={currentPayment}
          />
        )}

        {/* Normal Scenario Cards */}
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
      </div>

      <SimulatorFooter
        onContactExpert={handleContactExpert}
        onTryAnother={handleTryAnother}
        primaryColor={primaryColor}
      />

      {/* Contact Options Page - Uses selected or default scenario */}
      {showContactOptions && (
        <ContactOptionsPage
          onClose={() => setShowContactOptions(false)}
          calculationSummary={(() => {
            // Determine which scenario usage data to show
            const activeScenario =
              // 1. User selected specific
              (selectedScenario && scenarios[`${selectedScenario}Scenario`]) ||
              // 2. Insufficient savings (force max)
              (scenarios.specialCase === 'insufficient-savings' ? scenarios.maximumScenario : null) ||
              // 3. Default to middle (or minimum/maximum if middle missing)
              scenarios.middleScenario ||
              scenarios.maximumScenario ||
              scenarios.minimumScenario;

            if (activeScenario) {
              return {
                currentPayment,
                newPayment: Math.round(activeScenario.monthlyPayment),
                monthlySavings: Math.round(activeScenario.monthlyReduction),
                totalSavings: Math.round(activeScenario.totalSavings),
                years: activeScenario.years
              };
            }

            // Fallback if something is weird
            return {
              currentPayment,
              newPayment: Math.round(newPayment),
              monthlySavings: paymentDiff < 0 ? Math.abs(Math.round(paymentDiff)) : 0,
              totalSavings: paymentDiff < 0 ? Math.abs(Math.round(paymentDiff)) * simulatorYears * 12 : 0,
              years: simulatorYears
            };
          })()}
        />
      )}

      {renderLeadDialog()}
    </div>
  );
};