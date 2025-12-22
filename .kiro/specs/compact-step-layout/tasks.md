# Implementation Plan

- [x] 1. Optimize main layout structure





  - Remove or minimize the fixed blue header in App.tsx
  - Integrate step identification into content area
  - Maintain progress bar in compact form
  - _Requirements: 1.1, 1.2_

- [ ]* 1.1 Write property test for step header replacement
  - **Property 1: Step header replacement**
  - **Validates: Requirements 1.1**

- [x] 2. Create enhanced tooltip system




- [x] 2.1 Implement intelligent tooltip positioning



  - Add viewport boundary detection logic
  - Implement automatic position adjustment (top/bottom/left/right)
  - Create fallback positioning for edge cases
  - _Requirements: 2.1, 2.4_

- [ ]* 2.2 Write property test for tooltip boundary containment
  - **Property 5: Tooltip boundary containment**
  - **Validates: Requirements 2.1, 2.4**

- [x] 2.3 Enhance tooltip typography and wrapping


  - Increase tooltip font size for better readability
  - Implement text wrapping for long content
  - Ensure proper line height and spacing
  - _Requirements: 2.2, 2.3_

- [ ]* 2.4 Write property test for tooltip readability enhancement
  - **Property 6: Tooltip readability enhancement**
  - **Validates: Requirements 2.2**

- [ ]* 2.5 Write property test for tooltip text wrapping
  - **Property 7: Tooltip text wrapping**
  - **Validates: Requirements 2.3**

- [x] 2.6 Implement accessibility compliance for tooltips


  - Ensure proper contrast ratios
  - Add appropriate ARIA attributes
  - Implement keyboard navigation support
  - _Requirements: 2.5_

- [ ]* 2.7 Write property test for tooltip accessibility compliance
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

- [ ]* 3.6 Write property test for explanation box replacement
  - **Property 4: Explanation box replacement**
  - **Validates: Requirements 1.5**

- [ ]* 3.7 Write property test for CTA content integration
  - **Property 10: CTA content integration**
  - **Validates: Requirements 3.2**

- [x] 4. Implement CTA visibility optimization




- [x] 4.1 Create CTA positioning utilities


  - Implement viewport visibility detection
  - Add automatic positioning adjustments
  - Create scroll-free CTA placement logic
  - _Requirements: 3.1, 3.3_

- [ ]* 4.2 Write property test for CTA viewport visibility
  - **Property 9: CTA viewport visibility**
  - **Validates: Requirements 3.1, 3.3**

- [x] 4.3 Implement CTA interaction persistence


  - Ensure CTAs remain visible during form interactions
  - Add dynamic positioning updates on content changes
  - Implement sticky CTA behavior where appropriate
  - _Requirements: 3.4_

- [ ]* 4.4 Write property test for CTA interaction persistence
  - **Property 11: CTA interaction persistence**
  - **Validates: Requirements 3.4**

- [x] 4.5 Implement CTA prioritization system


  - Create visual hierarchy for multiple CTAs
  - Implement primary vs secondary CTA styling
  - Ensure primary CTA gets optimal positioning
  - _Requirements: 3.5_

- [ ]* 4.6 Write property test for CTA prioritization
  - **Property 12: CTA prioritization**
  - **Validates: Requirements 3.5**

- [-] 5. Ensure layout consistency across steps


- [x] 5.1 Create shared layout utilities



  - Implement consistent spacing patterns
  - Create reusable compact layout components
  - Add viewport constraint handling
  - _Requirements: 1.3, 1.2, 1.4_

- [ ]* 5.2 Write property test for viewport content optimization
  - **Property 2: Viewport content optimization**
  - **Validates: Requirements 1.2, 1.4**

- [ ]* 5.3 Write property test for consistent compact layout
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