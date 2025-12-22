/**
 * Color scheme interface for dynamic bar styling
 */
export interface ColorScheme {
  barGradient: string;
  textColor: string;
  headerTextColor: string;
  paymentBoxBg: string;
  paymentBoxText: string;
}

/**
 * Determines the color scheme for the simulated bar based on year comparison
 * @param currentYears - Current mortgage term in years
 * @param simulatedYears - Simulated mortgage term in years after refinancing
 * @returns ColorScheme object with all styling properties
 */
export function getSimulatedBarColorScheme(currentYears: number, simulatedYears: number): ColorScheme {
  const yearsDiff = currentYears - simulatedYears;
  
  // Green scheme for reduced years (positive outcome) or equal years
  if (yearsDiff >= 0) {
    return {
      barGradient: 'linear-gradient(to top, #10b981, #059669)',
      textColor: '#065f46',
      headerTextColor: '#065f46',
      paymentBoxBg: '#d1fae5',
      paymentBoxText: '#065f46'
    };
  }
  
  // Amber scheme for extended years (trade-off scenario)
  return {
    barGradient: 'linear-gradient(to top, #f59e0b, #d97706)',
    textColor: '#92400e',
    headerTextColor: '#92400e',
    paymentBoxBg: '#fef3c7',
    paymentBoxText: '#92400e'
  };
}

/**
 * Returns the grey color scheme for the current state bar (always grey)
 * @returns ColorScheme object with grey styling properties
 */
export function getCurrentBarColorScheme(): ColorScheme {
  return {
    barGradient: 'linear-gradient(to top, #9ca3af, #6b7280)',
    textColor: '#374151',
    headerTextColor: '#374151',
    paymentBoxBg: '#f3f4f6',
    paymentBoxText: '#374151'
  };
}