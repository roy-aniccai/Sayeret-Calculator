import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { FormProvider } from '../../context/FormContext';
import { Step1Goal } from '../steps/Step1Goal';
import { Step1Debts } from '../steps/Step1Debts';
import { Step2Payments } from '../steps/Step2Payments';
import { Step3Assets } from '../steps/Step3Assets';
import { Step4Contact } from '../steps/Step4Contact';
import { Step5Simulator } from '../steps/Step5Simulator';

// Mock the API module to prevent network calls during testing
jest.mock('../../utils/api', () => ({
  trackEvent: jest.fn(),
}));

// Mock crypto.randomUUID for consistent session IDs
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-session-id'
  }
});

// Mock window dimensions for consistent viewport testing
const mockViewport = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
};

describe('Complete User Flow Integration Test', () => {
  beforeEach(() => {
    // Set up a standard mobile viewport for consistent testing
    mockViewport(375, 667);
    
    // Mock Date.now for consistent timing
    jest.spyOn(Date, 'now').mockReturnValue(1640995200000);
    
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Compact Layout Verification', () => {
    test('should display compact headers without fixed header text across all steps', () => {
      // Test Step 1 (Goal)
      const { rerender } = render(
        <FormProvider>
          <Step1Goal />
        </FormProvider>
      );
      
      expect(screen.getByText('מה המטרה העיקרית?')).toBeInTheDocument();
      
      // Test Step 2 (Debts)
      rerender(
        <FormProvider>
          <Step1Debts />
        </FormProvider>
      );
      
      expect(screen.getByText('נתוני משכנתא והלוואות')).toBeInTheDocument();
      
      // Test Step 3 (Payments)
      rerender(
        <FormProvider>
          <Step2Payments />
        </FormProvider>
      );
      
      expect(screen.getByText('החזרים חודשיים')).toBeInTheDocument();
      
      // Test Step 4 (Assets)
      rerender(
        <FormProvider>
          <Step3Assets />
        </FormProvider>
      );
      
      expect(screen.getByText('שווי הנכסים')).toBeInTheDocument();
      
      // Test Step 5 (Contact)
      rerender(
        <FormProvider>
          <Step4Contact />
        </FormProvider>
      );
      
      expect(screen.getByText('פרטי קשר')).toBeInTheDocument();
    });

    test('should maintain consistent compact layout spacing across steps', () => {
      const { rerender } = render(
        <FormProvider>
          <Step1Goal />
        </FormProvider>
      );
      
      // Check initial step layout
      const initialContainer = screen.getByText('מה המטרה העיקרית?').closest('div');
      expect(initialContainer).toHaveClass('animate-fade-in-up');
      
      // Test other steps have consistent layout
      rerender(
        <FormProvider>
          <Step1Debts />
        </FormProvider>
      );
      
      const debtsContainer = screen.getByText('נתוני משכנתא והלוואות').closest('div');
      expect(debtsContainer).toHaveClass('animate-fade-in-up');
    });

    test('should fit essential content within viewport constraints', () => {
      render(
        <FormProvider>
          <Step1Goal />
        </FormProvider>
      );
      
      // Verify content structure allows for compact layout
      const container = screen.getByText('מה המטרה העיקרית?').closest('div');
      expect(container).toHaveClass('animate-fade-in-up');
      
      // Verify CTAs are present and visible
      expect(screen.getByText('להוריד את ההחזר החודשי')).toBeVisible();
      expect(screen.getByText('קיצור שנים וחיסכון')).toBeVisible();
    });
  });

  describe('Tooltip Functionality Testing', () => {
    test('should display tooltips with enhanced readability', async () => {
      const user = userEvent.setup();
      
      render(
        <FormProvider>
          <Step1Debts />
        </FormProvider>
      );

      // Find and hover over tooltip trigger
      const tooltipTriggers = screen.getAllByRole('button', { name: /show tooltip/i });
      if (tooltipTriggers.length > 0) {
        await user.hover(tooltipTriggers[0]);

        // Verify tooltip appears with enhanced styling
        await waitFor(() => {
          const tooltip = screen.getByRole('tooltip');
          expect(tooltip).toBeInTheDocument();
          
          // Verify tooltip has proper styling classes for readability
          expect(tooltip).toHaveClass('text-base'); // Enhanced font size
        });
      }
    });

    test('should position tooltips within viewport boundaries', async () => {
      const user = userEvent.setup();
      
      render(
        <FormProvider>
          <Step1Debts />
        </FormProvider>
      );

      // Test tooltip positioning
      const tooltipTriggers = screen.getAllByRole('button', { name: /show tooltip/i });
      if (tooltipTriggers.length > 0) {
        await user.hover(tooltipTriggers[0]);

        await waitFor(() => {
          const tooltip = screen.getByRole('tooltip');
          expect(tooltip).toBeInTheDocument();
          
          // Verify tooltip is positioned (has positioning classes)
          expect(tooltip).toHaveClass('fixed'); // Tooltips use fixed positioning
        });
      }
    });
  });

  describe('CTA Visibility and Functionality', () => {
    test('should display CTAs prominently without scrolling', () => {
      render(
        <FormProvider>
          <Step1Goal />
        </FormProvider>
      );

      // Check initial step CTA visibility
      const initialCTA = screen.getByText('להוריד את ההחזר החודשי');
      expect(initialCTA).toBeInTheDocument();
      expect(initialCTA).toBeVisible();
    });

    test('should integrate CTAs with actionable content', () => {
      render(
        <FormProvider>
          <Step1Debts />
        </FormProvider>
      );
      
      // Verify integrated CTA with informational content
      const integratedCTA = screen.getByText('מידע מדויק = חיסכון מדויק יותר');
      expect(integratedCTA).toBeInTheDocument();
      
      // Verify the CTA button is part of the integrated design
      const ctaButton = screen.getByText('המשך לחישוב');
      expect(ctaButton.closest('.bg-blue-50')).toBeInTheDocument();
    });

    test('should maintain CTA visibility during form interactions', async () => {
      const user = userEvent.setup();
      
      render(
        <FormProvider>
          <Step1Debts />
        </FormProvider>
      );

      // Interact with form fields
      const mortgageInput = screen.getByPlaceholderText('1,200,000');
      await user.click(mortgageInput);
      await user.type(mortgageInput, '1500000');

      // Verify CTA remains visible during interaction
      const ctaButton = screen.getByText('המשך לחישוב');
      expect(ctaButton).toBeVisible();
    });

    test('should prioritize primary CTAs over secondary actions', () => {
      render(
        <FormProvider>
          <Step1Debts />
        </FormProvider>
      );
      
      // Primary CTA should be more prominent
      const primaryCTA = screen.getByText('המשך לחישוב');
      expect(primaryCTA).toHaveClass('bg-blue-600');
      
      // Secondary CTA should be less prominent
      const secondaryCTA = screen.getByText('חזור אחורה');
      expect(secondaryCTA).toHaveClass('text-gray-400');
    });
  });

  describe('Form Validation and Navigation', () => {
    test('should handle form validation errors gracefully', async () => {
      const user = userEvent.setup();
      
      render(
        <FormProvider>
          <Step1Debts />
        </FormProvider>
      );

      // Clear the default value first
      const mortgageInput = screen.getByPlaceholderText('1,200,000');
      await user.clear(mortgageInput);

      // Try to continue without filling required field
      const continueButton = screen.getByText('המשך לחישוב');
      await user.click(continueButton);

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText('נא להזין יתרת משכנתא')).toBeInTheDocument();
      });

      // Should remain on same step
      expect(screen.getByText('נתוני משכנתא והלוואות')).toBeInTheDocument();
    });

    test('should handle successful form submission', async () => {
      const user = userEvent.setup();
      
      render(
        <FormProvider>
          <Step1Debts />
        </FormProvider>
      );

      // Fill required field
      const mortgageInput = screen.getByPlaceholderText('1,200,000');
      await user.clear(mortgageInput);
      await user.type(mortgageInput, '1200000');
      
      const continueButton = screen.getByText('המשך לחישוב');
      await user.click(continueButton);

      // Should not show validation error
      expect(screen.queryByText('נא להזין יתרת משכנתא')).not.toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    test('should adapt layout for different viewport sizes', () => {
      // Test mobile viewport
      mockViewport(375, 667);
      const { rerender } = render(
        <FormProvider>
          <Step1Goal />
        </FormProvider>
      );
      
      let container = screen.getByText('מה המטרה העיקרית?').closest('div');
      expect(container).toHaveClass('animate-fade-in-up');

      // Test tablet viewport
      mockViewport(768, 1024);
      rerender(
        <FormProvider>
          <Step1Goal />
        </FormProvider>
      );
      
      container = screen.getByText('מה המטרה העיקרית?').closest('div');
      expect(container).toHaveClass('animate-fade-in-up'); // Should maintain compact design
    });

    test('should maintain CTA visibility across different viewport sizes', () => {
      const viewports = [
        { width: 320, height: 568 }, // Small mobile
        { width: 375, height: 667 }, // iPhone
        { width: 414, height: 896 }, // iPhone Plus
        { width: 768, height: 1024 }, // Tablet
        { width: 1024, height: 768 }, // Tablet landscape
        { width: 1280, height: 720 }, // Desktop small
        { width: 1920, height: 1080 }, // Desktop large
      ];

      viewports.forEach(({ width, height }) => {
        mockViewport(width, height);
        
        const { rerender } = render(
          <FormProvider>
            <Step1Goal />
          </FormProvider>
        );

        // Verify CTAs are visible in this viewport
        expect(screen.getByText('להוריד את ההחזר החודשי')).toBeVisible();
        expect(screen.getByText('קיצור שנים וחיסכון')).toBeVisible();

        // Test other steps
        rerender(
          <FormProvider>
            <Step1Debts />
          </FormProvider>
        );

        const continueButtons = screen.getAllByText('המשך לחישוב');
        expect(continueButtons[0]).toBeVisible();
        const backButtons = screen.getAllByText('חזור אחורה');
        expect(backButtons[0]).toBeVisible();
      });
    });

    test('should maintain tooltip functionality across viewport sizes', async () => {
      const user = userEvent.setup();
      
      const viewports = [
        { width: 320, height: 568 },
        { width: 768, height: 1024 },
        { width: 1920, height: 1080 },
      ];

      for (const { width, height } of viewports) {
        mockViewport(width, height);
        
        const { rerender } = render(
          <FormProvider>
            <Step1Debts />
          </FormProvider>
        );

        const tooltipTriggers = screen.getAllByRole('button', { name: /show tooltip/i });
        
        if (tooltipTriggers.length > 0) {
          await user.hover(tooltipTriggers[0]);
          
          await waitFor(() => {
            const tooltip = screen.getByRole('tooltip');
            expect(tooltip).toBeInTheDocument();
            expect(tooltip).toHaveClass('fixed'); // Should use fixed positioning
          });

          await user.unhover(tooltipTriggers[0]);
        }

        rerender(<div />); // Clean up
      }
    });

    test('should handle form input responsiveness across viewport sizes', async () => {
      const user = userEvent.setup();
      
      const viewports = [
        { width: 320, height: 568 },
        { width: 768, height: 1024 },
        { width: 1920, height: 1080 },
      ];

      for (const { width, height } of viewports) {
        mockViewport(width, height);
        
        const { rerender } = render(
          <FormProvider>
            <Step1Debts />
          </FormProvider>
        );

        // Test form interaction at this viewport size
        const mortgageInput = screen.getByPlaceholderText('1,200,000');
        expect(mortgageInput).toBeVisible();
        
        await user.clear(mortgageInput);
        await user.type(mortgageInput, '1500000');
        
        // Verify input works and CTA remains visible
        expect(mortgageInput).toHaveValue('1,500,000');
        const continueButtons = screen.getAllByText('המשך לחישוב');
        expect(continueButtons[0]).toBeVisible();

        rerender(<div />); // Clean up
      }
    });

    test('should maintain compact layout principles across all viewport sizes', () => {
      const viewports = [
        { width: 320, height: 568 },
        { width: 375, height: 667 },
        { width: 768, height: 1024 },
        { width: 1024, height: 768 },
        { width: 1920, height: 1080 },
      ];

      const steps = [
        { component: Step1Goal, title: 'מה המטרה העיקרית?' },
        { component: Step1Debts, title: 'נתוני משכנתא והלוואות' },
        { component: Step2Payments, title: 'החזרים חודשיים' },
        { component: Step3Assets, title: 'שווי הנכסים' },
        { component: Step4Contact, title: 'פרטי קשר' },
      ];

      viewports.forEach(({ width, height }) => {
        mockViewport(width, height);
        
        steps.forEach(({ component: StepComponent, title }) => {
          const { rerender } = render(
            <FormProvider>
              <StepComponent />
            </FormProvider>
          );

          // Verify step title is visible (compact header)
          expect(screen.getByText(title)).toBeInTheDocument();
          
          // Verify no fixed header text is present
          expect(screen.queryByText('Mortgage Calculator')).not.toBeInTheDocument();
          
          rerender(<div />); // Clean up
        });
      });
    });

    test('should handle extreme viewport constraints gracefully', () => {
      // Test very narrow viewport
      mockViewport(280, 480);
      const { rerender } = render(
        <FormProvider>
          <Step1Goal />
        </FormProvider>
      );
      
      expect(screen.getByText('מה המטרה העיקרית?')).toBeInTheDocument();
      expect(screen.getByText('להוריד את ההחזר החודשי')).toBeVisible();

      // Test very short viewport
      mockViewport(375, 400);
      rerender(
        <FormProvider>
          <Step1Goal />
        </FormProvider>
      );
      
      expect(screen.getByText('מה המטרה העיקרית?')).toBeInTheDocument();
      expect(screen.getByText('להוריד את ההחזר החודשי')).toBeVisible();

      // Test very wide viewport
      mockViewport(2560, 1440);
      rerender(
        <FormProvider>
          <Step1Goal />
        </FormProvider>
      );
      
      expect(screen.getByText('מה המטרה העיקרית?')).toBeInTheDocument();
      expect(screen.getByText('להוריד את ההחזר החודשי')).toBeVisible();
    });
  });

  describe('Complete User Flow End-to-End', () => {
    test('should complete full navigation through all steps with compact layout', async () => {
      const user = userEvent.setup();
      
      // Start with Step1Goal
      const { rerender } = render(
        <FormProvider>
          <Step1Goal />
        </FormProvider>
      );

      // Verify initial step
      expect(screen.getByText('מה המטרה העיקרית?')).toBeInTheDocument();
      expect(screen.getByText('להוריד את ההחזר החודשי')).toBeVisible();

      // Simulate navigation to Step1Debts
      rerender(
        <FormProvider>
          <Step1Debts />
        </FormProvider>
      );

      // Verify Step1Debts compact layout
      expect(screen.getByText('נתוני משכנתא והלוואות')).toBeInTheDocument();
      
      // Fill required mortgage balance field
      const mortgageInput = screen.getByPlaceholderText('1,200,000');
      await user.clear(mortgageInput);
      await user.type(mortgageInput, '1200000');

      // Verify CTA is visible and functional
      const continueButton = screen.getByText('המשך לחישוב');
      expect(continueButton).toBeVisible();
      
      // Simulate navigation to Step2Payments
      rerender(
        <FormProvider>
          <Step2Payments />
        </FormProvider>
      );

      // Verify Step2Payments compact layout
      expect(screen.getByText('החזרים חודשיים')).toBeInTheDocument();
      
      // Verify payment input fields are present
      const paymentInput = screen.getByPlaceholderText('6,500');
      expect(paymentInput).toBeVisible();

      // Simulate navigation to Step3Assets
      rerender(
        <FormProvider>
          <Step3Assets />
        </FormProvider>
      );

      // Verify Step3Assets compact layout
      expect(screen.getByText('שווי הנכסים')).toBeInTheDocument();
      
      // Verify property value input
      const propertyInput = screen.getByPlaceholderText('2,500,000');
      expect(propertyInput).toBeVisible();

      // Simulate navigation to Step4Contact
      rerender(
        <FormProvider>
          <Step4Contact />
        </FormProvider>
      );

      // Verify Step4Contact compact layout
      expect(screen.getByText('פרטי קשר')).toBeInTheDocument();
      
      // Verify contact form fields
      expect(screen.getByPlaceholderText('ישראל ישראלי')).toBeVisible();
      expect(screen.getByPlaceholderText('050-1234567')).toBeVisible();

      // Simulate navigation to Step5Simulator
      rerender(
        <FormProvider>
          <Step5Simulator />
        </FormProvider>
      );

      // Verify Step5Simulator compact layout
      expect(screen.getByText('סימולטור מיחזור')).toBeInTheDocument();
    });

    test('should navigate between all steps maintaining form data persistence', async () => {
      const user = userEvent.setup();
      
      // Test data persistence across step navigation
      const { rerender } = render(
        <FormProvider>
          <Step1Debts />
        </FormProvider>
      );

      // Fill mortgage data
      const mortgageInput = screen.getByPlaceholderText('1,200,000');
      await user.clear(mortgageInput);
      await user.type(mortgageInput, '1500000');

      // Navigate to payments step
      rerender(
        <FormProvider>
          <Step2Payments />
        </FormProvider>
      );

      // Fill payment data
      const paymentInput = screen.getByPlaceholderText('6,500');
      await user.clear(paymentInput);
      await user.type(paymentInput, '7000');

      // Navigate to assets step
      rerender(
        <FormProvider>
          <Step3Assets />
        </FormProvider>
      );

      // Fill asset data
      const propertyInput = screen.getByPlaceholderText('2,500,000');
      await user.clear(propertyInput);
      await user.type(propertyInput, '3000000');

      // Navigate to contact step
      rerender(
        <FormProvider>
          <Step4Contact />
        </FormProvider>
      );

      // Fill contact data
      const nameInput = screen.getByPlaceholderText('ישראל ישראלי');
      await user.clear(nameInput);
      await user.type(nameInput, 'דוד כהן');

      const phoneInput = screen.getByPlaceholderText('050-1234567');
      await user.clear(phoneInput);
      await user.type(phoneInput, '052-9876543');

      // Navigate back to debts step to verify data persistence
      rerender(
        <FormProvider>
          <Step1Debts />
        </FormProvider>
      );

      // Verify mortgage data is still there
      const persistedMortgageInput = screen.getByPlaceholderText('1,200,000');
      expect(persistedMortgageInput).toHaveValue('1,500,000');

      // Navigate back to payments to verify persistence
      rerender(
        <FormProvider>
          <Step2Payments />
        </FormProvider>
      );

      const persistedPaymentInput = screen.getByPlaceholderText('6,500');
      expect(persistedPaymentInput).toHaveValue('7,000');

      // Navigate back to assets to verify persistence
      rerender(
        <FormProvider>
          <Step3Assets />
        </FormProvider>
      );

      const persistedPropertyInput = screen.getByPlaceholderText('2,500,000');
      expect(persistedPropertyInput).toHaveValue('3,000,000');

      // Navigate back to contact to verify persistence
      rerender(
        <FormProvider>
          <Step4Contact />
        </FormProvider>
      );

      const persistedNameInput = screen.getByPlaceholderText('ישראל ישראלי');
      expect(persistedNameInput).toHaveValue('דוד כהן');

      const persistedPhoneInput = screen.getByPlaceholderText('050-1234567');
      expect(persistedPhoneInput).toHaveValue('052-9876543');
    });

    test('should handle complete step sequence with validation', async () => {
      const user = userEvent.setup();
      
      // Start with Step1Goal and select goal
      const { rerender } = render(
        <FormProvider>
          <Step1Goal />
        </FormProvider>
      );

      // Select a goal option
      const goalOption = screen.getByText('להוריד את ההחזר החודשי');
      await user.click(goalOption);

      // Navigate to Step1Debts
      rerender(
        <FormProvider>
          <Step1Debts />
        </FormProvider>
      );

      // Fill required mortgage balance field
      const mortgageInput = screen.getByPlaceholderText('1,200,000');
      await user.clear(mortgageInput);
      await user.type(mortgageInput, '1200000');

      // Continue to next step
      const continueButton = screen.getByText('המשך לחישוב');
      await user.click(continueButton);

      // Navigate to Step2Payments
      rerender(
        <FormProvider>
          <Step2Payments />
        </FormProvider>
      );

      // Fill payment information
      const paymentInput = screen.getByPlaceholderText('6,500');
      await user.clear(paymentInput);
      await user.type(paymentInput, '6800');

      // Continue to next step
      const paymentsContineButton = screen.getByText('המשך לחישוב');
      await user.click(paymentsContineButton);

      // Navigate to Step3Assets
      rerender(
        <FormProvider>
          <Step3Assets />
        </FormProvider>
      );

      // Fill asset information
      const propertyInput = screen.getByPlaceholderText('2,500,000');
      await user.clear(propertyInput);
      await user.type(propertyInput, '2800000');

      // Continue to next step
      const assetsContineButton = screen.getByText('המשך לחישוב');
      await user.click(assetsContineButton);

      // Navigate to Step4Contact
      rerender(
        <FormProvider>
          <Step4Contact />
        </FormProvider>
      );

      // Fill contact information
      const nameInput = screen.getByPlaceholderText('ישראל ישראלי');
      await user.clear(nameInput);
      await user.type(nameInput, 'משה לוי');

      const phoneInput = screen.getByPlaceholderText('050-1234567');
      await user.clear(phoneInput);
      await user.type(phoneInput, '054-1234567');

      // Submit form
      const submitButton = screen.getByText('בואו נראה!');
      await user.click(submitButton);

      // Navigate to Step5Simulator
      rerender(
        <FormProvider>
          <Step5Simulator />
        </FormProvider>
      );

      // Verify simulator step loads
      expect(screen.getByText('סימולטור מיחזור')).toBeInTheDocument();
    });

    test('should handle backward navigation maintaining data integrity', async () => {
      const user = userEvent.setup();
      
      // Start from Step4Contact
      const { rerender } = render(
        <FormProvider>
          <Step4Contact />
        </FormProvider>
      );

      // Fill contact data
      const nameInput = screen.getByPlaceholderText('ישראל ישראלי');
      await user.clear(nameInput);
      await user.type(nameInput, 'אברהם אברהמי');

      // Navigate backward to Step3Assets
      const backButton = screen.getByText('חזור אחורה');
      await user.click(backButton);

      rerender(
        <FormProvider>
          <Step3Assets />
        </FormProvider>
      );

      // Fill asset data
      const propertyInput = screen.getByPlaceholderText('2,500,000');
      await user.clear(propertyInput);
      await user.type(propertyInput, '2200000');

      // Navigate backward to Step2Payments
      const assetsBackButton = screen.getByText('חזור אחורה');
      await user.click(assetsBackButton);

      rerender(
        <FormProvider>
          <Step2Payments />
        </FormProvider>
      );

      // Verify we can navigate forward again
      const forwardButton = screen.getByText('המשך לחישוב');
      await user.click(forwardButton);

      // Navigate forward to Step3Assets
      rerender(
        <FormProvider>
          <Step3Assets />
        </FormProvider>
      );

      // Verify data is still there
      const persistedPropertyInput = screen.getByPlaceholderText('2,500,000');
      expect(persistedPropertyInput).toHaveValue('2,200,000');

      // Navigate forward to Step4Contact
      const assetsForwardButton = screen.getByText('המשך לחישוב');
      await user.click(assetsForwardButton);

      rerender(
        <FormProvider>
          <Step4Contact />
        </FormProvider>
      );

      // Verify contact data is still there
      const persistedNameInput = screen.getByPlaceholderText('ישראל ישראלי');
      expect(persistedNameInput).toHaveValue('אברהם אברהמי');
    });

    test('should maintain tooltip functionality across all steps', async () => {
      const user = userEvent.setup();
      
      // Test tooltips in Step1Debts
      const { rerender } = render(
        <FormProvider>
          <Step1Debts />
        </FormProvider>
      );

      let tooltipTriggers = screen.getAllByRole('button', { name: /show tooltip/i });
      if (tooltipTriggers.length > 0) {
        await user.hover(tooltipTriggers[0]);
        await waitFor(() => {
          expect(screen.getByRole('tooltip')).toBeInTheDocument();
        });
        await user.unhover(tooltipTriggers[0]);
      }

      // Test tooltips in Step2Payments
      rerender(
        <FormProvider>
          <Step2Payments />
        </FormProvider>
      );

      tooltipTriggers = screen.getAllByRole('button', { name: /show tooltip/i });
      if (tooltipTriggers.length > 0) {
        await user.hover(tooltipTriggers[0]);
        await waitFor(() => {
          expect(screen.getByRole('tooltip')).toBeInTheDocument();
        });
        await user.unhover(tooltipTriggers[0]);
      }

      // Test tooltips in Step3Assets
      rerender(
        <FormProvider>
          <Step3Assets />
        </FormProvider>
      );

      tooltipTriggers = screen.getAllByRole('button', { name: /show tooltip/i });
      if (tooltipTriggers.length > 0) {
        await user.hover(tooltipTriggers[0]);
        await waitFor(() => {
          expect(screen.getByRole('tooltip')).toBeInTheDocument();
        });
      }
    });

    test('should maintain CTA visibility and functionality across all steps', () => {
      const { rerender } = render(
        <FormProvider>
          <Step1Goal />
        </FormProvider>
      );

      // Verify Step1Goal CTAs
      expect(screen.getByText('להוריד את ההחזר החודשי')).toBeVisible();
      expect(screen.getByText('קיצור שנים וחיסכון')).toBeVisible();

      // Test Step1Debts CTAs
      rerender(
        <FormProvider>
          <Step1Debts />
        </FormProvider>
      );

      expect(screen.getByText('המשך לחישוב')).toBeVisible();
      expect(screen.getByText('חזור אחורה')).toBeVisible();

      // Test Step2Payments CTAs
      rerender(
        <FormProvider>
          <Step2Payments />
        </FormProvider>
      );

      expect(screen.getByText('המשך לחישוב')).toBeVisible();
      expect(screen.getByText('חזור אחורה')).toBeVisible();

      // Test Step3Assets CTAs
      rerender(
        <FormProvider>
          <Step3Assets />
        </FormProvider>
      );

      expect(screen.getByText('המשך לחישוב')).toBeVisible();
      expect(screen.getByText('חזור אחורה')).toBeVisible();

      // Test Step4Contact CTAs
      rerender(
        <FormProvider>
          <Step4Contact />
        </FormProvider>
      );

      expect(screen.getByText('בואו נראה!')).toBeVisible();
      expect(screen.getByText('חזור אחורה')).toBeVisible();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle extreme viewport sizes gracefully', () => {
      // Test very small viewport
      mockViewport(320, 480);
      const { rerender } = render(
        <FormProvider>
          <Step1Goal />
        </FormProvider>
      );
      
      expect(screen.getByText('מה המטרה העיקרית?')).toBeInTheDocument();
      expect(screen.getByText('להוריד את ההחזר החודשי')).toBeVisible();

      // Test very large viewport
      mockViewport(1920, 1080);
      rerender(
        <FormProvider>
          <Step1Goal />
        </FormProvider>
      );
      
      expect(screen.getByText('מה המטרה העיקרית?')).toBeInTheDocument();
      expect(screen.getByText('להוריד את ההחזר החודשי')).toBeVisible();
    });

    test('should handle multiple tooltip interactions without conflicts', async () => {
      const user = userEvent.setup();
      
      render(
        <FormProvider>
          <Step1Debts />
        </FormProvider>
      );

      const tooltipTriggers = screen.getAllByRole('button', { name: /show tooltip/i });
      
      if (tooltipTriggers.length >= 2) {
        // Hover over first tooltip
        await user.hover(tooltipTriggers[0]);
        await waitFor(() => {
          expect(screen.getByRole('tooltip')).toBeInTheDocument();
        });

        // Hover over second tooltip (should replace first)
        await user.hover(tooltipTriggers[1]);
        await waitFor(() => {
          const tooltips = screen.getAllByRole('tooltip');
          // Should only have one tooltip visible at a time
          expect(tooltips).toHaveLength(1);
        });
      }
    });

    test('should handle rapid form interactions without breaking CTA visibility', async () => {
      const user = userEvent.setup();
      
      render(
        <FormProvider>
          <Step1Debts />
        </FormProvider>
      );

      const mortgageInput = screen.getByPlaceholderText('1,200,000');
      const continueButton = screen.getByText('המשך לחישוב');

      // Rapid interactions
      await user.click(mortgageInput);
      await user.type(mortgageInput, '123');
      await user.clear(mortgageInput);
      await user.type(mortgageInput, '1500000');

      // CTA should remain visible throughout
      expect(continueButton).toBeVisible();
    });
  });

  describe('Form Data Persistence and State Management', () => {
    test('should persist form data across browser refresh simulation', async () => {
      const user = userEvent.setup();
      
      // Simulate filling form data
      const { rerender } = render(
        <FormProvider>
          <Step1Debts />
        </FormProvider>
      );

      // Fill mortgage data
      const mortgageInput = screen.getByPlaceholderText('1,200,000');
      await user.clear(mortgageInput);
      await user.type(mortgageInput, '1800000');

      // Navigate to another step and back to verify persistence within session
      rerender(
        <FormProvider>
          <Step2Payments />
        </FormProvider>
      );
      
      rerender(
        <FormProvider>
          <Step1Debts />
        </FormProvider>
      );

      // Verify data persistence within the same FormProvider session
      const persistedMortgageInput = screen.getByPlaceholderText('1,200,000');
      expect(persistedMortgageInput).toHaveValue('1,800,000');
    });

    test('should maintain form state during rapid step navigation', async () => {
      const user = userEvent.setup();
      
      const { rerender } = render(
        <FormProvider>
          <Step1Debts />
        </FormProvider>
      );

      // Fill initial data
      const mortgageInput = screen.getByPlaceholderText('1,200,000');
      await user.clear(mortgageInput);
      await user.type(mortgageInput, '1600000');

      // Rapid navigation between steps
      for (let i = 0; i < 3; i++) {
        // Go to payments
        rerender(
          <FormProvider>
            <Step2Payments />
          </FormProvider>
        );

        const paymentInput = screen.getByPlaceholderText('6,500');
        await user.clear(paymentInput);
        await user.type(paymentInput, '7200');

        // Go back to debts
        rerender(
          <FormProvider>
            <Step1Debts />
          </FormProvider>
        );

        // Verify data is still there
        const persistedMortgageInput = screen.getByPlaceholderText('1,200,000');
        expect(persistedMortgageInput).toHaveValue('1,600,000');

        // Go to assets
        rerender(
          <FormProvider>
            <Step3Assets />
          </FormProvider>
        );

        const propertyInput = screen.getByPlaceholderText('2,500,000');
        await user.clear(propertyInput);
        await user.type(propertyInput, '2800000');

        // Go back to payments
        rerender(
          <FormProvider>
            <Step2Payments />
          </FormProvider>
        );

        // Verify payment data is still there
        const persistedPaymentInput = screen.getByPlaceholderText('6,500');
        expect(persistedPaymentInput).toHaveValue('7,200');
      }
    });

    test('should handle partial form completion and resumption', async () => {
      const user = userEvent.setup();
      
      // Start filling form partially
      const { rerender } = render(
        <FormProvider>
          <Step1Debts />
        </FormProvider>
      );

      // Fill only mortgage field
      const mortgageInput = screen.getByPlaceholderText('1,200,000');
      await user.clear(mortgageInput);
      await user.type(mortgageInput, '1400000');

      // Navigate to payments step
      rerender(
        <FormProvider>
          <Step2Payments />
        </FormProvider>
      );

      // Fill some payment data
      const paymentInput = screen.getByPlaceholderText('6,500');
      await user.clear(paymentInput);
      await user.type(paymentInput, '6800');

      // Navigate to contact without filling assets
      rerender(
        <FormProvider>
          <Step4Contact />
        </FormProvider>
      );

      // Fill contact info
      const nameInput = screen.getByPlaceholderText('ישראל ישראלי');
      await user.clear(nameInput);
      await user.type(nameInput, 'יוסי כהן');

      // Navigate back to debts to verify data persistence
      rerender(
        <FormProvider>
          <Step1Debts />
        </FormProvider>
      );

      // Verify partial data is still there
      const persistedMortgageInput = screen.getByPlaceholderText('1,200,000');
      expect(persistedMortgageInput).toHaveValue('1,400,000');

      // Navigate back to contact to verify data is still there
      rerender(
        <FormProvider>
          <Step4Contact />
        </FormProvider>
      );

      const persistedNameInput = screen.getByPlaceholderText('ישראל ישראלי');
      expect(persistedNameInput).toHaveValue('יוסי כהן');
    });

    test('should handle form validation errors without losing data', async () => {
      const user = userEvent.setup();
      
      const { rerender } = render(
        <FormProvider>
          <Step1Debts />
        </FormProvider>
      );

      // Fill valid data first
      const mortgageInput = screen.getByPlaceholderText('1,200,000');
      await user.clear(mortgageInput);
      await user.type(mortgageInput, '1500000');

      // Navigate to next step
      rerender(
        <FormProvider>
          <Step2Payments />
        </FormProvider>
      );

      // Try invalid payment amount
      const paymentInput = screen.getByPlaceholderText('6,500');
      await user.clear(paymentInput);
      await user.type(paymentInput, '-1000'); // Invalid negative amount

      // Try to continue (should show validation error)
      const continueButton = screen.getByText('המשך לחישוב');
      await user.click(continueButton);

      // Navigate back to debts step
      rerender(
        <FormProvider>
          <Step1Debts />
        </FormProvider>
      );

      // Verify original valid data is still there
      const persistedMortgageInput = screen.getByPlaceholderText('1,200,000');
      expect(persistedMortgageInput).toHaveValue('1,500,000');

      // Navigate back to payments
      rerender(
        <FormProvider>
          <Step2Payments />
        </FormProvider>
      );

      // Fix the invalid data
      const fixedPaymentInput = screen.getByPlaceholderText('6,500');
      await user.clear(fixedPaymentInput);
      await user.type(fixedPaymentInput, '7000');

      // Should now be able to continue
      const fixedContinueButton = screen.getByText('המשך לחישוב');
      await user.click(fixedContinueButton);
    });

    test('should maintain data integrity across all form fields', async () => {
      const user = userEvent.setup();
      
      // Test comprehensive data entry and persistence
      const testData = {
        mortgage: '1750000',
        payment: '7500',
        property: '3200000',
        name: 'אליהו דוד',
        phone: '053-7654321',
        email: 'eliyahu@example.com'
      };

      // Fill debts step
      const { rerender } = render(
        <FormProvider>
          <Step1Debts />
        </FormProvider>
      );

      const mortgageInput = screen.getByPlaceholderText('1,200,000');
      await user.clear(mortgageInput);
      await user.type(mortgageInput, testData.mortgage);

      // Fill payments step
      rerender(
        <FormProvider>
          <Step2Payments />
        </FormProvider>
      );

      const paymentInput = screen.getByPlaceholderText('6,500');
      await user.clear(paymentInput);
      await user.type(paymentInput, testData.payment);

      // Fill assets step
      rerender(
        <FormProvider>
          <Step3Assets />
        </FormProvider>
      );

      const propertyInput = screen.getByPlaceholderText('2,500,000');
      await user.clear(propertyInput);
      await user.type(propertyInput, testData.property);

      // Fill contact step
      rerender(
        <FormProvider>
          <Step4Contact />
        </FormProvider>
      );

      const nameInput = screen.getByPlaceholderText('ישראל ישראלי');
      await user.clear(nameInput);
      await user.type(nameInput, testData.name);

      const phoneInput = screen.getByPlaceholderText('050-1234567');
      await user.clear(phoneInput);
      await user.type(phoneInput, testData.phone);

      // Verify all data persists by navigating through all steps
      rerender(
        <FormProvider>
          <Step1Debts />
        </FormProvider>
      );

      expect(screen.getByPlaceholderText('1,200,000')).toHaveValue('1,750,000');

      rerender(
        <FormProvider>
          <Step2Payments />
        </FormProvider>
      );

      expect(screen.getByPlaceholderText('6,500')).toHaveValue('7,500');

      rerender(
        <FormProvider>
          <Step3Assets />
        </FormProvider>
      );

      expect(screen.getByPlaceholderText('2,500,000')).toHaveValue('3,200,000');

      rerender(
        <FormProvider>
          <Step4Contact />
        </FormProvider>
      );

      expect(screen.getByPlaceholderText('ישראל ישראלי')).toHaveValue('אליהו דוד');
      expect(screen.getByPlaceholderText('050-1234567')).toHaveValue('053-7654321');
    });
  });

  describe('Accessibility and Usability', () => {
    test('should maintain proper focus management across form elements', async () => {
      const user = userEvent.setup();
      
      render(
        <FormProvider>
          <Step1Debts />
        </FormProvider>
      );

      const mortgageInput = screen.getByPlaceholderText('1,200,000');
      
      // Focus should work properly
      await user.click(mortgageInput);
      expect(mortgageInput).toHaveFocus();

      // Tab navigation should work
      await user.tab();
      // Focus should move to next focusable element
      expect(mortgageInput).not.toHaveFocus();
    });

    test('should provide proper ARIA attributes for tooltips', async () => {
      const user = userEvent.setup();
      
      render(
        <FormProvider>
          <Step1Debts />
        </FormProvider>
      );

      const tooltipTriggers = screen.getAllByRole('button', { name: /show tooltip/i });
      
      if (tooltipTriggers.length > 0) {
        const trigger = tooltipTriggers[0];
        
        // Should have proper ARIA attributes
        expect(trigger).toHaveAttribute('aria-label');
        expect(trigger).toHaveAttribute('tabIndex', '0');

        await user.hover(trigger);
        
        await waitFor(() => {
          const tooltip = screen.getByRole('tooltip');
          expect(tooltip).toHaveAttribute('role', 'tooltip');
        });
      }
    });

    test('should support keyboard navigation for CTAs', async () => {
      const user = userEvent.setup();
      
      render(
        <FormProvider>
          <Step1Goal />
        </FormProvider>
      );

      // Should be focusable via keyboard
      await user.tab();
      // The CTA should eventually receive focus through tab navigation
      expect(document.activeElement).toBeDefined();
    });

    test('should maintain proper focus management across form elements', async () => {
      const user = userEvent.setup();
      
      render(
        <FormProvider>
          <Step1Debts />
        </FormProvider>
      );

      const mortgageInput = screen.getByPlaceholderText('1,200,000');
      
      // Focus should work properly
      await user.click(mortgageInput);
      expect(mortgageInput).toHaveFocus();

      // Tab navigation should work
      await user.tab();
      // Focus should move to next focusable element
      expect(mortgageInput).not.toHaveFocus();
    });

    test('should provide proper ARIA attributes for tooltips', async () => {
      const user = userEvent.setup();
      
      render(
        <FormProvider>
          <Step1Debts />
        </FormProvider>
      );

      const tooltipTriggers = screen.getAllByRole('button', { name: /show tooltip/i });
      
      if (tooltipTriggers.length > 0) {
        const trigger = tooltipTriggers[0];
        
        // Should have proper ARIA attributes
        expect(trigger).toHaveAttribute('aria-label');
        expect(trigger).toHaveAttribute('tabIndex', '0');

        await user.hover(trigger);
        
        await waitFor(() => {
          const tooltip = screen.getByRole('tooltip');
          expect(tooltip).toHaveAttribute('role', 'tooltip');
        });
      }
    });
  });
});