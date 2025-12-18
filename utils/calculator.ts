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

/**
 * חישוב מדויק של מיחזור משכנתא לפי פרמטרי השוק הישראלי
 */
export const calculateRefinancedPayment = (data: FormData): {
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
} => {
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
  
  // חישוב תקופה לפי יעד החזר
  const targetPayment = data.targetTotalPayment;
  const calculatedTerm = calculateLoanTerm(totalAmount, weightedRate, targetPayment);
  const termYears = Math.min(calculatedTerm, currentMortgageParams.regulations.maxLoanTermYears);
  
  // חישוב החזר בפועל לפי התקופה המותרת
  const actualPayment = calculateMonthlyPayment(totalAmount, weightedRate, termYears);
  
  // בדיקת תקינות
  const validation = validateLoanParams(
    totalAmount,
    actualPayment,
    termYears,
    data.age || undefined,
    data.propertyValue
  );
  
  return {
    newMonthlyPayment: actualPayment,
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
    }
  };
};

export const calculateResults = (data: FormData): CalculationResult => {
  // חישוב מיחזור מדויק
  const refinanceResult = calculateRefinancedPayment(data);
  const currentTotal = data.mortgagePayment + data.otherLoansPayment;
  
  if (data.track === TrackType.MONTHLY_REDUCTION) {
    const isPositive = refinanceResult.newMonthlyPayment < currentTotal && refinanceResult.isValid;
    const savings = currentTotal - refinanceResult.newMonthlyPayment;
    
    let title = "ההחזר צפוי לעלות במיחזור";
    let subtitle = "הריביות בשוק או מגבלות רגולטוריות מונעות חיסכון";
    let explanation = "בגלל תנאי השוק הנוכחיים, מיחזור לא יביא לחיסכון משמעותי.";
    
    if (isPositive) {
      title = "ניתן להוריד את ההחזר החודשי!";
      subtitle = `חיסכון של ${formatCurrency(savings)} בחודש`;
      explanation = `המיחזור יאפשר לך לפנות ${formatCurrency(savings)} בתזרים החודשי. התקופה החדשה: ${refinanceResult.termYears.toFixed(1)} שנים.`;
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
      icon: isPositive ? "fa-arrow-trend-down" : "fa-arrow-trend-up",
      explanation
    };
  }

  if (data.track === TrackType.SHORTEN_TERM) {
    // לוגיקה לקיצור שנים - נוסיף בהמשך
    const currentYears = 25; // נניח 25 שנים נוכחיות
    const newYears = refinanceResult.termYears;
    const isPositive = newYears < currentYears && refinanceResult.isValid;
    
    return {
      title: isPositive ? `ניתן לקצר ל-${Math.floor(newYears)} שנים!` : 'המיחזור יאריך את התקופה',
      subtitle: isPositive ? `חיסכון של ${Math.floor(currentYears - newYears)} שנים` : 'הריביות בשוק גבוהות מהריבית הנוכחית',
      labelBefore: "שנים נוכחיות",
      labelAfter: "שנים לאחר מיחזור",
      valBefore: currentYears,
      valAfter: Math.round(newYears),
      unit: 'שנים',
      isPositive,
      badgeText: isPositive ? "הזדמנות לחיסכון בריבית" : "לא כדאי למחזר כרגע",
      icon: isPositive ? "fa-piggy-bank" : "fa-clock",
      explanation: isPositive 
        ? `קיצור התקופה יחסוך אלפי שקלים בריבית לאורך השנים.`
        : "הריביות הגבוהות בשוק הופכות את המיחזור ללא כדאי כרגע."
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


