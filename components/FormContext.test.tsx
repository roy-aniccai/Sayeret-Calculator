/**
 * Property-based tests for FormContext track-aware functionality
 * Feature: flow-specific-user-journeys
 */

import React from 'react';
import { render, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import * as fc from 'fast-check';
import { FormProvider, useForm } from '../context/FormContext';
import { TrackType } from '../types';

// Mock the API module to avoid import.meta issues
jest.mock('../utils/api', () => ({
  trackEvent: jest.fn(() => Promise.resolve())
}));

// Simple test component to access FormContext
const TestComponent: React.FC<{
  onRender?: (context: any) => void;
}> = ({ onRender }) => {
  const context = useForm();
  
  React.useEffect(() => {
    if (onRender) {
      onRender(context);
    }
  }, [context, onRender]);

  return (
    <div data-testid="test-component">
      <div data-testid="current-track">{context.formData.track || 'null'}</div>
      <div data-testid="current-step">{context.step}</div>
    </div>
  );
};

describe('FormContext Track Context Preservation', () => {
  /**
   * **Feature: flow-specific-user-journeys, Property 5: Track context preservation**
   * **Validates: Requirements 3.3, 7.1**
   * 
   * For any navigation or state change within the application, 
   * the selected track context should be preserved throughout the entire user session
   */
  test('should preserve track context through navigation and state changes', () => {
    fc.assert(
      fc.property(
        // Generate random track selection
        fc.constantFrom(TrackType.MONTHLY_REDUCTION, TrackType.SHORTEN_TERM),
        // Generate random step numbers
        fc.integer({ min: 1, max: 6 }),
        // Generate random form data
        fc.record({
          mortgageBalance: fc.integer({ min: 100000, max: 5000000 }),
          mortgagePayment: fc.integer({ min: 1000, max: 20000 }),
          propertyValue: fc.integer({ min: 500000, max: 10000000 })
        }),
        
        (selectedTrack, targetStep, formData) => {
          let capturedContext: any = null;
          
          const { rerender } = render(
            <FormProvider>
              <TestComponent 
                onRender={(ctx) => {
                  capturedContext = ctx;
                }}
              />
            </FormProvider>
          );

          // Set the track and perform state changes
          act(() => {
            capturedContext.updateFormData({ track: selectedTrack });
            capturedContext.setStep(targetStep);
            capturedContext.updateFormData(formData);
          });

          // Force re-render to capture updated state
          rerender(
            <FormProvider>
              <TestComponent 
                onRender={(ctx) => {
                  capturedContext = ctx;
                }}
              />
            </FormProvider>
          );

          // Verify track context is preserved
          expect(capturedContext.formData.track).toBe(selectedTrack);
          expect(capturedContext.step).toBe(targetStep);
          
          // Verify track-specific configuration is consistent
          const config = capturedContext.getTrackConfig();
          const expectedPriority = selectedTrack === TrackType.MONTHLY_REDUCTION ? 'payment' : 'term';
          expect(config.calculation.optimizationPriority).toBe(expectedPriority);
          
          // Verify track-specific methods work correctly
          expect(capturedContext.isTrack(selectedTrack)).toBe(true);
          expect(capturedContext.isTrack(
            selectedTrack === TrackType.MONTHLY_REDUCTION 
              ? TrackType.SHORTEN_TERM 
              : TrackType.MONTHLY_REDUCTION
          )).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Track-specific validation consistency test
   * Ensures validation rules are consistently applied based on track
   */
  test('should apply consistent track-specific validation rules', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(TrackType.MONTHLY_REDUCTION, TrackType.SHORTEN_TERM),
        fc.integer({ min: 1000, max: 20000 }), // base payment value
        
        (selectedTrack, basePayment) => {
          let capturedContext: any = null;
          
          render(
            <FormProvider>
              <TestComponent 
                onRender={(ctx) => {
                  capturedContext = ctx;
                }}
              />
            </FormProvider>
          );

          // Set track and payment
          act(() => {
            capturedContext.updateFormData({ 
              track: selectedTrack, 
              mortgagePayment: basePayment 
            });
          });

          // Test validation methods
          const paymentValidation = capturedContext.getTrackSpecificValidation('paymentRange');
          const optimizedRange = capturedContext.getTrackOptimizedRange(basePayment);
          
          // Verify track-specific behavior
          if (selectedTrack === TrackType.MONTHLY_REDUCTION) {
            // Monthly reduction should allow payments below current
            expect(optimizedRange.min).toBeLessThanOrEqual(basePayment);
            expect(optimizedRange.max).toBe(basePayment);
            expect(paymentValidation.minIncrease).toBe(0);
          } else if (selectedTrack === TrackType.SHORTEN_TERM) {
            // Term shortening should require payment increase
            expect(optimizedRange.min).toBeGreaterThan(basePayment);
            expect(optimizedRange.max).toBeGreaterThan(basePayment);
            expect(paymentValidation.minIncrease).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Track configuration consistency test
   * Ensures that track-specific methods return consistent results for the same track
   */
  test('should return consistent track configuration for the same track', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(TrackType.MONTHLY_REDUCTION, TrackType.SHORTEN_TERM),
        
        (selectedTrack) => {
          let capturedContext: any = null;
          
          render(
            <FormProvider>
              <TestComponent 
                onRender={(ctx) => {
                  capturedContext = ctx;
                }}
              />
            </FormProvider>
          );

          // Set the track
          act(() => {
            capturedContext.updateFormData({ track: selectedTrack });
          });

          // Test method consistency multiple times
          const results = [];
          for (let i = 0; i < 3; i++) {
            const config = capturedContext.getTrackConfig();
            const isCurrentTrack = capturedContext.isTrack(selectedTrack);
            const styling = capturedContext.getTrackSpecificStyling('primary');
            
            results.push({
              priority: config.calculation.optimizationPriority,
              isCurrentTrack,
              styling
            });
          }

          // Verify consistency across multiple calls
          const firstResult = results[0];
          results.forEach(result => {
            expect(result.priority).toBe(firstResult.priority);
            expect(result.isCurrentTrack).toBe(firstResult.isCurrentTrack);
            expect(result.styling).toBe(firstResult.styling);
          });

          // Verify track-specific behavior
          const expectedPriority = selectedTrack === TrackType.MONTHLY_REDUCTION ? 'payment' : 'term';
          const expectedColor = selectedTrack === TrackType.MONTHLY_REDUCTION ? 'blue' : 'green';
          
          expect(firstResult.priority).toBe(expectedPriority);
          expect(firstResult.isCurrentTrack).toBe(true);
          expect(firstResult.styling).toContain(expectedColor);
        }
      ),
      { numRuns: 100 }
    );
  });
});