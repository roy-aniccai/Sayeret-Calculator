/**
 * Property-based tests for step header configuration
 * Feature: compact-step-layout
 */

import * as fc from 'fast-check';
import { 
  stepHeaderConfig, 
  getStepHeaderConfig, 
  getMainHeaderTitle, 
  getStepTitle, 
  getBackNavigationText, 
  hasBackNavigation,
  StepHeaderMapping 
} from './stepHeaderConfig';

describe('Step Header Configuration', () => {
  /**
   * **Feature: compact-step-layout, Property 13: Step-specific header display**
   * **Validates: Requirements 4.1**
   * 
   * For any step component (except home step), when rendered, the main header 
   * should display the step-specific title instead of the generic application title
   */
  test('should display step-specific titles for non-home steps', () => {
    fc.assert(
      fc.property(
        // Generate step numbers from 2-6 (excluding home step 1)
        fc.integer({ min: 2, max: 6 }),
        
        (stepNumber) => {
          const headerConfig = getStepHeaderConfig(stepNumber);
          const mainHeaderTitle = getMainHeaderTitle(stepNumber);
          
          // Verify step-specific title is not the generic application title
          expect(mainHeaderTitle).not.toBe("בדיקת דופק למשכנתא");
          
          // Verify the title is step-specific and not empty
          expect(mainHeaderTitle).toBeTruthy();
          expect(mainHeaderTitle.length).toBeGreaterThan(0);
          
          // Verify the configuration is consistent
          expect(headerConfig.mainHeaderTitle).toBe(mainHeaderTitle);
          expect(headerConfig.stepNumber).toBe(stepNumber);
          
          // Verify step title is also provided
          const stepTitle = getStepTitle(stepNumber);
          expect(stepTitle).toBeTruthy();
          expect(stepTitle.length).toBeGreaterThan(0);
          expect(headerConfig.stepTitle).toBe(stepTitle);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Home step should maintain generic title
   * Verifies that step 1 (home) keeps the original generic title
   */
  test('should maintain generic title for home step', () => {
    const homeStepConfig = getStepHeaderConfig(1);
    const homeMainTitle = getMainHeaderTitle(1);
    
    // Home step should keep the generic title
    expect(homeMainTitle).toBe("בדיקת דופק למשכנתא");
    expect(homeStepConfig.mainHeaderTitle).toBe("בדיקת דופק למשכנתא");
    
    // But should still have a step title
    expect(homeStepConfig.stepTitle).toBeTruthy();
    expect(homeStepConfig.stepTitle.length).toBeGreaterThan(0);
  });

  /**
   * Configuration completeness test
   * Ensures all required fields are present for each step
   */
  test('should provide complete configuration for all valid steps', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 6 }),
        
        (stepNumber) => {
          const config = getStepHeaderConfig(stepNumber);
          
          // Verify all required fields are present
          expect(config.stepNumber).toBe(stepNumber);
          expect(config.mainHeaderTitle).toBeTruthy();
          expect(config.stepTitle).toBeTruthy();
          expect(typeof config.backNavigationText).toBe('string'); // Can be empty for step 1
          
          // Verify field types
          expect(typeof config.stepNumber).toBe('number');
          expect(typeof config.mainHeaderTitle).toBe('string');
          expect(typeof config.stepTitle).toBe('string');
          expect(typeof config.backNavigationText).toBe('string');
          
          // Verify non-empty strings for required fields
          expect(config.mainHeaderTitle.length).toBeGreaterThan(0);
          expect(config.stepTitle.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Back navigation availability test
   * Ensures back navigation is available for appropriate steps
   */
  test('should provide back navigation for steps after home', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 6 }),
        
        (stepNumber) => {
          const hasBack = hasBackNavigation(stepNumber);
          const backText = getBackNavigationText(stepNumber);
          
          // Steps 2-6 should have back navigation
          expect(hasBack).toBe(true);
          expect(backText).toBeTruthy();
          expect(backText.length).toBeGreaterThan(0);
          
          // Back text should contain Hebrew text indicating return
          expect(backText).toMatch(/חזור/);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Home step back navigation test
   * Ensures home step has no back navigation
   */
  test('should not provide back navigation for home step', () => {
    const hasBack = hasBackNavigation(1);
    const backText = getBackNavigationText(1);
    
    expect(hasBack).toBe(false);
    expect(backText).toBe("");
  });

  /**
   * Invalid step handling test
   * Ensures graceful fallback for invalid step numbers
   */
  test('should handle invalid step numbers gracefully', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.integer({ max: 0 }), // Below valid range
          fc.integer({ min: 7 })   // Above valid range
        ),
        
        (invalidStep) => {
          const config = getStepHeaderConfig(invalidStep);
          
          // Should fallback to step 1 configuration
          expect(config.stepNumber).toBe(1);
          expect(config.mainHeaderTitle).toBe("בדיקת דופק למשכנתא");
          expect(config.stepTitle).toBeTruthy();
          expect(config.backNavigationText).toBe("");
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Configuration consistency test
   * Ensures the same step always returns the same configuration
   */
  test('should return consistent configuration for same step', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 6 }),
        
        (stepNumber) => {
          // Get configuration multiple times
          const config1 = getStepHeaderConfig(stepNumber);
          const config2 = getStepHeaderConfig(stepNumber);
          const config3 = getStepHeaderConfig(stepNumber);
          
          // Should be identical
          expect(config1).toEqual(config2);
          expect(config2).toEqual(config3);
          
          // Individual getters should also be consistent
          expect(getMainHeaderTitle(stepNumber)).toBe(config1.mainHeaderTitle);
          expect(getStepTitle(stepNumber)).toBe(config1.stepTitle);
          expect(getBackNavigationText(stepNumber)).toBe(config1.backNavigationText);
          expect(hasBackNavigation(stepNumber)).toBe(config1.backNavigationText.length > 0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: compact-step-layout, Property 16: Specific step header mapping**
   * **Validates: Requirements 4.4, 4.5**
   * 
   * For any specific step (debts, payments, assets, etc.), when loaded, the correct 
   * step-specific title should appear in the main header and the correct promoted 
   * subtitle should appear as the step title
   */
  test('should provide correct step-specific header mapping for each step', () => {
    // Test specific step mappings as defined in requirements
    const expectedMappings = [
      {
        step: 2,
        expectedMainHeader: "מצב חובות נוכחי",
        expectedStepTitle: "נבדוק את המצב הכספי הנוכחי",
        expectedBackText: "חזור לבחירת מטרה"
      },
      {
        step: 3,
        expectedMainHeader: "החזרים חודשיים נוכחיים",
        expectedStepTitle: "כמה אתה משלם היום?",
        expectedBackText: "חזור למצב חובות"
      },
      {
        step: 4,
        expectedMainHeader: "פרטים למיחזור",
        expectedStepTitle: "פרטים למיחזור",
        expectedBackText: "חזור להחזרים"
      },
      {
        step: 5,
        expectedMainHeader: "פרטי קשר",
        expectedStepTitle: "נשלח לך את התוצאות",
        expectedBackText: "חזור לפרטים למיחזור"
      },
      {
        step: 6,
        expectedMainHeader: "סימולטור משכנתא",
        expectedStepTitle: "תוצאות הסימולציה",
        expectedBackText: "חזור לפרטי קשר"
      }
    ];

    expectedMappings.forEach(({ step, expectedMainHeader, expectedStepTitle, expectedBackText }) => {
      const config = getStepHeaderConfig(step);
      
      // Verify main header title matches expected
      expect(config.mainHeaderTitle).toBe(expectedMainHeader);
      expect(getMainHeaderTitle(step)).toBe(expectedMainHeader);
      
      // Verify step title matches expected
      expect(config.stepTitle).toBe(expectedStepTitle);
      expect(getStepTitle(step)).toBe(expectedStepTitle);
      
      // Verify back navigation text matches expected
      expect(config.backNavigationText).toBe(expectedBackText);
      expect(getBackNavigationText(step)).toBe(expectedBackText);
      
      // Verify step number is correct
      expect(config.stepNumber).toBe(step);
    });
  });

  /**
   * Property-based test for step-specific mapping consistency
   * Ensures all steps have appropriate Hebrew text and consistent structure
   */
  test('should maintain Hebrew text consistency across all step mappings', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 6 }),
        
        (stepNumber) => {
          const config = getStepHeaderConfig(stepNumber);
          
          // All Hebrew text should be right-to-left and contain Hebrew characters
          const hebrewRegex = /[\u0590-\u05FF]/;
          
          expect(config.mainHeaderTitle).toMatch(hebrewRegex);
          expect(config.stepTitle).toMatch(hebrewRegex);
          
          // Back navigation should contain Hebrew for steps > 1
          if (stepNumber > 1) {
            expect(config.backNavigationText).toMatch(hebrewRegex);
            expect(config.backNavigationText).toMatch(/חזור/); // Should contain "return" in Hebrew
          }
          
          // Verify no empty strings for required fields
          expect(config.mainHeaderTitle.trim()).not.toBe('');
          expect(config.stepTitle.trim()).not.toBe('');
          
          // Verify reasonable length limits
          expect(config.mainHeaderTitle.length).toBeLessThan(100);
          expect(config.stepTitle.length).toBeLessThan(100);
          expect(config.backNavigationText.length).toBeLessThan(50);
        }
      ),
      { numRuns: 100 }
    );
  });
});