/**
 * פרמטרי משכנתא ישראליים - מעודכנים לפי שוק דצמבר 2024
 * יש לעדכן מידי חודש לפי הודעות בנק ישראל והבנקים
 */

export interface MortgageParams {
  // ריביות משכנתא (שנתי)
  mortgageRates: {
    fixedRate: number;           // קל"צ - קבועה לא צמודה
    variableUnlinked: number;    // משתנה לא צמודה
    variableLinked: number;      // משתנה צמודה למדד
  };
  
  // חלוקת תיק משכנתא סטנדרטית
  mortgageDistribution: {
    fixed: number;               // אחוז קל"צ
    variableUnlinked: number;    // אחוז משתנה לא צמודה
    variableLinked: number;      // אחוז משתנה צמודה
  };
  
  // ריביות הלוואות אחרות
  otherLoansRates: {
    lowRate: number;             // שליש ראשון (ריבית נמוכה)
    highRate: number;            // שני שלישים (ריבית גבוהה)
  };
  
  // מגבלות רגולטוריות
  regulations: {
    maxLoanTermYears: number;    // מקסימום שנים למשכנתא
    maxBorrowerAge: number;      // גיל מקסימלי לסיום משכנתא
    maxLtvRatio: number;         // יחס מימון מקסימלי
    minMonthlyPayment: number;   // החזר חודשי מינימלי
  };
  
  // עמלות ועלויות
  fees: {
    refinancingFee: number;      // עמלת מיחזור (אחוז מהסכום)
    appraisalFee: number;        // עלות שמאות
    legalFees: number;           // עלויות משפטיות
  };
  
  // הגדרות סימולטור
  simulator: {
    paymentRangePercent: number; // טווח תשלום בסימולטור (אחוז מהתשלום הנוכחי)
  };
}

// פרמטרים נוכחיים - דצמבר 2024
export const currentMortgageParams: MortgageParams = {
  mortgageRates: {
    fixedRate: 0.04,           // 4.0% קל"צ
    variableUnlinked: 0.045,   // 4.5% משתנה לא צמודה
    variableLinked: 0.044,     // 4.4% משתנה צמודה
  },
  
  mortgageDistribution: {
    fixed: 1/3,                // שליש קל"צ
    variableUnlinked: 1/3,     // שליש משתנה לא צמודה
    variableLinked: 1/3,       // שליש משתנה צמודה
  },
  
  otherLoansRates: {
    lowRate: 0.045,            // 4.5% שליש ראשון
    highRate: 0.062,           // 6.2% שני שלישים
  },
  
  regulations: {
    maxLoanTermYears: 30,      // מקסימום 30 שנה
    maxBorrowerAge: 67,        // עד גיל 67
    maxLtvRatio: 0.75,         // מקסימום 75% מימון
    minMonthlyPayment: 1000,   // מינימום 1000 ש"ח
  },
  
  fees: {
    refinancingFee: 0.005,     // 0.5% עמלת מיחזור
    appraisalFee: 2500,        // 2,500 ש"ח שמאות
    legalFees: 5000,           // 5,000 ש"ח עו"ד
  },
  
  simulator: {
    paymentRangePercent: 0.30, // 30% טווח תשלום בסימולטור
  }
};

/**
 * חישוב ריבית משוקללת למשכנתא
 */
export const calculateWeightedMortgageRate = (params: MortgageParams = currentMortgageParams): number => {
  const { mortgageRates, mortgageDistribution } = params;
  
  return (
    mortgageRates.fixedRate * mortgageDistribution.fixed +
    mortgageRates.variableUnlinked * mortgageDistribution.variableUnlinked +
    mortgageRates.variableLinked * mortgageDistribution.variableLinked
  );
};

/**
 * חישוב ריבית משוקללת להלוואות אחרות
 */
export const calculateWeightedOtherLoansRate = (params: MortgageParams = currentMortgageParams): number => {
  const { otherLoansRates } = params;
  
  return (
    otherLoansRates.lowRate * (1/3) +
    otherLoansRates.highRate * (2/3)
  );
};

/**
 * בדיקת תקינות פרמטרים לפי רגולציה
 */
export const validateLoanParams = (
  loanAmount: number,
  monthlyPayment: number,
  termYears: number,
  borrowerAge?: number,
  propertyValue?: number,
  params: MortgageParams = currentMortgageParams
): {
  isValid: boolean;
  violations: string[];
  maxAllowedTerm?: number;
} => {
  const violations: string[] = [];
  let maxAllowedTerm = params.regulations.maxLoanTermYears;
  
  // בדיקת תקופה מקסימלית
  if (termYears > params.regulations.maxLoanTermYears) {
    violations.push(`תקופת המשכנתא לא יכולה לעלות על ${params.regulations.maxLoanTermYears} שנים`);
  }
  
  // בדיקת גיל
  if (borrowerAge) {
    const maxAllowedTermByAge = params.regulations.maxBorrowerAge - borrowerAge;
    if (maxAllowedTermByAge < termYears) {
      violations.push(`בגיל ${borrowerAge}, ניתן לקחת משכנתא למקסימום ${maxAllowedTermByAge} שנים`);
      maxAllowedTerm = Math.min(maxAllowedTerm, maxAllowedTermByAge);
    }
  }
  
  // בדיקת החזר מינימלי
  if (monthlyPayment < params.regulations.minMonthlyPayment) {
    violations.push(`החזר חודשי מינימלי הוא ${params.regulations.minMonthlyPayment.toLocaleString()} ש"ח`);
  }
  
  // בדיקת יחס מימון
  if (propertyValue && loanAmount > 0) {
    const ltvRatio = loanAmount / propertyValue;
    if (ltvRatio > params.regulations.maxLtvRatio) {
      violations.push(`יחס המימון לא יכול לעלות על ${(params.regulations.maxLtvRatio * 100).toFixed(0)}%`);
    }
  }
  
  return {
    isValid: violations.length === 0,
    violations,
    maxAllowedTerm: maxAllowedTerm > 0 ? maxAllowedTerm : undefined
  };
};

/**
 * חישוב החזר חודשי לפי נוסחת PMT
 */
export const calculateMonthlyPayment = (
  principal: number,
  annualRate: number,
  termYears: number
): number => {
  if (principal <= 0 || termYears <= 0) return 0;
  
  const monthlyRate = annualRate / 12;
  const totalMonths = termYears * 12;
  
  if (monthlyRate === 0) {
    return principal / totalMonths;
  }
  
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
         (Math.pow(1 + monthlyRate, totalMonths) - 1);
};

/**
 * חישוב תקופה בשנים לפי החזר חודשי
 */
export const calculateLoanTerm = (
  principal: number,
  annualRate: number,
  monthlyPayment: number
): number => {
  if (principal <= 0 || monthlyPayment <= 0) return 0;
  
  const monthlyRate = annualRate / 12;
  
  // בדיקה שההחזר מכסה לפחות את הריבית
  if (monthlyPayment <= principal * monthlyRate) {
    return 999; // מציין שהמשכנתא לא תסתיים
  }
  
  const months = -Math.log(1 - (monthlyRate * principal) / monthlyPayment) / Math.log(1 + monthlyRate);
  return Math.max(0, months / 12);
};

/**
 * עדכון פרמטרים (לשימוש עתידי)
 */
export const updateMortgageParams = (newParams: Partial<MortgageParams>): MortgageParams => {
  return {
    ...currentMortgageParams,
    ...newParams,
    mortgageRates: {
      ...currentMortgageParams.mortgageRates,
      ...(newParams.mortgageRates || {})
    },
    mortgageDistribution: {
      ...currentMortgageParams.mortgageDistribution,
      ...(newParams.mortgageDistribution || {})
    },
    otherLoansRates: {
      ...currentMortgageParams.otherLoansRates,
      ...(newParams.otherLoansRates || {})
    },
    regulations: {
      ...currentMortgageParams.regulations,
      ...(newParams.regulations || {})
    },
    fees: {
      ...currentMortgageParams.fees,
      ...(newParams.fees || {})
    },
    simulator: {
      ...currentMortgageParams.simulator,
      ...(newParams.simulator || {})
    }
  };
};