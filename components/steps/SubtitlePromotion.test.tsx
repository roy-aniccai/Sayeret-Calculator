/**
 * Property-based tests for subtitle promotion across step components
 * Feature: compact-step-layout
 */

import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import * as fc from 'fast-check';
import { FormProvider } from '../../context/FormContext';
import { TrackType } from '../../types';
import { Step1Debts } from './Step1Debts';
import { Step2Payments } from './Step2Payments';
import { Step3Assets } from './Step3Assets';
import { Step4Contact } from './Step4Contact';
import { Step5Simulator } from './Step5Simulator';
import { getStepTitle } from '../../utils/stepHeaderConfig';

// Mock the API module to avoid import.meta issues
jest.mock('../../utils/api', () => ({
  trackEvent: jest.fn(() => Promise.resolve()),
  submitData: jest.fn(() => Promise.resolve())
}));

describe('Subtitle Promotion Property Tests', () => {
  const stepComponents = [
    { component: Step1Debts, stepNumber: 2, name: 'Step1Debts' },
    { component: Step2Payments, stepNumber: 3, name: 'Step2Payments' },
    { component: Step3Assets, stepNumber: 4, name: 'Step3Assets' },
    { component: Step4Contact, stepNumber: 5, name: 'Step4Contact' },
    { component: Step5Simulator, stepNumber: 6, name: 'Step5Simulator' }
  ];

  /**
   * **Feature: compact-step-layout, Property 14: Subtitle promotion**
   * **Validates: Requirements 4.2**
   * 
   * For any step component, when loaded, the previous subtitle should become 
   * the primary step title within the content area
   */
  test('should promote subtitle to primary step title for all step components', () => {
    fc.assert(
      fc.property(
        // Generate random step component selection
        fc.constantFrom(...stepComponents),
        // Generate random track for components that support it
        fc.constantFrom(TrackType.MONTHLY_REDUCTION, TrackType.SHORTEN_TERM, undefined),
        
        (stepInfo, selectedTrack) => {
          const { component: StepComponent, stepNumber, name } = stepInfo;
          
          const TestFormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
            return (
              <FormProvider>
                <TestTrackSetter track={selectedTrack}>
                  {children}
                </TestTrackSetter>
              </FormProvider>
            );
          };

          const TestTrackSetter: React.FC<{ track?: TrackType; children: React.ReactNode }> = ({ track, children }) => {
            const { updateFormData } = require('../../context/FormContext').useForm();
            
            React.useEffect(() => {
              if (track) {
                updateFormData({ 
                  track,
                  mortgagePayment: 6000,
                  otherLoansPayment: 500,
                  mortgageBalance: 1200000,
                  otherLoansBalance: 150000,
                  propertyValue: 2500000,
                  leadName: 'Test User',
                  leadPhone: '0501234567',
                  age: 35
                });
              }
            }, [track, updateFormData]);

            return <>{children}</>;
          };

          const { container } = render(
            <TestFormProvider>
              <StepComponent />
            </TestFormProvider>
          );

          // Find the main h2 header element
          const mainHeader = container.querySelector('h2');
          expect(mainHeader).toBeInTheDocument();

          if (mainHeader) {
            const headerText = mainHeader.textContent || '';
            
            // Get the expected promoted subtitle from configuration
            const expectedSubtitle = getStepTitle(stepNumber);
            
            // For track-specific components (Step1Debts, Step2Payments), check for track-specific content
            if (name === 'Step1Debts' && selectedTrack) {
              if (selectedTrack === TrackType.MONTHLY_REDUCTION) {
                expect(headerText).toMatch(/נבדוק את המצב הכספי הנוכחי/);
              } else if (selectedTrack === TrackType.SHORTEN_TERM) {
                expect(headerText).toMatch(/נאחד את כל החובות למשכנתא אחת/);
              }
            } else if (name === 'Step2Payments' && selectedTrack) {
              if (selectedTrack === TrackType.MONTHLY_REDUCTION) {
                expect(headerText).toMatch(/כמה אתה משלם היום/);
              } else if (selectedTrack === TrackType.SHORTEN_TERM) {
                expect(headerText).toMatch(/כמה אתה יכול לשלם בחודש/);
              }
            } else {
              // For non-track-specific components, check for the configured subtitle
              expect(headerText).toContain(expectedSubtitle);
            }

            // Verify the header is properly styled as a primary title
            expect(mainHeader.tagName).toBe('H2');
            expect(mainHeader).toHaveClass('text-2xl', 'font-bold');
            
            // Verify there's no secondary description paragraph (subtitle has been promoted)
            const descriptionParagraph = container.querySelector('h2 + p');
            if (descriptionParagraph) {
              // If there is a paragraph, it should not contain the same text as the header
              const paragraphText = descriptionParagraph.textContent || '';
              expect(paragraphText).not.toBe(headerText);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Subtitle promotion consistency test
   * Ensures that all step components follow the same subtitle promotion pattern
   */
  test('should consistently promote subtitles across all step components', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...stepComponents),
        
        (stepInfo) => {
          const { component: StepComponent } = stepInfo;
          
          const TestFormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
            return (
              <FormProvider>
                <TestInitializer>
                  {children}
                </TestInitializer>
              </FormProvider>
            );
          };

          const TestInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
            const { updateFormData } = require('../../context/FormContext').useForm();
            
            React.useEffect(() => {
              updateFormData({ 
                mortgagePayment: 6000,
                otherLoansPayment: 500,
                mortgageBalance: 1200000,
                otherLoansBalance: 150000,
                propertyValue: 2500000,
                leadName: 'Test User',
                leadPhone: '0501234567',
                age: 35
              });
            }, [updateFormData]);

            return <>{children}</>;
          };

          const { container } = render(
            <TestFormProvider>
              <StepComponent />
            </TestFormProvider>
          );

          // Verify there's exactly one main h2 header
          const headers = container.querySelectorAll('h2');
          expect(headers.length).toBe(1);

          // Verify the header is centered and properly styled
          const mainHeader = headers[0];
          expect(mainHeader).toHaveClass('text-center');
          expect(mainHeader).toHaveClass('text-2xl');
          expect(mainHeader).toHaveClass('font-bold');

          // Verify the header contains meaningful content (not empty)
          const headerText = mainHeader.textContent || '';
          expect(headerText.trim().length).toBeGreaterThan(0);
          
          // Verify the header text is in Hebrew (contains Hebrew characters)
          expect(headerText).toMatch(/[\u0590-\u05FF]/);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Header hierarchy validation test
   * Ensures proper header hierarchy is maintained after subtitle promotion
   */
  test('should maintain proper header hierarchy after subtitle promotion', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...stepComponents),
        
        (stepInfo) => {
          const { component: StepComponent } = stepInfo;
          
          const TestFormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
            return (
              <FormProvider>
                <TestInitializer>
                  {children}
                </TestInitializer>
              </FormProvider>
            );
          };

          const TestInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
            const { updateFormData } = require('../../context/FormContext').useForm();
            
            React.useEffect(() => {
              updateFormData({ 
                mortgagePayment: 6000,
                otherLoansPayment: 500,
                mortgageBalance: 1200000,
                otherLoansBalance: 150000,
                propertyValue: 2500000,
                leadName: 'Test User',
                leadPhone: '0501234567',
                age: 35
              });
            }, [updateFormData]);

            return <>{children}</>;
          };

          const { container } = render(
            <TestFormProvider>
              <StepComponent />
            </TestFormProvider>
          );

          // Check header hierarchy - should have h2 as the main header
          const h1Elements = container.querySelectorAll('h1');
          const h2Elements = container.querySelectorAll('h2');
          const h3Elements = container.querySelectorAll('h3');

          // Should not have h1 elements (main header is in App.tsx)
          expect(h1Elements.length).toBe(0);

          // Should have exactly one h2 element (the promoted subtitle)
          expect(h2Elements.length).toBe(1);

          // Any h3 elements should come after the h2 and be subsection headers
          if (h3Elements.length > 0) {
            h3Elements.forEach(h3 => {
              expect(h3.textContent?.trim().length).toBeGreaterThan(0);
            });
          }

          // Verify the main h2 appears before any h3 elements in DOM order
          if (h3Elements.length > 0) {
            const h2Position = Array.from(container.querySelectorAll('*')).indexOf(h2Elements[0]);
            const firstH3Position = Array.from(container.querySelectorAll('*')).indexOf(h3Elements[0]);
            expect(h2Position).toBeLessThan(firstH3Position);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});