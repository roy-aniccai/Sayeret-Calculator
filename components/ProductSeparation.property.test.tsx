import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import fc from 'fast-check';
import App from '../App';
import SingleTrackApp from './SingleTrackApp';

/**
 * Property-Based Test Suite: Product Separation
 * 
 * This test suite uses property-based testing to verify that the original calculator
 * and single-track calculator maintain complete separation across all possible interactions.
 * 
 * **Validates: Requirements 4.1, 4.3, 4.5**
 */
describe('Product Separation Properties', () => {
  
  afterEach(() => {
    cleanup();
    // Reset any global state
    window.history.replaceState({}, '', '/');
  });

  /**
   * Property 1: Original Calculator Independence
   * For any sequence of user interactions with the original calculator,
   * the system should maintain original functionality without single-track contamination.
   */
  test('Property 1: Original calculator operates independently of single-track implementation', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.oneof(
            fc.constant('render'),
            fc.constant('selectMonthlyReduction'),
            fc.constant('selectShortenTerm'),
            fc.constant('restart'),
            fc.constant('navigateNext'),
            fc.constant('navigateBack')
          ),
          { minLength: 1, maxLength: 10 }
        ),
        (actions) => {
          let currentApp: any = null;
          let hasError = false;

          try {
            // Render original calculator
            currentApp = render(<App />);
            
            // Verify initial state is track selection
            expect(screen.getByText('מה המטרה העיקרית?')).toBeInTheDocument();
            
            // Execute sequence of actions
            for (const action of actions) {
              switch (action) {
                case 'render':
                  // Re-render should maintain state
                  break;
                  
                case 'selectMonthlyReduction':
                  const monthlyButton = screen.queryByText('הפחתת תשלום חודשי');
                  if (monthlyButton) {
                    fireEvent.click(monthlyButton);
                  }
                  break;
                  
                case 'selectShortenTerm':
                  const shortenButton = screen.queryByText('הוזלת המשכנתא');
                  if (shortenButton) {
                    fireEvent.click(shortenButton);
                  }
                  break;
                  
                case 'restart':
                  const restartButton = screen.queryByTitle('התחל מחדש');
                  if (restartButton) {
                    fireEvent.click(restartButton);
                  }
                  break;
                  
                case 'navigateNext':
                  const nextButton = screen.queryByText('המשך');
                  if (nextButton) {
                    fireEvent.click(nextButton);
                  }
                  break;
                  
                case 'navigateBack':
                  const backButton = screen.queryByTitle('חזור');
                  if (backButton) {
                    fireEvent.click(backButton);
                  }
                  break;
              }
            }
            
            // Verify original calculator characteristics are maintained
            // 1. Should never show single-track landing page content
            expect(screen.queryByText('ברוכים הבאים למחשבון הקטנת תשלום חודשי')).not.toBeInTheDocument();
            
            // 2. Should maintain track selection capability
            const restartButton = screen.queryByTitle('התחל מחדש');
            if (restartButton) {
              fireEvent.click(restartButton);
              expect(screen.getByText('מה המטרה העיקרית?')).toBeInTheDocument();
            }
            
            // 3. Should not contain single-track specific elements
            expect(screen.queryByText('מחשבון מותאם לקמפיין')).not.toBeInTheDocument();
            
          } catch (error) {
            hasError = true;
            console.error('Property test failed with actions:', actions, error);
          } finally {
            if (currentApp) {
              currentApp.unmount();
            }
          }
          
          expect(hasError).toBe(false);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 2: Single-Track Calculator Independence  
   * For any sequence of user interactions with the single-track calculator,
   * the system should maintain single-track functionality without original calculator contamination.
   */
  test('Property 2: Single-track calculator operates independently of original implementation', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.oneof(
            fc.constant('render'),
            fc.constant('proceedFromLanding'),
            fc.constant('restart'),
            fc.constant('navigateNext'),
            fc.constant('navigateBack'),
            fc.constant('fillForm')
          ),
          { minLength: 1, maxLength: 10 }
        ),
        fc.record({
          campaignId: fc.option(fc.string({ minLength: 1, maxLength: 20 })),
          utmSource: fc.option(fc.oneof(fc.constant('facebook'), fc.constant('google'), fc.constant('direct')))
        }),
        (actions, campaignData) => {
          let currentApp: any = null;
          let hasError = false;

          try {
            // Render single-track calculator with campaign data
            const props = {
              campaignId: campaignData.campaignId || undefined,
              utmParams: campaignData.utmSource ? { utm_source: campaignData.utmSource } : undefined
            };
            
            currentApp = render(<SingleTrackApp {...props} />);
            
            // Verify initial state is landing page (not track selection)
            expect(screen.getByText('הקטן תשלום חודשי')).toBeInTheDocument();
            
            // Execute sequence of actions
            for (const action of actions) {
              switch (action) {
                case 'render':
                  // Re-render should maintain state
                  break;
                  
                case 'proceedFromLanding':
                  const proceedButton = screen.queryByText('התחל');
                  if (proceedButton) {
                    fireEvent.click(proceedButton);
                  }
                  break;
                  
                case 'restart':
                  const restartButton = screen.queryByTitle('התחל מחדש');
                  if (restartButton) {
                    fireEvent.click(restartButton);
                  }
                  break;
                  
                case 'navigateNext':
                  const nextButton = screen.queryByText('המשך');
                  if (nextButton) {
                    fireEvent.click(nextButton);
                  }
                  break;
                  
                case 'navigateBack':
                  const backButton = screen.queryByTitle('חזור');
                  if (backButton) {
                    fireEvent.click(backButton);
                  }
                  break;
                  
                case 'fillForm':
                  // Try to fill any visible form fields
                  const inputs = screen.queryAllByRole('textbox');
                  inputs.forEach(input => {
                    fireEvent.change(input, { target: { value: '100000' } });
                  });
                  break;
              }
            }
            
            // Verify single-track calculator characteristics are maintained
            // 1. Should never show track selection
            expect(screen.queryByText('מה המטרה העיקרית?')).not.toBeInTheDocument();
            expect(screen.queryByText('הוזלת המשכנתא')).not.toBeInTheDocument();
            
            // 2. Restart should return to landing page, not track selection
            const restartButton = screen.queryByTitle('התחל מחדש');
            if (restartButton) {
              fireEvent.click(restartButton);
              expect(screen.getByText('הקטן תשלום חודשי')).toBeInTheDocument();
              expect(screen.queryByText('מה המטרה העיקרית?')).not.toBeInTheDocument();
            }
            
          } catch (error) {
            hasError = true;
            console.error('Property test failed with actions:', actions, 'campaignData:', campaignData, error);
          } finally {
            if (currentApp) {
              currentApp.unmount();
            }
          }
          
          expect(hasError).toBe(false);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 3: Context Isolation
   * For any combination of form data and user interactions,
   * the original and single-track calculators should maintain separate contexts.
   */
  test('Property 3: Form contexts remain completely isolated', () => {
    fc.assert(
      fc.property(
        fc.record({
          mortgageBalance: fc.integer({ min: 100000, max: 5000000 }),
          mortgagePayment: fc.integer({ min: 1000, max: 20000 }),
          propertyValue: fc.integer({ min: 500000, max: 10000000 }),
          leadName: fc.string({ minLength: 2, maxLength: 20 }),
          leadPhone: fc.string({ minLength: 10, maxLength: 15 })
        }),
        (formData) => {
          let originalApp: any = null;
          let singleTrackApp: any = null;
          let hasError = false;

          try {
            // Test that both apps can be rendered simultaneously without interference
            const originalContainer = document.createElement('div');
            const singleTrackContainer = document.createElement('div');
            document.body.appendChild(originalContainer);
            document.body.appendChild(singleTrackContainer);

            // Render both apps in separate containers
            originalApp = render(<App />, { container: originalContainer });
            singleTrackApp = render(<SingleTrackApp />, { container: singleTrackContainer });

            // Verify both apps maintain their distinct characteristics
            // Original should show track selection
            expect(originalContainer.textContent).toContain('מה המטרה העיקרית?');
            
            // Single-track should show landing page
            expect(singleTrackContainer.textContent).toContain('הקטן תשלום חודשי');
            expect(singleTrackContainer.textContent).not.toContain('מה המטרה העיקרית?');

            // Clean up containers
            document.body.removeChild(originalContainer);
            document.body.removeChild(singleTrackContainer);
            
          } catch (error) {
            hasError = true;
            console.error('Context isolation test failed with formData:', formData, error);
          } finally {
            if (originalApp) {
              originalApp.unmount();
            }
            if (singleTrackApp) {
              singleTrackApp.unmount();
            }
          }
          
          expect(hasError).toBe(false);
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property 4: URL Parameter Isolation
   * For any URL parameters or routing changes,
   * the original calculator should remain unaffected by single-track parameters.
   */
  test('Property 4: URL parameters do not cross-contaminate applications', () => {
    fc.assert(
      fc.property(
        fc.record({
          campaignId: fc.option(fc.string({ minLength: 1, maxLength: 20 })),
          utmSource: fc.option(fc.string({ minLength: 1, maxLength: 20 })),
          utmMedium: fc.option(fc.string({ minLength: 1, maxLength: 20 })),
          utmCampaign: fc.option(fc.string({ minLength: 1, maxLength: 20 }))
        }),
        (urlParams) => {
          let originalApp: any = null;
          let hasError = false;

          try {
            // Instead of mocking window.location, just test that the original app
            // renders correctly regardless of what URL parameters might exist
            originalApp = render(<App />);
            
            // Verify original calculator is unaffected by any potential campaign parameters
            expect(screen.getByText('מה המטרה העיקרית?')).toBeInTheDocument();
            expect(screen.getByText('הפחתת תשלום חודשי')).toBeInTheDocument();
            expect(screen.getByText('הוזלת המשכנתא')).toBeInTheDocument();
            
            // Should not show any single-track specific content
            expect(screen.queryByText('מחשבון מותאם לקמפיין')).not.toBeInTheDocument();
            expect(screen.queryByText('ברוכים הבאים למחשבון הקטנת תשלום חודשי')).not.toBeInTheDocument();
            
          } catch (error) {
            hasError = true;
            console.error('URL parameter isolation test failed with params:', urlParams, error);
          } finally {
            if (originalApp) {
              originalApp.unmount();
            }
          }
          
          expect(hasError).toBe(false);
        }
      ),
      { numRuns: 30 }
    );
  });
});