/**
 * Property-based tests for header hierarchy maintenance across step components
 * Feature: compact-step-layout
 */

import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import * as fc from 'fast-check';
import { FormProvider } from '../../context/FormContext';
import { Step1Debts } from './Step1Debts';
import { Step2Payments } from './Step2Payments';
import { Step3Assets } from './Step3Assets';
import { Step4Contact } from './Step4Contact';
import { Step5Simulator } from './Step5Simulator';

// Mock the API module to avoid import.meta issues
jest.mock('../../utils/api', () => ({
  trackEvent: jest.fn(() => Promise.resolve()),
  submitData: jest.fn(() => Promise.resolve())
}));

describe('Header Hierarchy Maintenance Property Tests', () => {
  const stepComponents = [
    { component: Step1Debts, name: 'Step1Debts' },
    { component: Step2Payments, name: 'Step2Payments' },
    { component: Step3Assets, name: 'Step3Assets' },
    { component: Step4Contact, name: 'Step4Contact' },
    { component: Step5Simulator, name: 'Step5Simulator' }
  ];

  /**
   * **Feature: compact-step-layout, Property 15: Header hierarchy maintenance**
   * **Validates: Requirements 4.3**
   * 
   * For any step component, when displaying headers, the visual hierarchy should be 
   * maintained while reducing overall header height
   */
  test('should maintain proper header hierarchy while reducing header height', () => {
    fc.assert(
      fc.property(
        // Generate random step component selection
        fc.constantFrom(...stepComponents),
        
        (stepInfo) => {
          const { component: StepComponent, name } = stepInfo;
          
          // Simple test wrapper without complex context updates
          const { container } = render(
            <FormProvider>
              <StepComponent />
            </FormProvider>
          );

          // Check header hierarchy structure
          const h1Elements = container.querySelectorAll('h1');
          const h2Elements = container.querySelectorAll('h2');
          const h3Elements = container.querySelectorAll('h3');
          const h4Elements = container.querySelectorAll('h4');

          // Should not have h1 elements (main header is in App.tsx)
          expect(h1Elements.length).toBe(0);

          // Should have exactly one h2 element as the main step header
          expect(h2Elements.length).toBe(1);

          const mainHeader = h2Elements[0];
          
          // Verify main header has proper styling for hierarchy
          expect(mainHeader).toHaveClass('text-2xl'); // Large text size
          expect(mainHeader).toHaveClass('font-bold'); // Bold weight
          expect(mainHeader).toHaveClass('text-center'); // Centered alignment

          // Verify header has reduced margin/padding for compactness
          const headerStyles = window.getComputedStyle(mainHeader);
          const marginBottom = parseFloat(headerStyles.marginBottom);
          
          // Header should have reasonable but compact spacing (not excessive)
          expect(marginBottom).toBeLessThan(32); // Less than 2rem (32px)
          expect(marginBottom).toBeGreaterThan(0); // But still has some spacing

          // Any h3 elements should be properly styled as subsection headers
          h3Elements.forEach(h3 => {
            expect(h3).toHaveClass('font-semibold'); // Should be semibold, not bold
            expect(h3.textContent?.trim().length).toBeGreaterThan(0);
            
            // h3 should have smaller text than h2
            const h3Styles = window.getComputedStyle(h3);
            const h2Styles = window.getComputedStyle(mainHeader);
            const h3FontSize = parseFloat(h3Styles.fontSize);
            const h2FontSize = parseFloat(h2Styles.fontSize);
            expect(h3FontSize).toBeLessThanOrEqual(h2FontSize);
          });

          // Any h4 elements should be even smaller
          h4Elements.forEach(h4 => {
            expect(h4.textContent?.trim().length).toBeGreaterThan(0);
            
            const h4Styles = window.getComputedStyle(h4);
            const h2Styles = window.getComputedStyle(mainHeader);
            const h4FontSize = parseFloat(h4Styles.fontSize);
            const h2FontSize = parseFloat(h2Styles.fontSize);
            expect(h4FontSize).toBeLessThan(h2FontSize);
          });

          // Verify DOM order maintains hierarchy (h2 before h3 before h4)
          const allElements = Array.from(container.querySelectorAll('*'));
          
          if (h2Elements.length > 0 && h3Elements.length > 0) {
            const h2Position = allElements.indexOf(h2Elements[0]);
            const firstH3Position = allElements.indexOf(h3Elements[0]);
            expect(h2Position).toBeLessThan(firstH3Position);
          }

          if (h3Elements.length > 0 && h4Elements.length > 0) {
            const firstH3Position = allElements.indexOf(h3Elements[0]);
            const firstH4Position = allElements.indexOf(h4Elements[0]);
            expect(firstH3Position).toBeLessThan(firstH4Position);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Header compactness validation test
   * Ensures headers are compact while maintaining readability
   */
  test('should maintain compact header spacing while preserving readability', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...stepComponents),
        
        (stepInfo) => {
          const { component: StepComponent } = stepInfo;
          
          const { container } = render(
            <FormProvider>
              <StepComponent />
            </FormProvider>
          );

          const mainHeader = container.querySelector('h2');
          expect(mainHeader).toBeInTheDocument();

          if (mainHeader) {
            // Check that header has compact but readable spacing
            const headerRect = mainHeader.getBoundingClientRect();
            
            // Header should have reasonable height (not too tall)
            expect(headerRect.height).toBeLessThan(100); // Less than 100px tall
            expect(headerRect.height).toBeGreaterThan(20); // But still readable
            
            // Header text should not be empty
            const headerText = mainHeader.textContent || '';
            expect(headerText.trim().length).toBeGreaterThan(0);
            
            // Header should be visible
            expect(headerRect.width).toBeGreaterThan(0);
            
            // Check for proper text styling that maintains readability
            const styles = window.getComputedStyle(mainHeader);
            const fontSize = parseFloat(styles.fontSize);
            const lineHeight = parseFloat(styles.lineHeight);
            
            // Font size should be large enough to read (at least 18px for text-2xl)
            expect(fontSize).toBeGreaterThanOrEqual(18);
            
            // Line height should provide adequate spacing
            if (!isNaN(lineHeight)) {
              expect(lineHeight).toBeGreaterThanOrEqual(fontSize);
            }
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Visual hierarchy consistency test
   * Ensures consistent visual hierarchy across all step components
   */
  test('should maintain consistent visual hierarchy across all step components', () => {
    const renderedComponents = stepComponents.map(stepInfo => {
      const { component: StepComponent, name } = stepInfo;
      
      const { container } = render(
        <FormProvider>
          <StepComponent />
        </FormProvider>
      );

      return {
        name,
        container,
        mainHeader: container.querySelector('h2'),
        subHeaders: container.querySelectorAll('h3'),
        minorHeaders: container.querySelectorAll('h4')
      };
    });

    // All components should have exactly one main header
    renderedComponents.forEach(({ name, mainHeader }) => {
      expect(mainHeader).toBeInTheDocument();
      expect(mainHeader?.tagName).toBe('H2');
    });

    // All main headers should have consistent styling
    const mainHeaders = renderedComponents.map(r => r.mainHeader).filter(Boolean);
    
    if (mainHeaders.length > 1) {
      const firstHeaderClasses = mainHeaders[0]?.className || '';
      
      // All main headers should have similar base classes
      mainHeaders.forEach((header, index) => {
        expect(header).toHaveClass('text-2xl');
        expect(header).toHaveClass('font-bold');
        expect(header).toHaveClass('text-center');
        
        // Font sizes should be consistent across components
        const styles = window.getComputedStyle(header!);
        const fontSize = parseFloat(styles.fontSize);
        expect(fontSize).toBeGreaterThanOrEqual(18); // Consistent minimum size
      });
    }

    // Verify no component breaks the hierarchy pattern
    renderedComponents.forEach(({ name, container }) => {
      const h1Count = container.querySelectorAll('h1').length;
      const h2Count = container.querySelectorAll('h2').length;
      
      expect(h1Count).toBe(0); // No h1 elements in step components
      expect(h2Count).toBe(1); // Exactly one h2 element per component
    });
  });
});