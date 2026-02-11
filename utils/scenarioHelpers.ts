import { PaymentScenario, ScenarioCalculationResult } from './scenarioCalculator';

/**
 * Finds the scenario with the maximum monthly savings from the calculation result.
 * 
 * @param result The result from calculateScenarios
 * @returns The scenario with the highest monthly reduction, or null if none exist
 */
export const getMaxSavingsScenario = (result: ScenarioCalculationResult): PaymentScenario | null => {
    // If we have a special case with a maximum scenario (e.g. insufficient savings), return that
    if (result.maximumScenario) return result.maximumScenario;

    // Otherwise collect all valid scenarios
    const scenarios = [
        result.minimumScenario,
        result.middleScenario,
        result.maximumScenario
    ].filter((s): s is PaymentScenario => s !== null && s.isValid);

    if (scenarios.length === 0) return null;

    // Sort by monthlyReduction descending
    return scenarios.reduce((prev, current) =>
        (current.monthlyReduction > prev.monthlyReduction) ? current : prev
    );
};
