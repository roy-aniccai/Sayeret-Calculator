import { FormData, TrackType, CalculationResult, InsuranceResult } from '../types';
import { formatCurrency } from './helpers';

const INTEREST_RATE = 0.042; // 4.2% Annual Base

function calculatePMT(principal: number, annualRate: number, months: number): number {
  const monthlyRate = annualRate / 12;
  if (monthlyRate === 0) return principal / months;
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
}

function calculateNPER(principal: number, annualRate: number, monthlyPayment: number): number {
  const monthlyRate = annualRate / 12;
  // Safety check: if payment covers less than interest, loan never ends
  if (monthlyPayment <= principal * monthlyRate) return 999 * 12; 
  const nper = -Math.log(1 - (monthlyRate * principal) / monthlyPayment) / Math.log(1 + monthlyRate);
  return nper / 12; 
}

export const calculateResults = (data: FormData): CalculationResult => {
  let newPrincipal = data.mortgageBalance; 
  
  if (data.track === TrackType.MONTHLY_REDUCTION) {
    const currentMonthly = data.currentPayment;
    const potentialMonthly = calculatePMT(newPrincipal, INTEREST_RATE, 360); // 30 years assumption
    
    const isPositive = potentialMonthly < currentMonthly;

    return {
      title: isPositive ? "ניתן להוריד את ההחזר החודשי!" : "ההחזר צפוי לעלות במיחזור",
      subtitle: isPositive ? "ע''י פריסה מחדש של המשכנתא" : "הריביות היום גבוהות משמעותית מהמקור",
      labelBefore: "החזר נוכחי",
      labelAfter: "החזר חדש",
      valBefore: Math.round(currentMonthly),
      valAfter: Math.round(potentialMonthly),
      unit: '₪',
      isPositive,
      badgeText: isPositive ? "תוצאה ראשונית: חיסכון בתזרים" : "תוצאה: לא כדאי למחזר",
      icon: isPositive ? "fa-arrow-trend-down" : "fa-arrow-trend-up",
      explanation: isPositive 
        ? `המהלך יאפשר לך לפנות כ-${formatCurrency(currentMonthly - potentialMonthly)} בתזרים החודשי.`
        : "בגלל עליות הריבית, פריסה מחדש תייקר את ההחזר."
    };
  }

  if (data.track === TrackType.SHORTEN_TERM) {
    const yearsLeft = data.yearsRemaining;
    const targetPayment = data.currentPayment + data.addedMonthlyPayment;
    
    let calculatedYears = calculateNPER(newPrincipal - data.lumpSum, INTEREST_RATE, targetPayment);
    if (calculatedYears < 4) calculatedYears = 4;

    const yearsSaved = Math.max(0, yearsLeft - calculatedYears);
    const displayYears = Math.round(calculatedYears * 10) / 10;
    
    const futureMsg = data.lumpSum > 0 ? ` כולל שימוש ב-${formatCurrency(data.lumpSum)}.` : "";
    const isPositive = calculatedYears < yearsLeft;

    return {
      title: isPositive ? `ניתן לקצר ל-${Math.floor(displayYears)} שנים!` : 'המיחזור יאריך את התקופה',
      subtitle: isPositive ? `על בסיס תוספת של ${data.addedMonthlyPayment} ₪` : 'הריביות בשוק גבוהות מהריבית הנוכחית שלך',
      labelBefore: "שנים לתשלום",
      labelAfter: isPositive ? "שנים לאחר קיצור" : "שנים במיחזור",
      valBefore: yearsLeft,
      valAfter: displayYears,
      unit: 'שנים',
      isPositive,
      badgeText: isPositive ? "הזדמנות לחיסכון בריבית" : "לא כדאי למחזר כרגע",
      icon: isPositive ? "fa-piggy-bank" : "fa-clock",
      explanation: isPositive 
        ? `תוספת קטנה של ${data.addedMonthlyPayment} ₪ מחקה ${Math.floor(yearsSaved)} שנים של תשלומי ריבית מיותרים.${futureMsg}`
        : "למרות התוספת להחזר, הריביות הגבוהות בשוק הופכות את המיחזור ללא כדאי כרגע."
    };
  }

  // Consolidation Logic
  const currentTotal = data.currentPayment + data.loansPayment;
  const totalDebtToAdd = data.standardLoans + data.highInterestLoans;
  newPrincipal += totalDebtToAdd;
  
  const potentialTotal = calculatePMT(newPrincipal, INTEREST_RATE, 360);
  const isPositive = potentialTotal < currentTotal;
  
  return {
    title: isPositive ? "איפוס המינוס והורדת החזר!" : "לא נמצא חיסכון משמעותי",
    subtitle: isPositive ? "איחוד כל ההלוואות למשכנתא אחת" : "הפערים לא מצדיקים מיחזור",
    labelBefore: "החזר חודשי (היום)",
    labelAfter: "החזר מאוחד",
    valBefore: Math.round(currentTotal),
    valAfter: Math.round(potentialTotal),
    unit: '₪',
    isPositive,
    badgeText: isPositive ? "מהפך בתזרים המזומנים" : "ללא שינוי מהותי",
    icon: isPositive ? "fa-wand-magic-sparkles" : "fa-minus",
    explanation: isPositive 
      ? `החיסכון בתזרים: ${formatCurrency(currentTotal - potentialTotal)} בחודש! ${data.highInterestLoans > 0 ? `ונפטרים מ-${formatCurrency(data.highInterestLoans)} חובות רעים.` : ''}`
      : "עלויות המיחזור גבוהות מהחיסכון החודשי הצפוי."
  };
};

export const calculateInsuranceSavings = (data: FormData): InsuranceResult => {
  // Insurance Heuristic Model
  const baseRatePer100k = 12;
  const loanUnits = data.mortgageBalance / 100000;
  
  const calculateSingleBorrowerPremium = (age: number, isSmoker: boolean): number => {
    const ageDiff = Math.max(0, age - 25);
    const ageFactor = 1 + (ageDiff * 0.05); // +5% per year over 25
    const smokerFactor = isSmoker ? 1.5 : 1.0; // +50% for smokers
    
    const basePremium = loanUnits * baseRatePer100k;
    return basePremium * ageFactor * smokerFactor;
  };

  let totalMonthlyPremiumStart = calculateSingleBorrowerPremium(data.borrower1Age, data.borrower1Smoker);
  
  if (data.isTwoBorrowers) {
    totalMonthlyPremiumStart += calculateSingleBorrowerPremium(data.borrower2Age, data.borrower2Smoker);
  }

  const averageLifetimePremium = totalMonthlyPremiumStart * 0.65; // Decay factor
  const totalLifetimeCost = averageLifetimePremium * data.yearsRemaining * 12;
  const potentialSavings = totalLifetimeCost * 0.22; // 22% Savings assumption

  return {
    totalLifetimeCost,
    potentialSavings,
    monthlyPremiumStart: totalMonthlyPremiumStart
  };
};
