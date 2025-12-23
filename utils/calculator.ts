import { FormData, TrackType, CalculationResult } from '../types';
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
  } else if (track === TrackType.SHORTEN_TERM) {
    // Generate scenarios with different term reductions
    const termTargets = [20, 18, 15, 12, 10];
    
    termTargets.forEach(targetTerm => {
      const requiredPayment = calculateMonthlyPayment(totalAmount, weightedRate, targetTerm);
      const minIncrease = config.validation.minPaymentIncrease;
      
      if (requiredPayment >= currentPayment + minIncrease) {
        const score = calculateOptimizationScore(currentPayment, requiredPayment, 25, targetTerm, track);
        scenarios.push({
          payment: requiredPayment,
          term: targetTerm,
          score,
          description: `קיצור ל-${targetTerm} שנים`
        });
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
  } else if (track === TrackType.SHORTEN_TERM) {
    const paymentIncrease = newPayment - currentPayment;
    if (paymentIncrease > 0) {
      tradeoffs.push(`התשלום החודשי יעלה ב-${formatCurrency(paymentIncrease)}`);
    }
    
    const totalSavings = (currentPayment * currentTerm * 12) - (newPayment * newTerm * 12);
    if (totalSavings > 0) {
      tradeoffs.push(`חיסכון כולל של ${formatCurrency(totalSavings)} לאורך התקופה`);
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
  } else if (data.track === TrackType.SHORTEN_TERM) {
    // Optimize for term reduction
    const maxAffordablePayment = currentPayment * (1 + config.validation.paymentRangeMultiplier);
    const minRequiredPayment = currentPayment + config.validation.minPaymentIncrease;
    
    // Use target payment but ensure it meets minimum increase requirement
    targetPayment = Math.max(data.targetTotalPayment, minRequiredPayment);
    targetPayment = Math.min(targetPayment, maxAffordablePayment);
    
    termYears = calculateLoanTerm(totalAmount, weightedRate, targetPayment);
    termYears = Math.min(termYears, config.validation.maxTermYears);
    
    // Recalculate payment for the final term
    targetPayment = calculateMonthlyPayment(totalAmount, weightedRate, termYears);
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

/**
 * Enhanced track-aware calculation results with track-specific optimization
 */
export const calculateResults = (data: FormData): CalculationResult => {
  // חישוב מיחזור מדויק עם אופטימיזציה לפי מסלול
  const refinanceResult = calculateRefinancedPayment(data);
  const currentTotal = data.mortgagePayment + data.otherLoansPayment;
  const config = getTrackConfigSafe(data.track);
  
  if (data.track === TrackType.MONTHLY_REDUCTION) {
    const isPositive = refinanceResult.newMonthlyPayment < currentTotal && refinanceResult.isValid;
    const savings = currentTotal - refinanceResult.newMonthlyPayment;
    
    let title = config.messaging.warningMessages.termExtension;
    let subtitle = "הריביות בשוק או מגבלות רגולטוריות מונעות חיסכון";
    let explanation = "בגלל תנאי השוק הנוכחיים, מיחזור לא יביא לחיסכון משמעותי.";
    
    if (isPositive) {
      title = config.messaging.successMessages.calculation;
      subtitle = `חיסכון של ${formatCurrency(savings)} בחודש`;
      explanation = `המיחזור יאפשר לך לפנות ${formatCurrency(savings)} בתזרים החודשי. התקופה החדשה: ${refinanceResult.termYears.toFixed(1)} שנים.`;
      
      // Add track-specific insights
      if (refinanceResult.trackSpecific.tradeoffs.length > 0) {
        explanation += ` ${refinanceResult.trackSpecific.tradeoffs.join(', ')}.`;
      }
      
      if (refinanceResult.trackSpecific.optimizationScore > 70) {
        explanation += " זהו מיחזור מומלץ מאוד!";
      }
    } else if (refinanceResult.violations.length > 0) {
      subtitle = refinanceResult.violations[0];
      explanation = `מגבלות רגולטוריות: ${refinanceResult.violations.join(', ')}`;
    }

    return {
      title,
      subtitle,
      labelBefore: "החזר נוכחי",
      labelAfter: "החזר לאחר מיחזור",
      valBefore: Math.round(currentTotal),
      valAfter: Math.round(refinanceResult.newMonthlyPayment),
      unit: '₪',
      isPositive,
      badgeText: isPositive ? "הזדמנות למיחזור" : "לא כדאי למחזר כרגע",
      icon: config.ui.iconClass,
      explanation
    };
  }

  if (data.track === TrackType.SHORTEN_TERM) {
    const currentYears = 25; // נניח 25 שנים נוכחיות
    const newYears = refinanceResult.termYears;
    const isPositive = newYears < currentYears && refinanceResult.isValid;
    const yearsSaved = currentYears - newYears;
    
    let title = config.messaging.successMessages.calculation;
    let subtitle = `חיסכון של ${Math.floor(yearsSaved)} שנים`;
    let explanation = `קיצור התקופה יחסוך אלפי שקלים בריבית לאורך השנים.`;
    
    if (!isPositive) {
      title = 'המיחזור יאריך את התקופה';
      subtitle = config.messaging.warningMessages.paymentIncrease;
      explanation = "הריביות הגבוהות בשוק הופכות את המיחזור ללא כדאי כרגע.";
    } else {
      // Add track-specific insights
      if (refinanceResult.trackSpecific.tradeoffs.length > 0) {
        explanation += ` ${refinanceResult.trackSpecific.tradeoffs.join(', ')}.`;
      }
      
      if (refinanceResult.trackSpecific.optimizationScore > 70) {
        explanation += " זהו מיחזור מומלץ מאוד לחיסכון בריבית!";
      }
    }
    
    return {
      title,
      subtitle,
      labelBefore: "שנים נוכחיות",
      labelAfter: "שנים לאחר מיחזור",
      valBefore: currentYears,
      valAfter: Math.round(newYears),
      unit: 'שנים',
      isPositive,
      badgeText: isPositive ? "הזדמנות לחיסכון בריבית" : "לא כדאי למחזר כרגע",
      icon: config.ui.iconClass,
      explanation
    };
  }

  // ברירת מחדל
  return {
    title: "שגיאה בחישוב",
    subtitle: "אנא בדוק את הנתונים שהוזנו",
    labelBefore: "לפני",
    labelAfter: "אחרי", 
    valBefore: 0,
    valAfter: 0,
    unit: '₪',
    isPositive: false,
    badgeText: "שגיאה",
    icon: "fa-exclamation-triangle",
    explanation: "לא ניתן לבצע חישוב עם הנתונים הנוכחיים."
  };
};

/**
 * Get track-specific calculation scenarios for simulator
 */
export const getTrackSpecificScenarios = (data: FormData): Array<{
  payment: number;
  term: number;
  score: number;
  description: string;
}> => {
  const refinanceResult = calculateRefinancedPayment(data);
  return refinanceResult.trackSpecific.alternativeScenarios;
};

/**
 * Calculate with track-specific priority optimization
 */
export const calculateWithTrackPriority = (data: FormData): TrackCalculationResult => {
  return calculateRefinancedPayment(data);
};


