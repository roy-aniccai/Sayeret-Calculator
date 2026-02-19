/**
 * Step Header Configuration
 * 
 * This module provides the mapping configuration for step-specific headers,
 * implementing the header restructuring system for the compact step layout.
 */

export interface StepHeaderMapping {
  stepNumber: number;
  mainHeaderTitle: string;
  stepTitle: string;
  backNavigationText: string;
}

export interface StepHeaderConfig {
  [stepNumber: number]: StepHeaderMapping;
}

/**
 * Configuration mapping for step-specific header content
 * Based on requirements 4.1, 4.4, and 4.5
 */
export const stepHeaderConfig: StepHeaderConfig = {
  1: {
    stepNumber: 1,
    mainHeaderTitle: "בדיקת דופק למשכנתא", // Home step keeps original
    stepTitle: "בחירת מטרה",
    backNavigationText: ""
  },
  2: {
    stepNumber: 2,
    mainHeaderTitle: "הקטן תשלום חודשי",
    stepTitle: "נבדוק את המצב הכספי הנוכחי",
    backNavigationText: "חזור לבחירת מטרה"
  },
  3: {
    stepNumber: 3,
    mainHeaderTitle: "החזרים חודשיים נוכחיים",
    stepTitle: "כמה אתה משלם היום?",
    backNavigationText: "חזור למצב חובות"
  },
  4: {
    stepNumber: 4,
    mainHeaderTitle: "פרטים למיחזור",
    stepTitle: "פרטים למיחזור",
    backNavigationText: "חזור להחזרים"
  },
  5: {
    stepNumber: 5,
    mainHeaderTitle: "פרטי קשר",
    stepTitle: "נשלח לך את התוצאות",
    backNavigationText: "חזור לפרטים למיחזור"
  },
  6: {
    stepNumber: 6,
    mainHeaderTitle: "סימולטור משכנתא",
    stepTitle: "תוצאות הסימולציה",
    backNavigationText: "חזור לפרטי קשר"
  }
};

/**
 * Get step header configuration for a specific step
 * @param stepNumber - The current step number (1-6)
 * @returns StepHeaderMapping object with header configuration
 */
export const getStepHeaderConfig = (stepNumber: number): StepHeaderMapping => {
  const config = stepHeaderConfig[stepNumber];

  if (!config) {
    // Fallback to step 1 configuration if step not found
    console.warn(`Step header configuration not found for step ${stepNumber}, falling back to step 1`);
    return stepHeaderConfig[1];
  }

  return config;
};

/**
 * Get the main header title for a specific step
 * @param stepNumber - The current step number (1-6)
 * @returns Main header title string
 */
export const getMainHeaderTitle = (stepNumber: number): string => {
  return getStepHeaderConfig(stepNumber).mainHeaderTitle;
};

/**
 * Get the step title for a specific step
 * @param stepNumber - The current step number (1-6)
 * @returns Step title string
 */
export const getStepTitle = (stepNumber: number): string => {
  return getStepHeaderConfig(stepNumber).stepTitle;
};

/**
 * Get the back navigation text for a specific step
 * @param stepNumber - The current step number (1-6)
 * @returns Back navigation text string
 */
export const getBackNavigationText = (stepNumber: number): string => {
  return getStepHeaderConfig(stepNumber).backNavigationText;
};

/**
 * Check if a step has back navigation available
 * @param stepNumber - The current step number (1-6)
 * @returns Boolean indicating if back navigation is available
 */
export const hasBackNavigation = (stepNumber: number): boolean => {
  return getBackNavigationText(stepNumber).length > 0;
};