/**
 * Navigation Context Utilities
 * 
 * This module provides navigation state management and contextual navigation
 * utilities for the mortgage calculator step flow.
 */

import { getStepHeaderConfig, stepHeaderConfig } from './stepHeaderConfig';

export interface NavigationState {
  currentStep: number;
  canGoBack: boolean;
  canGoForward: boolean;
  backDestination: number;
  forwardDestination: number;
  contextualBackText: string;
  previousStepName: string;
  nextStepName: string;
}

/**
 * Step-to-previous-step mapping for navigation flow
 * Based on the logical flow of the mortgage calculator
 */
export const stepToPreviousStepMapping: Record<number, number> = {
  1: 0, // Home step - no previous step
  2: 1, // Debts -> Goal selection
  3: 2, // Payments -> Debts
  4: 3, // Assets -> Payments
  5: 4, // Contact -> Assets
  6: 5  // Simulator -> Contact
};

/**
 * Step-to-next-step mapping for navigation flow
 */
export const stepToNextStepMapping: Record<number, number> = {
  1: 2, // Goal -> Debts
  2: 3, // Debts -> Payments
  3: 4, // Payments -> Assets
  4: 5, // Assets -> Contact
  5: 6, // Contact -> Simulator
  6: 6  // Simulator - final step
};

/**
 * Get step name for display purposes
 * @param stepNumber - The step number (1-6)
 * @returns Human-readable step name
 */
export const getStepName = (stepNumber: number): string => {
  const stepNames: Record<number, string> = {
    1: 'בחירת מטרה',
    2: 'מצב חובות',
    3: 'החזרים',
    4: 'שווי נכסים',
    5: 'פרטי קשר',
    6: 'סימולציה'
  };
  
  return stepNames[stepNumber] || 'שלב לא ידוע';
};

/**
 * Generate contextual back navigation text for a specific step
 * @param stepNumber - The current step number (1-6)
 * @returns Contextual back navigation text
 */
export const generateContextualBackText = (stepNumber: number): string => {
  const config = getStepHeaderConfig(stepNumber);
  
  // Use the pre-configured back navigation text from step header config
  if (config.backNavigationText) {
    return config.backNavigationText;
  }
  
  // Fallback generation if not configured
  const previousStep = stepToPreviousStepMapping[stepNumber];
  if (previousStep === 0) {
    return ''; // No back navigation for first step
  }
  
  const previousStepName = getStepName(previousStep);
  return `חזור ל${previousStepName}`;
};

/**
 * Create navigation state for a specific step
 * @param currentStep - The current step number (1-6)
 * @returns Complete NavigationState object
 */
export const createNavigationState = (currentStep: number): NavigationState => {
  const backDestination = stepToPreviousStepMapping[currentStep] || 0;
  const forwardDestination = stepToNextStepMapping[currentStep] || currentStep;
  
  const canGoBack = backDestination > 0;
  const canGoForward = forwardDestination > currentStep;
  
  const contextualBackText = generateContextualBackText(currentStep);
  const previousStepName = canGoBack ? getStepName(backDestination) : '';
  const nextStepName = canGoForward ? getStepName(forwardDestination) : '';
  
  return {
    currentStep,
    canGoBack,
    canGoForward,
    backDestination,
    forwardDestination,
    contextualBackText,
    previousStepName,
    nextStepName
  };
};

/**
 * Get all available steps in the navigation flow
 * @returns Array of step numbers
 */
export const getAllSteps = (): number[] => {
  return Object.keys(stepHeaderConfig).map(Number).sort((a, b) => a - b);
};

/**
 * Check if a step number is valid
 * @param stepNumber - The step number to validate
 * @returns Boolean indicating if step is valid
 */
export const isValidStep = (stepNumber: number): boolean => {
  return stepNumber >= 1 && stepNumber <= 6 && stepHeaderConfig[stepNumber] !== undefined;
};

/**
 * Get the total number of steps in the flow
 * @returns Total number of steps
 */
export const getTotalSteps = (): number => {
  return Math.max(...getAllSteps());
};

/**
 * Calculate progress percentage for a given step
 * @param stepNumber - The current step number
 * @returns Progress percentage (0-100)
 */
export const calculateProgressPercentage = (stepNumber: number): number => {
  const totalSteps = getTotalSteps();
  return Math.round((stepNumber / totalSteps) * 100);
};