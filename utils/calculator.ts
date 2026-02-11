import { FormData, TrackType } from '../types';
import { formatCurrency } from './helpers';
import {
  currentMortgageParams,
  calculateWeightedMortgageRate,
  calculateWeightedOtherLoansRate,
  calculateMonthlyPayment,
  calculateLoanTerm,
  validateLoanParams
} from './mortgageParams';
import { getTrackConfigSafe } from './trackConfig';

/**
 * Track-aware calculation result interface
 */
interface TrackCalculationResult {
  newMonthlyPayment: number;
  termYears: number;
  isValid: boolean;
  violations: string[];
  breakdown: {
    mortgageAmount: number;
    mortgageRate: number;
    otherLoansAmount: number;
    otherLoansRate: number;
    totalAmount: number;
    weightedRate: number;
  };
  trackSpecific: {
    optimizationScore: number;
    alternativeScenarios: Array<{
      payment: number;
      term: number;
      score: number;
      description: string;
    }>;
    tradeoffs: string[];
  };
}

/**
 * Calculate optimization score based on track priority
 */
const calculateOptimizationScore = (
  currentPayment: number,
  newPayment: number,
  currentTerm: number,
  newTerm: number,
  track: TrackType | null
): number => {
  if (!track) return 0;

  const config = getTrackConfigSafe(track);
  const priority = config.calculation.optimizationPriority;

  switch (priority) {
    case 'payment':
      // Higher score for lower payments
      const paymentReduction = (currentPayment - newPayment) / currentPayment;
      return Math.max(0, paymentReduction * 100);

    case 'term':
      // Higher score for shorter terms
      const termReduction = (currentTerm - newTerm) / currentTerm;
      return Math.max(0, termReduction * 100);

    case 'balance':
      // Score based on total interest savings
      const currentTotalInterest = currentPayment * currentTerm * 12 - (currentPayment * currentTerm * 12 * 0.8); // Rough estimate
      const newTotalInterest = newPayment * newTerm * 12 - (newPayment * newTerm * 12 * 0.8);
      const interestSavings = (currentTotalInterest - newTotalInterest) / currentTotalInterest;
      return Math.max(0, interestSavings * 100);

    default:
      return 0;
  }
};

/**
 * Generate alternative scenarios based on track optimization
 */
const generateAlternativeScenarios = (
  totalAmount: number,
  weightedRate: number,
  currentPayment: number,
  track: TrackType | null
): Array<{ payment: number; term: number; score: number; description: string }> => {
  if (!track) return [];

  const config = getTrackConfigSafe(track);
  const scenarios = [];

  if (track === TrackType.MONTHLY_REDUCTION) {
    // Generate scenarios with different payment reductions
    const reductions = [0.1, 0.2, 0.3, 0.4];

    reductions.forEach(reduction => {
      const targetPayment = currentPayment * (1 - reduction);
      if (targetPayment >= 1000) { // Minimum payment threshold
        const term = calculateLoanTerm(totalAmount, weightedRate, targetPayment);
        const maxTerm = config.validation.maxTermYears;

        if (term <= maxTerm) {
          const score = calculateOptimizationScore(currentPayment, targetPayment, 25, term, track);
          scenarios.push({
            payment: targetPayment,
            term,
            score,
            description: `הפחתה של ${Math.round(reduction * 100)}% בתשלום החודשי`
          });
        }
      }
    });
  }

  // Sort by score (best first)
  return scenarios.sort((a, b) => b.score - a.score).slice(0, 3);
};

/**
 * Generate track-specific tradeoff analysis
 */
const generateTradeoffAnalysis = (
  currentPayment: number,
  newPayment: number,
  currentTerm: number,
  newTerm: number,
  track: TrackType | null
): string[] => {
  if (!track) return [];

  const tradeoffs = [];

  if (track === TrackType.MONTHLY_REDUCTION) {
    if (newTerm > currentTerm) {
      const additionalYears = newTerm - currentTerm;
      tradeoffs.push(`התקופה תתארך ב-${additionalYears.toFixed(1)} שנים`);
    }

    const totalInterestIncrease = (newPayment * newTerm * 12) - (currentPayment * currentTerm * 12);
    if (totalInterestIncrease > 0) {
      tradeoffs.push(`סה"כ תשלומים יעלו ב-${formatCurrency(totalInterestIncrease)}`);
    }
  }

  return tradeoffs;
};
/**
 * Enhanced track-aware calculation of mortgage refinancing
 * חישוב מדויק של מיחזור משכנתא לפי פרמטרי השוק הישראלי עם אופטימיזציה לפי מסלול
 */
export const calculateRefinancedPayment = (data: FormData): TrackCalculationResult => {
  // חישוב סכומים
  const mortgageAmount = data.mortgageBalance;
  const otherLoansAmount = data.otherLoansBalance + Math.abs(data.bankAccountBalance);
  const totalAmount = mortgageAmount + otherLoansAmount;

  // חישוב ריביות משוקללות
  const mortgageRate = calculateWeightedMortgageRate();
  const otherLoansRate = calculateWeightedOtherLoansRate();

  // חישוב ריבית משוקללת כוללת
  const weightedRate = totalAmount > 0 ?
    (mortgageAmount * mortgageRate + otherLoansAmount * otherLoansRate) / totalAmount :
    mortgageRate;

  // Get track-specific configuration
  const config = getTrackConfigSafe(data.track);
  const currentPayment = data.mortgagePayment + data.otherLoansPayment;

  let targetPayment: number;
  let termYears: number;

  // Track-specific optimization logic
  if (data.track === TrackType.MONTHLY_REDUCTION) {
    // Optimize for payment reduction
    targetPayment = data.targetTotalPayment;
    const calculatedTerm = calculateLoanTerm(totalAmount, weightedRate, targetPayment);
    termYears = Math.min(calculatedTerm, config.validation.maxTermYears);

    // If calculated term exceeds max, adjust payment upward
    if (calculatedTerm > config.validation.maxTermYears) {
      targetPayment = calculateMonthlyPayment(totalAmount, weightedRate, config.validation.maxTermYears);
    }
  } else {
    // Default behavior for no track selected
    targetPayment = data.targetTotalPayment;
    const calculatedTerm = calculateLoanTerm(totalAmount, weightedRate, targetPayment);
    termYears = Math.min(calculatedTerm, currentMortgageParams.regulations.maxLoanTermYears);
    targetPayment = calculateMonthlyPayment(totalAmount, weightedRate, termYears);
  }

  // בדיקת תקינות
  const validation = validateLoanParams(
    totalAmount,
    targetPayment,
    termYears,
    data.age || undefined,
    data.propertyValue
  );

  // Calculate track-specific metrics
  const currentTerm = 25; // Assume current term for comparison
  const optimizationScore = calculateOptimizationScore(
    currentPayment,
    targetPayment,
    currentTerm,
    termYears,
    data.track
  );

  const alternativeScenarios = generateAlternativeScenarios(
    totalAmount,
    weightedRate,
    currentPayment,
    data.track
  );

  const tradeoffs = generateTradeoffAnalysis(
    currentPayment,
    targetPayment,
    currentTerm,
    termYears,
    data.track
  );

  return {
    newMonthlyPayment: targetPayment,
    termYears,
    isValid: validation.isValid,
    violations: validation.violations,
    breakdown: {
      mortgageAmount,
      mortgageRate,
      otherLoansAmount,
      otherLoansRate,
      totalAmount,
      weightedRate
    },
    trackSpecific: {
      optimizationScore,
      alternativeScenarios,
      tradeoffs
    }
  };
};


