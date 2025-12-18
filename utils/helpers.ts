/**
 * Formats a number as a currency string with NIS symbol.
 * Example: 12000 -> "12,000 ₪"
 */
export const formatCurrency = (val: number): string => {
  if (val === undefined || val === null) return '';
  return Math.round(val).toLocaleString() + ' ₪';
};

/**
 * Formats a number with commas for display in inputs.
 * Example: 12000 -> "12,000"
 */
export const formatNumberWithCommas = (val: number | undefined | null): string => {
  if (val === undefined || val === null || val === 0) return '';
  return val.toLocaleString();
};

/**
 * Parses a string with commas back into a number.
 * Example: "1,200" -> 1200
 */
export const parseFormattedNumber = (val: string): number => {
  const cleanVal = val.replace(/,/g, '');
  const num = parseFloat(cleanVal);
  return isNaN(num) ? 0 : num;
};
