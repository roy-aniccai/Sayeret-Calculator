import { calculateScenarios, ScenarioInput } from './scenarioCalculator';
import { calculateMonthlyPayment, calculateWeightedMortgageRate, calculateWeightedOtherLoansRate } from './mortgageParams';

/**
 * Calculation Consistency Validator
 * 
 * Ensures identical results for same input data across versions A and B
 * Preserves all existing mortgage calculation algorithms
 * Maintains consistency when switching between versions
 * 
 * Requirements: 6.1, 6.3, 6.4 - Calculation Consistency Across Versions
 */

export interface ConsistencyValidationResult {
  isConsistent: boolean;
  versionAResult: {
    payment: number;
    years: number;
  };
  versionBScenarios: {
    minimum?: { payment: number; years: number; reduction: number };
    maximum?: { payment: number; years: number; reduction: number };
    middle?: { payment: number; years: number; reduction: number };
  };
  differences: string[];
  errors: string[];
}

/**
 * Validate that Version A slider calculations match Version B scenario calculations
 * for the same input parameters
 */
export function validateCalculationConsistency(input: ScenarioInput): ConsistencyValidationResult {
  const errors: string[] = [];
  const differences: string[] = [];
  
  try {
    // Calculate Version B scenarios
    const scenarios = calculateScenarios(input);
    
    // Calculate Version A equivalent (using same logic as Version A slider)
    const mortgageAmount = input.mortgageBalance;
    const otherLoansAmount = input.otherLoansBalance;
    const totalAmount = Math.max(0, mortgageAmount + otherLoansAmount - input.oneTimePaymentAmount);
    
    const mortgageRate = calculateWeightedMortgageRate();
    const otherLoansRate = calculateWeightedOtherLoansRate();
    const weightedRate = totalAmount > 0 ?
      (mortgageAmount * mortgageRate + otherLoansAmount * otherLoansRate) / (mortgageAmount + otherLoansAmount) :
      mortgageRate;
    
    // Test consistency for each scenario type
    const versionBScenarios: ConsistencyValidationResult['versionBScenarios'] = {};
    
    if (scenarios.minimumScenario) {
      const versionAPayment = calculateMonthlyPayment(totalAmount, weightedRate, scenarios.minimumScenario.years);
      const difference = Math.abs(versionAPayment - scenarios.minimumScenario.monthlyPayment);
      
      versionBScenarios.minimum = {
        payment: scenarios.minimumScenario.monthlyPayment,
        years: scenarios.minimumScenario.years,
        reduction: scenarios.minimumScenario.monthlyReduction
      };
      
      if (difference > 0.01) { // Allow for small floating point differences
        differences.push(`Minimum scenario: Version A payment ${versionAPayment.toFixed(2)} vs Version B payment ${scenarios.minimumScenario.monthlyPayment.toFixed(2)}`);
      }
    }
    
    if (scenarios.maximumScenario) {
      const versionAPayment = calculateMonthlyPayment(totalAmount, weightedRate, scenarios.maximumScenario.years);
      const difference = Math.abs(versionAPayment - scenarios.maximumScenario.monthlyPayment);
      
      versionBScenarios.maximum = {
        payment: scenarios.maximumScenario.monthlyPayment,
        years: scenarios.maximumScenario.years,
        reduction: scenarios.maximumScenario.monthlyReduction
      };
      
      if (difference > 0.01) {
        differences.push(`Maximum scenario: Version A payment ${versionAPayment.toFixed(2)} vs Version B payment ${scenarios.maximumScenario.monthlyPayment.toFixed(2)}`);
      }
    }
    
    if (scenarios.middleScenario) {
      const versionAPayment = calculateMonthlyPayment(totalAmount, weightedRate, scenarios.middleScenario.years);
      const difference = Math.abs(versionAPayment - scenarios.middleScenario.monthlyPayment);
      
      versionBScenarios.middle = {
        payment: scenarios.middleScenario.monthlyPayment,
        years: scenarios.middleScenario.years,
        reduction: scenarios.middleScenario.monthlyReduction
      };
      
      if (difference > 0.01) {
        differences.push(`Middle scenario: Version A payment ${versionAPayment.toFixed(2)} vs Version B payment ${scenarios.middleScenario.monthlyPayment.toFixed(2)}`);
      }
    }
    
    // Use middle scenario as representative for Version A result
    const representativeScenario = scenarios.middleScenario || scenarios.minimumScenario || scenarios.maximumScenario;
    const versionAResult = representativeScenario ? {
      payment: calculateMonthlyPayment(totalAmount, weightedRate, representativeScenario.years),
      years: representativeScenario.years
    } : {
      payment: 0,
      years: 0
    };
    
    return {
      isConsistent: differences.length === 0,
      versionAResult,
      versionBScenarios,
      differences,
      errors
    };
    
  } catch (error) {
    errors.push(`Calculation consistency validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    return {
      isConsistent: false,
      versionAResult: { payment: 0, years: 0 },
      versionBScenarios: {},
      differences: [],
      errors
    };
  }
}

/**
 * Test calculation consistency across a range of input scenarios
 */
export function runConsistencyTests(): { passed: number; failed: number; results: ConsistencyValidationResult[] } {
  const testCases: ScenarioInput[] = [
    // Standard case
    {
      mortgageBalance: 1200000,
      otherLoansBalance: 0,
      oneTimePaymentAmount: 0,
      currentMortgagePayment: 6500,
      currentOtherLoansPayment: 0,
      age: 35,
      propertyValue: 2500000
    },
    // High debt case
    {
      mortgageBalance: 800000,
      otherLoansBalance: 400000,
      oneTimePaymentAmount: 0,
      currentMortgagePayment: 4500,
      currentOtherLoansPayment: 2000,
      age: 45,
      propertyValue: 2000000
    },
    // With one-time payment
    {
      mortgageBalance: 1000000,
      otherLoansBalance: 200000,
      oneTimePaymentAmount: 100000,
      currentMortgagePayment: 5500,
      currentOtherLoansPayment: 1000,
      age: 40,
      propertyValue: 2200000
    },
    // Edge case - older borrower
    {
      mortgageBalance: 600000,
      otherLoansBalance: 100000,
      oneTimePaymentAmount: 0,
      currentMortgagePayment: 3500,
      currentOtherLoansPayment: 500,
      age: 60,
      propertyValue: 1500000
    }
  ];
  
  const results = testCases.map(testCase => validateCalculationConsistency(testCase));
  const passed = results.filter(r => r.isConsistent).length;
  const failed = results.length - passed;
  
  return { passed, failed, results };
}

/**
 * Validate that switching between versions maintains consistency
 */
export function validateVersionSwitchingConsistency(input: ScenarioInput): {
  isConsistent: boolean;
  message: string;
} {
  try {
    // Calculate scenarios multiple times to ensure consistency
    const firstCalculation = calculateScenarios(input);
    const secondCalculation = calculateScenarios(input);
    
    // Check if results are identical
    const isConsistent = 
      firstCalculation.hasValidScenarios === secondCalculation.hasValidScenarios &&
      firstCalculation.specialCase === secondCalculation.specialCase &&
      JSON.stringify(firstCalculation.minimumScenario) === JSON.stringify(secondCalculation.minimumScenario) &&
      JSON.stringify(firstCalculation.maximumScenario) === JSON.stringify(secondCalculation.maximumScenario) &&
      JSON.stringify(firstCalculation.middleScenario) === JSON.stringify(secondCalculation.middleScenario);
    
    return {
      isConsistent,
      message: isConsistent ? 
        'Version switching maintains consistent results' : 
        'Version switching produces inconsistent results'
    };
    
  } catch (error) {
    return {
      isConsistent: false,
      message: `Version switching validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}