# Implementation Plan

- [x] 1. Optimize main layout structure





  - Remove or minimize the fixed blue header in App.tsx
  - Integrate step identification into content area
  - Maintain progress bar in compact form
  - _Requirements: 1.1, 1.2_

- [ ] 1.1 Write property test for step header replacement
  - **Property 1: Step header replacement**
  - **Validates: Requirements 1.1**

- [x] 2. Create enhanced tooltip system




- [x] 2.1 Implement intelligent tooltip positioning



  - Add viewport boundary detection logic
  - Implement automatic position adjustment (top/bottom/left/right)
  - Create fallback positioning for edge cases
  - _Requirements: 2.1, 2.4_

- [ ] 2.2 Write property test for tooltip boundary containment
  - **Property 5: Tooltip boundary containment**
  - **Validates: Requirements 2.1, 2.4**

- [x] 2.3 Enhance tooltip typography and wrapping


  - Increase tooltip font size for better readability
  - Implement text wrapping for long content
  - Ensure proper line height and spacing
  - _Requirements: 2.2, 2.3_

- [ ] 2.4 Write property test for tooltip readability enhancement
  - **Property 6: Tooltip readability enhancement**
  - **Validates: Requirements 2.2**

- [ ] 2.5 Write property test for tooltip text wrapping
  - **Property 7: Tooltip text wrapping**
  - **Validates: Requirements 2.3**

- [x] 2.6 Implement accessibility compliance for tooltips


  - Ensure proper contrast ratios
  - Add appropriate ARIA attributes
  - Implement keyboard navigation support
  - _Requirements: 2.5_

- [ ] 2.7 Write property test for tooltip accessibility compliance
  - **Property 8: Tooltip accessibility compliance**
  - **Validates: Requirements 2.5**

- [ ] 3. Update step components for compact layout
- [x] 3.1 Modify Step1Debts component



  - Remove fixed header text, keep step name only
  - Replace explanation boxes with integrated CTAs
  - Optimize vertical spacing for viewport fit
  - _Requirements: 1.1, 1.5, 3.2_

- [x] 3.2 Modify Step2Payments component





  - Remove fixed header text, keep step name only
  - Replace explanation boxes with integrated CTAs
  - Optimize vertical spacing for viewport fit
  - _Requirements: 1.1, 1.5, 3.2_

- [x] 3.3 Modify Step3Assets component





  - Remove fixed header text, keep step name only
  - Replace explanation boxes with integrated CTAs
  - Optimize vertical spacing for viewport fit
  - _Requirements: 1.1, 1.5, 3.2_

- [x] 3.4 Modify Step4Contact component





  - Remove fixed header text, keep step name only
  - Replace explanation boxes with integrated CTAs
  - Optimize vertical spacing for viewport fit
  - _Requirements: 1.1, 1.5, 3.2_

- [x] 3.5 Modify Step5Simulator component





  - Remove fixed header text, keep step name only
  - Replace explanation boxes with integrated CTAs
  - Optimize vertical spacing for viewport fit
  - _Requirements: 1.1, 1.5, 3.2_

- [ ] 3.6 Write property test for explanation box replacement
  - **Property 4: Explanation box replacement**
  - **Validates: Requirements 1.5**

- [ ] 3.7 Write property test for CTA content integration
  - **Property 10: CTA content integration**
  - **Validates: Requirements 3.2**

- [x] 4. Implement CTA visibility optimization




- [x] 4.1 Create CTA positioning utilities


  - Implement viewport visibility detection
  - Add automatic positioning adjustments
  - Create scroll-free CTA placement logic
  - _Requirements: 3.1, 3.3_

- [ ] 4.2 Write property test for CTA viewport visibility
  - **Property 9: CTA viewport visibility**
  - **Validates: Requirements 3.1, 3.3**

- [x] 4.3 Implement CTA interaction persistence


  - Ensure CTAs remain visible during form interactions
  - Add dynamic positioning updates on content changes
  - Implement sticky CTA behavior where appropriate
  - _Requirements: 3.4_

- [ ] 4.4 Write property test for CTA interaction persistence
  - **Property 11: CTA interaction persistence**
  - **Validates: Requirements 3.4**

- [x] 4.5 Implement CTA prioritization system


  - Create visual hierarchy for multiple CTAs
  - Implement primary vs secondary CTA styling
  - Ensure primary CTA gets optimal positioning
  - _Requirements: 3.5_

- [ ] 4.6 Write property test for CTA prioritization
  - **Property 12: CTA prioritization**
  - **Validates: Requirements 3.5**

- [-] 5. Ensure layout consistency across steps


- [x] 5.1 Create shared layout utilities



  - Implement consistent spacing patterns
  - Create reusable compact layout components
  - Add viewport constraint handling
  - _Requirements: 1.3, 1.2, 1.4_

- [ ] 5.2 Write property test for viewport content optimization
  - **Property 2: Viewport content optimization**
  - **Validates: Requirements 1.2, 1.4**

- [ ] 5.3 Write property test for consistent compact layout
  - **Property 3: Consistent compact layout**
  - **Validates: Requirements 1.3**

- [x] 6. Update InputWithTooltip component




- [x] 6.1 Integrate enhanced tooltip system

  - Replace existing tooltip implementation
  - Apply new positioning and typography enhancements
  - Ensure backward compatibility with existing usage
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 7. Checkpoint - Ensure all tests pass




  - Ensure all tests pass, ask the user if questions arise.

- [-] 8. Final integration and testing


- [x] 8.1 Test complete user flow






  - Verify all steps work with new compact layout
  - Test tooltip functionality across all form elements
  - Validate CTA visibility and functionality
  - _Requirements: All_

- [x] 8.2 Write integration tests for complete user flow





  - Test navigation between all steps
  - Verify form data persistence with new layout
  - Test responsive behavior across viewport sizes
  - _Requirements: All_

- [x] 9. Final Checkpoint - Ensure all tests pass




  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Implement header restructuring system





- [x] 10.1 Create step header mapping configuration


  - Define StepHeaderMapping interface and configuration object
  - Map each step number to main header title, step title, and back navigation text
  - Implement step-to-header lookup logic
  - _Requirements: 4.1, 4.4, 4.5_

- [x] 10.2 Write property test for step-specific header display


  - **Property 13: Step-specific header display**
  - **Validates: Requirements 4.1**


- [x] 10.3 Update App.tsx for dynamic header content

  - Modify the fixed blue header to display step-specific titles
  - Implement dynamic header content based on current step
  - Maintain progress bar functionality
  - _Requirements: 4.1, 4.3_


- [x] 10.4 Write property test for specific step header mapping

  - **Property 16: Specific step header mapping**
  - **Validates: Requirements 4.4, 4.5**

- [-] 11. Update step components for promoted subtitles



- [x] 11.1 Modify Step1Debts for subtitle promotion


  - Replace current h2 header with promoted subtitle content
  - Update header hierarchy while maintaining visual design
  - _Requirements: 4.2, 4.3_

- [x] 11.2 Modify Step2Payments for subtitle promotion


  - Replace current h2 header with promoted subtitle content
  - Update header hierarchy while maintaining visual design
  - _Requirements: 4.2, 4.3_

- [x] 11.3 Modify Step3Assets for subtitle promotion


  - Replace current h2 header with promoted subtitle content
  - Update header hierarchy while maintaining visual design
  - _Requirements: 4.2, 4.3_

- [x] 11.4 Modify Step4Contact for subtitle promotion


  - Replace current h2 header with promoted subtitle content
  - Update header hierarchy while maintaining visual design
  - _Requirements: 4.2, 4.3_

- [x] 11.5 Modify Step5Simulator for subtitle promotion


  - Replace current h2 header with promoted subtitle content
  - Update header hierarchy while maintaining visual design
  - _Requirements: 4.2, 4.3_

- [x] 11.6 Write property test for subtitle promotion



  - **Property 14: Subtitle promotion**
  - **Validates: Requirements 4.2**


- [ ] 11.7 Write property test for header hierarchy maintenance
  - **Property 15: Header hierarchy maintenance**
  - **Validates: Requirements 4.3**

- [-] 12. Implement contextual back navigation




- [x] 12.1 Create navigation context utilities

  - Implement NavigationState interface and logic
  - Create step-to-previous-step mapping
  - Add contextual navigation text generation
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_


- [ ] 12.2 Write property test for contextual back navigation text

  - **Property 17: Contextual back navigation text**
  - **Validates: Requirements 5.1**

- [-] 12.3 Update step components with contextual back navigation


  - Replace generic "חזור אחורה" with step-specific text
  - Implement contextual back navigation in all step components
  - Ensure navigation functionality remains intact
  - _Requirements: 5.2, 5.3, 5.4, 5.5_

- [ ] 12.4 Write property test for step-specific back navigation mapping
  - **Property 18: Step-specific back navigation mapping**
  - **Validates: Requirements 5.2, 5.3, 5.4, 5.5**

- [ ] 13. Integration testing for new features
- [ ] 13.1 Test header restructuring across all steps
  - Verify correct main header titles appear for each step
  - Test promoted subtitles display correctly
  - Validate header hierarchy and visual consistency
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 13.2 Test contextual navigation flow
  - Verify back navigation text is contextual for each step
  - Test navigation functionality with new text
  - Validate user flow understanding with contextual cues
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 14. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.