/**
 * Property-based tests for Step2Payments track-aware validation
 * Feature: flow-specific-user-journeys
 */

import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import * as fc from 'fast-check';
import { FormProvider } from '../../context/FormContext';
import { TrackType } from '../../types';
import { Step2Payments } from './Step2Payments';

// Mock the API module to avoid import.meta issues
jest.mock('../../utils/api', () => ({
  trackEvent: jest.fn(() => Promise.resolve())
}));

describe('Step2Payments Track-Aware Validation', () => {
  /**
   * **Feature: flow-specific-user-journeys, Property 4: Track-aware validation consistency**
   * **Validates: Requirements 1.5, 3.5, 5.2**
   * 
   * For any form input or user action, validation rules should be applied 
   * consistently according to the active track's configuration
   */
  test('should apply track-specific validation rules consistently', () => {
    fc.assert(
      fc.property(
        // Generate random track selection
        fc.constantFrom(TrackType.MONTHLY_REDUCTION, TrackType.SHORTEN_TERM),
        // Generate random payment amounts
        fc.integer({ min: 1000, max: 20000 }),
        fc.integer({ min: 0, max: 5000 }),
        
        (selectedTrack, mortgagePayment, otherLoansPayment) => {
          const TestFormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
            return (
              <FormProvider>
                <TestTrackSetter track={selectedTrack} mortgagePayment={mortgagePayment} otherLoansPayment={otherLoansPayment}>
                  {children}
                </TestTrackSetter>
              </FormProvider>
            );
          };

          const TestTrackSetter: React.FC<{ 
            track: TrackType; 
            mortgagePayment: number;
            otherLoansPayment: number;
            children: React.ReactNode;
          }> = ({ track, mortgagePayment, otherLoansPayment, children }) => {
            const { updateFormData } = require('../../context/FormContext').useForm();
            
            React.useEffect(() => {
              updateFormData({ 
                track, 
                mortgagePayment,
                otherLoansPayment,
                targetTotalPayment: mortgagePayment + otherLoansPayment
              });
            }, [track, mortgagePayment, otherLoansPayment, updateFormData]);

            return <>{children}</>;
          };

          const { container } = render(
            <TestFormProvider>
              <Step2Payments />
            </TestFormProvider>
          );

          // Verify track-specific content is displayed
          if (selectedTrack === TrackType.MONTHLY_REDUCTION) {
            // Monthly reduction track should show payment reduction focused content
            expect(container.textContent).toMatch(/החזרים חודשיים נוכחיים|כמה אתה משלם היום/);
            expect(container.textContent).toMatch(/יעד החזר חודשי חדש/);
          } else if (selectedTrack === TrackType.SHORTEN_TERM) {
            // Term shortening track should show aggressive payment focused content
            expect(container.textContent).toMatch(/יכולת תשלום מוגברת|כמה אתה יכול לשלם בחודש/);
            expect(container.textContent).toMatch(/יעד תשלום מוגבר לקיצור שנים/);
          }

          // Verify slider is present and functional
          const slider = container.querySelector('input[type="range"]');
          expect(slider).toBeInTheDocument();

          // Verify payment inputs are present
          const paymentInputs = container.querySelectorAll('input[inputmode="numeric"]');
          expect(paymentInputs.length).toBeGreaterThanOrEqual(2);

          // Verify track-specific styling is applied
          const trackElement = container.querySelector(`[class*="track-${selectedTrack}"]`);
          expect(trackElement).toBeInTheDocument();
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Track-specific payment range validation test
   * Ensures payment ranges are calculated correctly for each track
   */
  test('should calculate appropriate payment ranges for each track', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(TrackType.MONTHLY_REDUCTION, TrackType.SHORTEN_TERM),
        fc.integer({ min: 3000, max: 15000 }), // current payment
        
        (selectedTrack, currentPayment) => {
          const TestFormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
            return (
              <FormProvider>
                <TestTrackSetter track={selectedTrack} currentPayment={currentPayment}>
                  {children}
                </TestTrackSetter>
              </FormProvider>
            );
          };

          const TestTrackSetter: React.FC<{ 
            track: TrackType; 
            currentPayment: number;
            children: React.ReactNode;
          }> = ({ track, currentPayment, children }) => {
            const { updateFormData } = require('../../context/FormContext').useForm();
            
            React.useEffect(() => {
              updateFormData({ 
                track, 
                mortgagePayment: currentPayment,
                otherLoansPayment: 0,
                targetTotalPayment: currentPayment
              });
            }, [track, currentPayment, updateFormData]);

            return <>{children}</>;
          };

          const { container } = render(
            <TestFormProvider>
              <Step2Payments />
            </TestFormProvider>
          );

          // Verify slider exists with appropriate range
          const slider = container.querySelector('input[type="range"]') as HTMLInputElement;
          expect(slider).toBeInTheDocument();

          if (slider) {
            const minValue = parseInt(slider.min);
            const maxValue = parseInt(slider.max);
            const currentValue = parseInt(slider.value);

            // Verify range is reasonable
            expect(minValue).toBeGreaterThan(0);
            expect(maxValue).toBeGreaterThan(minValue);
            expect(currentValue).toBeGreaterThanOrEqual(minValue);
            expect(currentValue).toBeLessThanOrEqual(maxValue);

            // Track-specific range validation
            if (selectedTrack === TrackType.MONTHLY_REDUCTION) {
              // Monthly reduction should allow payments below current
              expect(minValue).toBeLessThanOrEqual(currentPayment);
            } else if (selectedTrack === TrackType.SHORTEN_TERM) {
              // Term shortening should encourage higher payments
              expect(maxValue).toBeGreaterThan(currentPayment);
            }
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Track-specific messaging consistency test
   * Ensures messaging changes appropriately based on track
   */
  test('should display track-appropriate messaging and tooltips', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(TrackType.MONTHLY_REDUCTION, TrackType.SHORTEN_TERM),
        
        (selectedTrack) => {
          const TestFormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
            return (
              <FormProvider>
                <TestTrackSetter track={selectedTrack}>
                  {children}
                </TestTrackSetter>
              </FormProvider>
            );
          };

          const TestTrackSetter: React.FC<{ 
            track: TrackType; 
            children: React.ReactNode;
          }> = ({ track, children }) => {
            const { updateFormData } = require('../../context/FormContext').useForm();
            
            React.useEffect(() => {
              updateFormData({ 
                track,
                mortgagePayment: 6000,
                otherLoansPayment: 500,
                targetTotalPayment: 6500
              });
            }, [track, updateFormData]);

            return <>{children}</>;
          };

          const { container } = render(
            <TestFormProvider>
              <Step2Payments />
            </TestFormProvider>
          );

          // Verify track-specific CTA text
          if (selectedTrack === TrackType.MONTHLY_REDUCTION) {
            expect(container.textContent).toMatch(/בדוק הפחתת תשלום|המשך לחישוב/);
            expect(container.textContent).toMatch(/בריבית נמוכה יותר/);
          } else if (selectedTrack === TrackType.SHORTEN_TERM) {
            expect(container.textContent).toMatch(/בדוק קיצור שנים|המשך לחישוב/);
            expect(container.textContent).toMatch(/לקיצור שנים מקסימלי/);
          }

          // Verify common elements are present
          expect(container.textContent).toMatch(/החזר משכנתא חודשי נוכחי/);
          expect(container.textContent).toMatch(/סך החזר חודשי נוכחי/);

          // Verify buttons are present
          const buttons = container.querySelectorAll('button');
          expect(buttons.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Basic functionality test
   * Ensures the component renders without errors for both tracks
   */
  test('should render without errors for any track and payment combination', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(TrackType.MONTHLY_REDUCTION, TrackType.SHORTEN_TERM),
        fc.integer({ min: 1000, max: 25000 }),
        fc.integer({ min: 0, max: 8000 }),
        
        (selectedTrack, mortgagePayment, otherLoansPayment) => {
          const TestFormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
            return (
              <FormProvider>
                <TestTrackSetter track={selectedTrack} mortgagePayment={mortgagePayment} otherLoansPayment={otherLoansPayment}>
                  {children}
                </TestTrackSetter>
              </FormProvider>
            );
          };

          const TestTrackSetter: React.FC<{ 
            track: TrackType; 
            mortgagePayment: number;
            otherLoansPayment: number;
            children: React.ReactNode;
          }> = ({ track, mortgagePayment, otherLoansPayment, children }) => {
            const { updateFormData } = require('../../context/FormContext').useForm();
            
            React.useEffect(() => {
              updateFormData({ 
                track, 
                mortgagePayment,
                otherLoansPayment,
                targetTotalPayment: mortgagePayment + otherLoansPayment
              });
            }, [track, mortgagePayment, otherLoansPayment, updateFormData]);

            return <>{children}</>;
          };

          expect(() => {
            render(
              <TestFormProvider>
                <Step2Payments />
              </TestFormProvider>
            );
          }).not.toThrow();
        }
      ),
      { numRuns: 100 }
    );
  });
});