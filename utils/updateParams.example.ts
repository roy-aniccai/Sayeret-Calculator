/**
 * דוגמה לעדכון פרמטרי משכנתא חודשי
 * קובץ זה מדגים איך לעדכן את הפרמטרים לפי הודעות בנק ישראל
 */

import { updateMortgageParams, currentMortgageParams } from './mortgageParams';

// דוגמה לעדכון ינואר 2025
export const updateJanuary2025 = () => {
  const updatedParams = updateMortgageParams({
    mortgageRates: {
      fixedRate: 0.041,           // עדכון ל-4.1% קל"צ
      variableUnlinked: 0.046,    // עדכון ל-4.6% משתנה לא צמודה
      variableLinked: 0.045,      // עדכון ל-4.5% משתנה צמודה
    },
    
    otherLoansRates: {
      lowRate: 0.047,             // עדכון ל-4.7%
      highRate: 0.065,            // עדכון ל-6.5%
    },
    
    regulations: {
      ...currentMortgageParams.regulations,
      maxLtvRatio: 0.70,          // הקטנה ל-70% (דוגמה)
    }
  });
  
  console.log('Updated mortgage parameters for January 2025:', updatedParams);
  return updatedParams;
};

// דוגמה לעדכון לפי הודעת בנק ישראל
export const updateByBankOfIsraelAnnouncement = (
  newBaseRate: number,
  effectiveDate: string
) => {
  // חישוב ריביות חדשות בהתבסס על ריבית הבסיס החדשה
  const rateIncrease = newBaseRate - 0.045; // נניח שהריבית הבסיסית הנוכחית היא 4.5%
  
  const updatedParams = updateMortgageParams({
    mortgageRates: {
      fixedRate: Math.max(0.02, currentMortgageParams.mortgageRates.fixedRate + rateIncrease),
      variableUnlinked: Math.max(0.02, currentMortgageParams.mortgageRates.variableUnlinked + rateIncrease),
      variableLinked: Math.max(0.02, currentMortgageParams.mortgageRates.variableLinked + rateIncrease),
    },
    
    otherLoansRates: {
      lowRate: Math.max(0.03, currentMortgageParams.otherLoansRates.lowRate + rateIncrease),
      highRate: Math.max(0.04, currentMortgageParams.otherLoansRates.highRate + rateIncrease),
    }
  });
  
  console.log(`Updated rates based on Bank of Israel announcement (${effectiveDate}):`, updatedParams);
  return updatedParams;
};

// דוגמה לעדכון פרמטרים רגולטוריים
export const updateRegulatoryParams = () => {
  const updatedParams = updateMortgageParams({
    regulations: {
      ...currentMortgageParams.regulations,
      maxLoanTermYears: 25,       // הקטנה ל-25 שנים (דוגמה)
      maxBorrowerAge: 65,         // הקטנה לגיל 65 (דוגמה)
      maxLtvRatio: 0.70,          // הקטנה ל-70%
    }
  });
  
  console.log('Updated regulatory parameters:', updatedParams);
  return updatedParams;
};

// פונקציה לבדיקת השפעת שינוי פרמטרים
export const analyzeParameterImpact = (
  oldParams = currentMortgageParams,
  newParams: ReturnType<typeof updateMortgageParams>
) => {
  const oldWeightedRate = (
    oldParams.mortgageRates.fixedRate * oldParams.mortgageDistribution.fixed +
    oldParams.mortgageRates.variableUnlinked * oldParams.mortgageDistribution.variableUnlinked +
    oldParams.mortgageRates.variableLinked * oldParams.mortgageDistribution.variableLinked
  );
  
  const newWeightedRate = (
    newParams.mortgageRates.fixedRate * newParams.mortgageDistribution.fixed +
    newParams.mortgageRates.variableUnlinked * newParams.mortgageDistribution.variableUnlinked +
    newParams.mortgageRates.variableLinked * newParams.mortgageDistribution.variableLinked
  );
  
  const rateDifference = newWeightedRate - oldWeightedRate;
  const percentageChange = (rateDifference / oldWeightedRate) * 100;
  
  console.log('Parameter Impact Analysis:');
  console.log(`Old weighted rate: ${(oldWeightedRate * 100).toFixed(3)}%`);
  console.log(`New weighted rate: ${(newWeightedRate * 100).toFixed(3)}%`);
  console.log(`Rate difference: ${(rateDifference * 100).toFixed(3)}%`);
  console.log(`Percentage change: ${percentageChange.toFixed(2)}%`);
  
  return {
    oldWeightedRate,
    newWeightedRate,
    rateDifference,
    percentageChange
  };
};