import * as fc from 'fast-check';
import { getSimulatedBarColorScheme, getCurrentBarColorScheme, ColorScheme } from './colorScheme';

describe('Color Scheme Determination', () => {
  
  /**
   * Property 1: Shorter term yields green scheme
   * Validates: Requirements 1.1
   */
  test('Property 1: Shorter term yields green scheme', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.float({ min: 5, max: 35 }), // currentYears
          fc.float({ min: 5, max: 35 })  // simulatedYears
        ).filter(([current, simulated]) => simulated < current), // Only test cases where simulated < current
        ([currentYears, simulatedYears]) => {
          const colorScheme = getSimulatedBarColorScheme(currentYears, simulatedYears);
          
          // Should return green scheme
          expect(colorScheme.barGradient).toBe('linear-gradient(to top, #10b981, #059669)');
          expect(colorScheme.textColor).toBe('#065f46');
          expect(colorScheme.headerTextColor).toBe('#065f46');
          expect(colorScheme.paymentBoxBg).toBe('#d1fae5');
          expect(colorScheme.paymentBoxText).toBe('#065f46');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2: Longer term yields amber scheme
   * Validates: Requirements 1.2
   */
  test('Property 2: Longer term yields amber scheme', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.float({ min: 5, max: 35 }), // currentYears
          fc.float({ min: 5, max: 35 })  // simulatedYears
        ).filter(([current, simulated]) => simulated > current), // Only test cases where simulated > current
        ([currentYears, simulatedYears]) => {
          const colorScheme = getSimulatedBarColorScheme(currentYears, simulatedYears);
          
          // Should return amber scheme
          expect(colorScheme.barGradient).toBe('linear-gradient(to top, #f59e0b, #d97706)');
          expect(colorScheme.textColor).toBe('#92400e');
          expect(colorScheme.headerTextColor).toBe('#92400e');
          expect(colorScheme.paymentBoxBg).toBe('#fef3c7');
          expect(colorScheme.paymentBoxText).toBe('#92400e');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 3: Current bar always grey
   * Validates: Requirements 1.4
   */
  test('Property 3: Current bar always grey', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.float({ min: 5, max: 35 }), // currentYears
          fc.float({ min: 5, max: 35 })  // simulatedYears
        ),
        ([currentYears, simulatedYears]) => {
          const currentColorScheme = getCurrentBarColorScheme();
          
          // Current bar should always be grey regardless of comparison
          expect(currentColorScheme.barGradient).toBe('linear-gradient(to top, #9ca3af, #6b7280)');
          expect(currentColorScheme.textColor).toBe('#374151');
          expect(currentColorScheme.headerTextColor).toBe('#374151');
          expect(currentColorScheme.paymentBoxBg).toBe('#f3f4f6');
          expect(currentColorScheme.paymentBoxText).toBe('#374151');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4: Gradient consistency
   * Validates: Requirements 1.5
   */
  test('Property 4: Gradient consistency', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.float({ min: 5, max: 35 }), // currentYears
          fc.float({ min: 5, max: 35 })  // simulatedYears
        ),
        ([currentYears, simulatedYears]) => {
          const simulatedColorScheme = getSimulatedBarColorScheme(currentYears, simulatedYears);
          const currentColorScheme = getCurrentBarColorScheme();
          
          // All gradients should follow the pattern "linear-gradient(to top, lighter, darker)"
          expect(simulatedColorScheme.barGradient).toMatch(/^linear-gradient\(to top, #[0-9a-f]{6}, #[0-9a-f]{6}\)$/);
          expect(currentColorScheme.barGradient).toMatch(/^linear-gradient\(to top, #[0-9a-f]{6}, #[0-9a-f]{6}\)$/);
          
          // Verify the gradient direction is consistent (to top)
          expect(simulatedColorScheme.barGradient).toContain('to top');
          expect(currentColorScheme.barGradient).toContain('to top');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 5: Complete color scheme
   * Validates: Requirements 1.6
   */
  test('Property 5: Complete color scheme', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.float({ min: 5, max: 35 }), // currentYears
          fc.float({ min: 5, max: 35 })  // simulatedYears
        ),
        ([currentYears, simulatedYears]) => {
          const colorScheme = getSimulatedBarColorScheme(currentYears, simulatedYears);
          
          // Should include all required styling properties
          expect(colorScheme).toHaveProperty('barGradient');
          expect(colorScheme).toHaveProperty('textColor');
          expect(colorScheme).toHaveProperty('headerTextColor');
          expect(colorScheme).toHaveProperty('paymentBoxBg');
          expect(colorScheme).toHaveProperty('paymentBoxText');
          
          // All properties should be non-empty strings
          expect(typeof colorScheme.barGradient).toBe('string');
          expect(colorScheme.barGradient.length).toBeGreaterThan(0);
          expect(typeof colorScheme.textColor).toBe('string');
          expect(colorScheme.textColor.length).toBeGreaterThan(0);
          expect(typeof colorScheme.headerTextColor).toBe('string');
          expect(colorScheme.headerTextColor.length).toBeGreaterThan(0);
          expect(typeof colorScheme.paymentBoxBg).toBe('string');
          expect(colorScheme.paymentBoxBg.length).toBeGreaterThan(0);
          expect(typeof colorScheme.paymentBoxText).toBe('string');
          expect(colorScheme.paymentBoxText.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});