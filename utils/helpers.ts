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
  if (val === undefined || val === null) return '';
  if (val === 0) return '0';
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

/**
 * Formats years as "X שנים Y חודשים" format.
 * Example: 5.25 -> "5 שנים 3 חודשים"
 */
export const formatYearsAndMonths = (years: number): string => {
  const wholeYears = Math.floor(years);
  const months = Math.round((years % 1) * 12);

  if (months === 0) {
    return `${wholeYears} שנים`;
  }

  return `${wholeYears} שנים ${months} חודשים`;
};

/**
 * Formats a number for input display.
 * Returns empty string if value is 0, null, or undefined.
 * Otherwise returns comma-separated string.
 */
export const formatInputNumber = (val: number | undefined | null): string => {
  if (!val) return '';
  return val.toLocaleString();
};
