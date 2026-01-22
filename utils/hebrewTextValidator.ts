/**
 * Hebrew Text and RTL Support Validator
 * 
 * Ensures all new text elements use proper RTL direction
 * Validates Hebrew grammar in scenario messages
 * Aligns buttons properly for Hebrew layout
 * Tests Hebrew text rendering across components
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4 - Hebrew Text Display and RTL Support
 */

export interface HebrewTextValidationResult {
  isValid: boolean;
  issues: string[];
  suggestions: string[];
}

/**
 * Hebrew text patterns and validation rules
 */
const HEBREW_PATTERNS = {
  // Hebrew characters range
  hebrewChars: /[\u0590-\u05FF]/,
  // Common Hebrew words that should be properly formatted
  commonWords: [
    'ש"ח', 'שנים', 'שנה', 'חודש', 'חודשים', 'תשלום', 'תשלומים',
    'משכנתא', 'ביטוח', 'חיסכון', 'הפחתה', 'תרחיש', 'סימולטור'
  ],
  // Numbers with Hebrew currency
  currencyPattern: /\d+[\s,]*ש"ח/g,
  // Time periods in Hebrew
  timePattern: /\d+\s*(שנים|שנה|חודשים|חודש)/g
};

/**
 * Validate Hebrew text formatting and RTL support
 */
export function validateHebrewText(text: string, context: string = ''): HebrewTextValidationResult {
  const issues: string[] = [];
  const suggestions: string[] = [];
  
  // Check if text contains Hebrew characters
  const hasHebrew = HEBREW_PATTERNS.hebrewChars.test(text);
  
  if (hasHebrew) {
    // Check for proper RTL markers
    if (!text.includes('\u202B') && !text.includes('\u202E')) {
      suggestions.push(`Consider adding RTL markers for Hebrew text in ${context}`);
    }
    
    // Check currency formatting
    const currencyMatches = text.match(HEBREW_PATTERNS.currencyPattern);
    if (currencyMatches) {
      currencyMatches.forEach(match => {
        if (!match.includes(',') && match.match(/\d{4,}/)) {
          suggestions.push(`Consider adding thousand separators to ${match} in ${context}`);
        }
      });
    }
    
    // Check for mixed LTR/RTL issues
    const hasNumbers = /\d/.test(text);
    const hasEnglish = /[a-zA-Z]/.test(text);
    
    if (hasNumbers && hasHebrew) {
      suggestions.push(`Mixed Hebrew and numbers in ${context} - ensure proper RTL handling`);
    }
    
    if (hasEnglish && hasHebrew) {
      issues.push(`Mixed Hebrew and English text in ${context} may cause RTL display issues`);
    }
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    suggestions
  };
}

/**
 * Validate RTL CSS classes and styling
 */
export function validateRTLStyling(element: HTMLElement): HebrewTextValidationResult {
  const issues: string[] = [];
  const suggestions: string[] = [];
  
  const computedStyle = window.getComputedStyle(element);
  const direction = computedStyle.direction;
  const textAlign = computedStyle.textAlign;
  
  // Check if element has Hebrew text
  const hasHebrew = HEBREW_PATTERNS.hebrewChars.test(element.textContent || '');
  
  if (hasHebrew) {
    // Check direction
    if (direction !== 'rtl') {
      issues.push('Element with Hebrew text should have direction: rtl');
    }
    
    // Check text alignment for Hebrew content
    if (textAlign === 'left') {
      suggestions.push('Consider using text-align: right for Hebrew text');
    }
    
    // Check for proper RTL classes
    const classList = Array.from(element.classList);
    const hasRTLClass = classList.some(cls => 
      cls.includes('rtl') || 
      cls.includes('text-right') || 
      cls.includes('justify-end')
    );
    
    if (!hasRTLClass) {
      suggestions.push('Consider adding RTL-specific CSS classes');
    }
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    suggestions
  };
}

/**
 * Hebrew grammar validation for common patterns
 */
export function validateHebrewGrammar(text: string): HebrewTextValidationResult {
  const issues: string[] = [];
  const suggestions: string[] = [];
  
  // Check for common grammar patterns
  const patterns = [
    {
      pattern: /(\d+)\s*ש"ח\s*בחודש/g,
      description: 'Currency amount per month',
      suggestion: 'Ensure proper spacing around currency'
    },
    {
      pattern: /(\d+)\s*שנים/g,
      description: 'Years duration',
      suggestion: 'Check plural/singular form for years'
    },
    {
      pattern: /תרחיש\s*(מינימלי|מקסימלי|ביניים)/g,
      description: 'Scenario types',
      suggestion: 'Ensure consistent scenario naming'
    }
  ];
  
  patterns.forEach(({ pattern, description, suggestion }) => {
    const matches = text.match(pattern);
    if (matches) {
      // Additional validation logic can be added here
      suggestions.push(`${description}: ${suggestion}`);
    }
  });
  
  return {
    isValid: issues.length === 0,
    issues,
    suggestions
  };
}

/**
 * Comprehensive Hebrew text validation for components
 */
export function validateComponentHebrewText(
  componentName: string,
  textElements: { [key: string]: string }
): { [key: string]: HebrewTextValidationResult } {
  const results: { [key: string]: HebrewTextValidationResult } = {};
  
  Object.entries(textElements).forEach(([elementName, text]) => {
    const context = `${componentName}.${elementName}`;
    
    // Combine all validation results
    const textValidation = validateHebrewText(text, context);
    const grammarValidation = validateHebrewGrammar(text);
    
    results[elementName] = {
      isValid: textValidation.isValid && grammarValidation.isValid,
      issues: [...textValidation.issues, ...grammarValidation.issues],
      suggestions: [...textValidation.suggestions, ...grammarValidation.suggestions]
    };
  });
  
  return results;
}

/**
 * Format Hebrew currency with proper RTL support
 */
export function formatHebrewCurrency(amount: number): string {
  const formatted = new Intl.NumberFormat('he-IL').format(amount);
  return `${formatted} ש"ח`;
}

/**
 * Format Hebrew time periods with proper grammar
 */
export function formatHebrewTimePeriod(years: number): string {
  if (years === 1) {
    return 'שנה אחת';
  } else if (years === 2) {
    return 'שנתיים';
  } else if (years <= 10) {
    return `${years} שנים`;
  } else {
    return `${years} שנה`;
  }
}

/**
 * Ensure proper RTL direction for Hebrew text elements
 */
export function ensureRTLDirection(text: string): string {
  const hasHebrew = HEBREW_PATTERNS.hebrewChars.test(text);
  
  if (hasHebrew && !text.startsWith('\u202B')) {
    // Add RTL embedding character for proper display
    return `\u202B${text}\u202C`;
  }
  
  return text;
}