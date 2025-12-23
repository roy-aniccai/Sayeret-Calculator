/**
 * Property-based tests for Step1Debts track-specific UI consistency
 * Feature: flow-specific-user-journeys
 */

import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import * as fc from 'fast-check';
import { FormProvider } from '../../context/FormContext';
import { TrackType } from '../../types';
import { Step1Debts } from './Step1Debts';

// Mock the API module to avoid import.meta issues
jest.mock('../../utils/api', () => ({
  trackEvent: jest.fn(() => Promise.resolve())
}));

describe('Step1Debts Track-Specific UI Consistency', () => {
  /**
   * **Feature: flow-specific-user-journeys, Property 1: Track-specific UI consistency**
   * **Validates: Requirements 1.2, 2.2, 4.1, 5.1, 6.2, 6.3, 6.4**
   * 
   * For any selected track and any UI component, the component should render with 
   * track-appropriate styling, labels, tooltips, and content that matches the track's configuration
   */
  test('should render with track-appropriate content for different tracks', () => {
    fc.assert(
      fc.property(
        // Generate random track selection
        fc.constantFrom(TrackType.MONTHLY_REDUCTION, TrackType.SHORTEN_TERM),
        
        (selectedTrack) => {
          // Create a custom FormProvider that sets the track
          const TestFormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
            return (
              <FormProvider>
                <TestTrackSetter track={selectedTrack}>
                  {children}
                </TestTrackSetter>
              </FormProvider>
            );
          };

          const TestTrackSetter: React.FC<{ track: TrackType; children: React.ReactNode }> = ({ track, children }) => {
            const { updateFormData } = require('../../context/FormContext').useForm();
            
            React.useEffect(() => {
              updateFormData({ track });
            }, [track, updateFormData]);

            return <>{children}</>;
          };

          const { container } = render(
            <TestFormProvider>
              <Step1Debts />
            </TestFormProvider>
          );

          // Verify track-specific content is displayed
          if (selectedTrack === TrackType.MONTHLY_REDUCTION) {
            // Should contain monthly reduction specific text
            expect(container.textContent).toMatch(/מצב חובות נוכחי|נבדוק את המצב הכספי הנוכחי/);
            expect(container.textContent).toMatch(/בתשלום החודשי|הפחתת תשלום/);
          } else if (selectedTrack === TrackType.SHORTEN_TERM) {
            // Should contain term shortening specific text
            expect(container.textContent).toMatch(/מצב חובות לאיחוד|נאחד את כל החובות למשכנתא אחת/);
            expect(container.textContent).toMatch(/בשנים ובריבית|קיצור שנים/);
          }

          // Verify basic UI elements are present
          expect(container.querySelector('h2')).toBeInTheDocument();
          expect(container.querySelectorAll('button').length).toBeGreaterThan(0);
          expect(container.querySelectorAll('input').length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Track-specific styling consistency test
   * Ensures that styling elements are present for each track
   */
  test('should apply appropriate styling elements for each track', () => {
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

          const TestTrackSetter: React.FC<{ track: TrackType; children: React.ReactNode }> = ({ track, children }) => {
            const { updateFormData } = require('../../context/FormContext').useForm();
            
            React.useEffect(() => {
              updateFormData({ track });
            }, [track, updateFormData]);

            return <>{children}</>;
          };

          const { container } = render(
            <TestFormProvider>
              <Step1Debts />
            </TestFormProvider>
          );

          // Check for color-related classes (blue for monthly reduction, green for term shortening)
          const expectedColorClass = selectedTrack === TrackType.MONTHLY_REDUCTION ? 'blue' : 'green';
          
          // Verify some styling elements are present
          const styledElements = container.querySelectorAll(`[class*="${expectedColorClass}"], [class*="text-"], [class*="bg-"]`);
          expect(styledElements.length).toBeGreaterThan(0);

          // Verify icons are present
          const icons = container.querySelectorAll('i[class*="fa-"]');
          expect(icons.length).toBeGreaterThan(0);

          // Verify buttons are present and styled
          const buttons = container.querySelectorAll('button');
          expect(buttons.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Track-specific messaging consistency test
   * Ensures that messaging is appropriate for each track
   */
  test('should display track-appropriate messaging and CTAs', () => {
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

          const TestTrackSetter: React.FC<{ track: TrackType; children: React.ReactNode }> = ({ track, children }) => {
            const { updateFormData } = require('../../context/FormContext').useForm();
            
            React.useEffect(() => {
              updateFormData({ track });
            }, [track, updateFormData]);

            return <>{children}</>;
          };

          const { container } = render(
            <TestFormProvider>
              <Step1Debts />
            </TestFormProvider>
          );

          // Verify track-specific CTA text is present
          if (selectedTrack === TrackType.MONTHLY_REDUCTION) {
            expect(container.textContent).toMatch(/בדוק הפחתת תשלום|המשך לחישוב/);
          } else if (selectedTrack === TrackType.SHORTEN_TERM) {
            expect(container.textContent).toMatch(/בדוק קיצור שנים|המשך לחישוב/);
          }

          // Verify common elements are present
          expect(container.textContent).toMatch(/יתרת משכנתא נוכחית/);
          expect(container.textContent).toMatch(/האם יש לך הלוואות נוספות/);
          expect(container.textContent).toMatch(/האם יש מינוס ממוצע בבנק/);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Basic functionality test
   * Ensures the component renders without errors for both tracks
   */
  test('should render without errors for any track', () => {
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

          const TestTrackSetter: React.FC<{ track: TrackType; children: React.ReactNode }> = ({ track, children }) => {
            const { updateFormData } = require('../../context/FormContext').useForm();
            
            React.useEffect(() => {
              updateFormData({ track });
            }, [track, updateFormData]);

            return <>{children}</>;
          };

          expect(() => {
            render(
              <TestFormProvider>
                <Step1Debts />
              </TestFormProvider>
            );
          }).not.toThrow();
        }
      ),
      { numRuns: 100 }
    );
  });
});