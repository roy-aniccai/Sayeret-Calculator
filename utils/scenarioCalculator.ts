import {
  calculateMonthlyPayment,
  calculateWeightedMortgageRate,
  calculateWeightedOtherLoansRate,
  validateLoanParams,
  currentMortgageParams
} from './mortgageParams';

export interface ScenarioInput {
  mortgageBalance: number;
  otherLoansBalance: number;
  oneTimePaymentAmount: number;
  currentMortgagePayment: number;
  currentOtherLoansPayment: number;
  age?: number;
  propertyValue: number;
}

export interface PaymentScenario {
  type: 'minimum' | 'maximum' | 'middle';
  years: number;
  monthlyPayment: number;
  monthlyReduction: number;
  totalSavings: number;
  isValid: boolean;
}

export interface ScenarioCalculationResult {
  minimumScenario: PaymentScenario | null;
  maximumScenario: PaymentScenario | null;
  middleScenario: PaymentScenario | null;
  hasValidScenarios: boolean;
  specialCase: 'insufficient-savings' | 'no-mortgage-savings' | null;
  currentPayment: number;
}

/**
 * Calculate scenario-based payment reduction options for Version B simulator
 * 
 * Implements minimum scenario calculation (shortest period with 500+ NIS savings),
 * maximum scenario calculation (longest possible period), and middle scenario
 * calculation (between min and max) while preserving existing mortgage calculation logic.
 * 
 * Requirements: 4.2, 4.3, 4.4, 6.2 - Scenario Calculation Logic
 */
export const calculateScenarios = (input: ScenarioInput): ScenarioCalculationResult => {
  const {
    mortgageBalance,
    otherLoansBalance,
    oneTimePaymentAmount,
    currentMortgagePayment,
    currentOtherLoansPayment,
    age,
    propertyValue
  } = input;

  // Calculate current payment and total amount after one-time payment
  const currentPayment = currentMortgagePayment + currentOtherLoansPayment;
  const totalAmount = Math.max(0, mortgageBalance + otherLoansBalance - oneTimePaymentAmount);

  // Calculate weighted interest rate using existing logic
  const mortgageRate = calculateWeightedMortgageRate();
  const otherLoansRate = calculateWeightedOtherLoansRate();
  const weightedRate = totalAmount > 0 ?
    (mortgageBalance * mortgageRate + otherLoansBalance * otherLoansRate) / (mortgageBalance + otherLoansBalance) :
    mortgageRate;

  // Determine valid years range based on age and regulatory constraints
  const minRegYears = 5; // Minimum 5 years by regulation
  const maxRegYears = currentMortgageParams.regulations.maxLoanTermYears; // 30 years

  // Age constraint
  let maxYearsByAge = maxRegYears;
  if (age) {
    maxYearsByAge = Math.min(
      currentMortgageParams.regulations.maxBorrowerAge - age,
      maxRegYears
    );
  }

  const absoluteMaxYears = Math.max(minRegYears, maxYearsByAge);

  // Find minimum years where payment reduction is at least 500 NIS
  let minValidYears: number | null = null;
  const minSavingsThreshold = 500;

  // Scan from minimum regulatory years to find first valid scenario
  for (let years = minRegYears; years <= absoluteMaxYears; years++) {
    const payment = calculateMonthlyPayment(totalAmount, weightedRate, years);
    const reduction = currentPayment - payment;
    
    if (reduction >= minSavingsThreshold) {
      minValidYears = years;
      break;
    }
  }

  // If no valid minimum scenario found, check for special cases
  if (minValidYears === null) {
    // Check if any payment reduction is possible at maximum years
    const maxYearsPayment = calculateMonthlyPayment(totalAmount, weightedRate, absoluteMaxYears);
    const maxYearsReduction = currentPayment - maxYearsPayment;

    if (maxYearsReduction < 1000) {
      // Less than 1000 NIS reduction - insufficient savings case
      return {
        minimumScenario: null,
        maximumScenario: null,
        middleScenario: null,
        hasValidScenarios: false,
        specialCase: 'insufficient-savings',
        currentPayment
      };
    } else if (maxYearsReduction <= 0) {
      // No mortgage savings possible
      return {
        minimumScenario: null,
        maximumScenario: null,
        middleScenario: null,
        hasValidScenarios: false,
        specialCase: 'no-mortgage-savings',
        currentPayment
      };
    }
  }

  // Calculate scenarios if valid range exists
  if (minValidYears === null) {
    return {
      minimumScenario: null,
      maximumScenario: null,
      middleScenario: null,
      hasValidScenarios: false,
      specialCase: 'no-mortgage-savings',
      currentPayment
    };
  }

  const maxValidYears = absoluteMaxYears;

  // Create scenario calculation helper
  const createScenario = (
    type: 'minimum' | 'maximum' | 'middle',
    years: number
  ): PaymentScenario => {
    const monthlyPayment = calculateMonthlyPayment(totalAmount, weightedRate, years);
    const monthlyReduction = currentPayment - monthlyPayment;
    const totalSavings = monthlyReduction * years * 12;

    // Validate the scenario
    const validation = validateLoanParams(
      totalAmount,
      monthlyPayment,
      years,
      age,
      propertyValue
    );

    return {
      type,
      years,
      monthlyPayment,
      monthlyReduction,
      totalSavings,
      isValid: validation.isValid
    };
  };

  // Calculate minimum scenario (shortest period with 500+ NIS savings)
  const minimumScenario = createScenario('minimum', minValidYears);

  // Calculate maximum scenario (longest possible period)
  const maximumScenario = createScenario('maximum', maxValidYears);

  // Calculate middle scenario (between min and max)
  const middleYears = Math.round((minValidYears + maxValidYears) / 2);
  const middleScenario = createScenario('middle', middleYears);

  return {
    minimumScenario,
    maximumScenario,
    middleScenario,
    hasValidScenarios: true,
    specialCase: null,
    currentPayment
  };
};

/**
 * Helper function to get scenario display data for UI components
 */
export const getScenarioDisplayData = (scenario: PaymentScenario | null) => {
  if (!scenario) return null;

  return {
    type: scenario.type,
    years: scenario.years,
    monthlyReduction: Math.round(scenario.monthlyReduction),
    newPayment: Math.round(scenario.monthlyPayment),
    totalSavings: Math.round(scenario.totalSavings),
    isValid: scenario.isValid
  };
};

/**
 * Check if scenarios meet the minimum savings threshold
 */
export const validateScenarioSavings = (
  scenarios: ScenarioCalculationResult,
  minSavingsThreshold: number = 500
): boolean => {
  if (!scenarios.hasValidScenarios) return false;

  const { minimumScenario, maximumScenario, middleScenario } = scenarios;

  return [minimumScenario, maximumScenario, middleScenario].some(
    scenario => scenario && scenario.monthlyReduction >= minSavingsThreshold
  );
};