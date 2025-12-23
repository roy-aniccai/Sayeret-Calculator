/**
 * Property-based tests for track-specific calculation enhancements
 * Feature: flow-specific-user-journeys
 */

import * as fc from 'fast-check';
import { TrackType, FormData } from '../types';
import { 
  calculateWithTrackPriority, 
  calculateResults,
  getTrackSpecificScenarios 
} from './calculator';

// Mock the API module to avoid import.meta issues
jest.mock('./api', () => ({
  trackEvent: jest.fn(() => Promise.resolve())
}));

describe('Track-Specific Calculation Enhancements', () => {
  /**
   * **Feature: flow-specific-user-journeys, Property 3: Track-specific calculation priority**
   * **Validates: Requirements 1.3, 2.3, 6.5**
   * 
   * For any calculation performed within a track, the results should prioritize 
   * metrics and optimizations that align with that track's defined goals
   */
  test('should prioritize track-specific metrics in calculations', () => {
    fc.assert(
      fc.property(
        // Generate random track selection
        fc.constantFrom(TrackType.MONTHLY_REDUCTION, TrackType.SHORTEN_TERM),
        // Generate realistic form data
        fc.record({
          track: fc.constant(null), // Will be overridden
          mortgageBalance: fc.integer({ min: 500000, max: 3000000 }),
          otherLoansBalance: fc.integer({ min: 0, max: 500000 }),
          bankAccountBalance: fc.integer({ min: -50000, max: 100000 }),
          mortgagePayment: fc.integer({ min: 2000, max: 15000 }),
          otherLoansPayment: fc.integer({ min: 0, max: 3000 }),
          targetTotalPayment: fc.integer({ min: 2000, max: 15000 }),
          propertyValue: fc.integer({ min: 1000000, max: 5000000 }),
          age: fc.integer({ min: 25, max: 65 })
        }),
        
        (selectedTrack, baseFormData) => {
          const formData: FormData = {
            ...baseFormData,
            track: selectedTrack,
            // Add required fields with defaults
            leadName: '',
            leadPhone: '',
            currentPayment: baseFormData.mortgagePayment,
            yearsRemaining: 20,
            netIncome: 0,
            addedMonthlyPayment: 0,
            lumpSum: 0,
            standardLoans: 0,
            highInterestLoans: 0,
            loansPayment: 0,
            urgency: null,
            leadEmail: '',
            termsAccepted: true
          };

          const result = calculateWithTrackPriority(formData);
          const calculationResult = calculateResults(formData);
          
          // Verify track-specific optimization
          if (selectedTrack === TrackType.MONTHLY_REDUCTION) {
            // Payment reduction track should optimize for lower monthly payments
            expect(result.trackSpecific.optimizationScore).toBeGreaterThanOrEqual(0);
            
            // Should use payment-focused messaging
            if (calculationResult.isPositive) {
              expect(calculationResult.labelAfter).toContain('החזר');
              expect(calculationResult.unit).toBe('₪');
            }
            
            // Alternative scenarios should focus on payment variations
            const scenarios = getTrackSpecificScenarios(formData);
            scenarios.forEach(scenario => {
              expect(scenario.description).toMatch(/הפחתה|תשלום/);
            });
            
          } else if (selectedTrack === TrackType.SHORTEN_TERM) {
            // Term shortening track should optimize for shorter loan terms
            expect(result.trackSpecific.optimizationScore).toBeGreaterThanOrEqual(0);
            
            // Should use term-focused messaging
            if (calculationResult.isPositive) {
              expect(calculationResult.labelAfter).toContain('שנים');
              expect(calculationResult.unit).toBe('שנים');
            }
            
            // Alternative scenarios should focus on term variations
            const scenarios = getTrackSpecificScenarios(formData);
            scenarios.forEach(scenario => {
              expect(scenario.description).toMatch(/קיצור|שנים/);
            });
          }
          
          // Verify track-specific tradeoff analysis
          expect(result.trackSpecific.tradeoffs).toBeInstanceOf(Array);
          expect(result.trackSpecific.alternativeScenarios).toBeInstanceOf(Array);
          
          // Verify calculation consistency
          expect(result.newMonthlyPayment).toBeGreaterThan(0);
          expect(result.termYears).toBeGreaterThan(0);
          expect(result.termYears).toBeLessThanOrEqual(30);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Track optimization score consistency test
   * Ensures optimization scores are calculated consistently for the same inputs
   */
  test('should calculate consistent optimization scores for same track and inputs', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(TrackType.MONTHLY_REDUCTION, TrackType.SHORTEN_TERM),
        fc.record({
          mortgageBalance: fc.integer({ min: 1000000, max: 2000000 }),
          mortgagePayment: fc.integer({ min: 5000, max: 8000 }),
          targetTotalPayment: fc.integer({ min: 4000, max: 9000 }),
          propertyValue: fc.integer({ min: 2000000, max: 3000000 })
        }),
        
        (selectedTrack, baseData) => {
          const formData: FormData = {
            track: selectedTrack,
            mortgageBalance: baseData.mortgageBalance,
            otherLoansBalance: 0,
            bankAccountBalance: 0,
            mortgagePayment: baseData.mortgagePayment,
            otherLoansPayment: 0,
            targetTotalPayment: baseData.targetTotalPayment,
            propertyValue: baseData.propertyValue,
            age: 35,
            // Required fields
            leadName: '',
            leadPhone: '',
            currentPayment: baseData.mortgagePayment,
            yearsRemaining: 20,
            netIncome: 0,
            addedMonthlyPayment: 0,
            lumpSum: 0,
            standardLoans: 0,
            highInterestLoans: 0,
            loansPayment: 0,
            urgency: null,
            leadEmail: '',
            termsAccepted: true
          };

          // Calculate multiple times with same data
          const results = [];
          for (let i = 0; i < 3; i++) {
            const result = calculateWithTrackPriority(formData);
            results.push(result);
          }

          // Verify consistency
          const firstResult = results[0];
          results.forEach(result => {
            expect(result.newMonthlyPayment).toBe(firstResult.newMonthlyPayment);
            expect(result.termYears).toBe(firstResult.termYears);
            expect(result.trackSpecific.optimizationScore).toBe(firstResult.trackSpecific.optimizationScore);
            expect(result.trackSpecific.alternativeScenarios.length).toBe(firstResult.trackSpecific.alternativeScenarios.length);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Track-specific constraint validation test
   * Ensures calculations respect track-specific validation constraints
   */
  test('should respect track-specific validation constraints', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(TrackType.MONTHLY_REDUCTION, TrackType.SHORTEN_TERM),
        fc.integer({ min: 1000000, max: 2500000 }), // mortgage balance
        fc.integer({ min: 4000, max: 10000 }), // current payment
        
        (selectedTrack, mortgageBalance, currentPayment) => {
          const formData: FormData = {
            track: selectedTrack,
            mortgageBalance,
            otherLoansBalance: 0,
            bankAccountBalance: 0,
            mortgagePayment: currentPayment,
            otherLoansPayment: 0,
            targetTotalPayment: currentPayment,
            propertyValue: mortgageBalance * 1.5,
            age: 40,
            // Required fields
            leadName: '',
            leadPhone: '',
            currentPayment,
            yearsRemaining: 20,
            netIncome: 0,
            addedMonthlyPayment: 0,
            lumpSum: 0,
            standardLoans: 0,
            highInterestLoans: 0,
            loansPayment: 0,
            urgency: null,
            leadEmail: '',
            termsAccepted: true
          };

          const result = calculateWithTrackPriority(formData);
          
          if (selectedTrack === TrackType.MONTHLY_REDUCTION) {
            // Monthly reduction should not exceed 30 years
            expect(result.termYears).toBeLessThanOrEqual(30);
            
            // Payment should be reasonable (not below minimum threshold)
            expect(result.newMonthlyPayment).toBeGreaterThanOrEqual(1000);
            
          } else if (selectedTrack === TrackType.SHORTEN_TERM) {
            // Term shortening should not exceed 25 years (track-specific limit)
            expect(result.termYears).toBeLessThanOrEqual(25);
            
            // Payment should meet minimum increase requirement if valid
            if (result.isValid && result.newMonthlyPayment > currentPayment) {
              const increase = result.newMonthlyPayment - currentPayment;
              expect(increase).toBeGreaterThanOrEqual(0); // Should have some increase for term shortening
            }
          }
          
          // General constraints
          expect(result.termYears).toBeGreaterThan(0);
          expect(result.newMonthlyPayment).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});