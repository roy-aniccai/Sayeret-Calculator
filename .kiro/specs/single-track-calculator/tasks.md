# Implementation Plan: Single Track Calculator

## Overview

This implementation plan creates a completely separate single-track calculator application that operates independently from the original calculator. The approach prioritizes simplicity by creating two distinct applications rather than trying to share components or logic. This ensures clean separation and easier maintenance.

## Tasks

- [ ] 1. Create independent single-track application structure
  - [x] 1.1 Create SingleTrackApp.tsx as main application component
    - Build independent React application for single-track calculator
    - Implement basic app structure with header, progress bar, and content area
    - Add campaign parameter parsing from URL
    - _Requirements: 4.2, 5.1_

  - [x] 1.2 Create SingleTrackFormContext.tsx for independent state management
    - Implement simplified form context specific to monthly reduction track
    - Add campaign tracking and UTM parameter handling
    - Create form data interface tailored to single-track flow
    - _Requirements: 1.1, 5.2_

  - [ ]* 1.3 Write property test for single-track application initialization
    - **Property 1: Single Track Navigation Enforcement**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4**

- [ ] 2. Create single-track landing page (Step 1)
  - [x] 2.1 Create SingleTrackStep1Landing.tsx component
    - Build campaign-optimized landing page with value proposition
    - Implement "reduce monthly installments" focused messaging
    - Add call-to-action button to proceed to debt collection
    - _Requirements: 2.1, 2.2_

  - [ ]* 2.2 Write property test for landing page content
    - **Property 2: Campaign-Optimized Landing Page**
    - **Validates: Requirements 2.1, 2.2**

  - [x] 2.3 Implement landing page navigation to next step
    - Handle user interaction to proceed to debt collection step
    - Ensure smooth transition within single-track flow
    - _Requirements: 2.3_

- [ ] 3. Create single-track step components (Steps 2-6)
  - [x] 3.1 Create SingleTrackStep2Debts.tsx component
    - Copy and adapt existing Step1Debts component for single-track use
    - Remove any track-specific logic and simplify for monthly reduction focus
    - Integrate with SingleTrackFormContext
    - _Requirements: 1.2, 4.2_

  - [x] 3.2 Create SingleTrackStep3Payments.tsx component
    - Copy and adapt existing Step2Payments component for single-track use
    - Focus on monthly reduction optimization
    - Integrate with SingleTrackFormContext
    - _Requirements: 1.2, 4.2_

  - [x] 3.3 Create SingleTrackStep4Assets.tsx component
    - Copy and adapt existing Step3Assets component for single-track use
    - Simplify for single-track flow
    - Integrate with SingleTrackFormContext
    - _Requirements: 1.2, 4.2_

  - [x] 3.4 Create SingleTrackStep5Contact.tsx component
    - Copy and adapt existing Step4Contact component for single-track use
    - Integrate with SingleTrackFormContext
    - _Requirements: 1.2, 4.2_

  - [x] 3.5 Create SingleTrackStep6Simulator.tsx component
    - Copy and adapt existing Step5Simulator component for single-track use
    - Focus on monthly payment reduction simulation
    - Integrate with SingleTrackFormContext
    - _Requirements: 1.2, 4.2_

- [x] 4. Checkpoint - Ensure all step components work independently
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement single-track navigation and restart behavior
  - [x] 5.1 Add step navigation logic to SingleTrackApp
    - Implement nextStep and prevStep functions
    - Add step rendering logic for all 6 steps
    - Ensure navigation stays within single-track boundaries
    - _Requirements: 1.3, 2.3_

  - [x] 5.2 Implement restart behavior for single-track calculator
    - Add resetForm function that returns to landing page (step 1)
    - Preserve campaign data during restart
    - Clear form data while maintaining campaign context
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ]* 5.3 Write property test for restart behavior
    - **Property 4: Single Track Restart Behavior**
    - **Validates: Requirements 3.1, 3.2, 3.3**

- [ ] 6. Add campaign integration and analytics
  - [x] 6.1 Implement URL parameter parsing for campaign data
    - Parse UTM parameters from campaign URLs
    - Extract campaign ID from URL path
    - Store campaign context in form state
    - _Requirements: 5.1, 5.4_

  - [x] 6.2 Add conversion tracking for single-track flow
    - Implement campaign-specific analytics events
    - Track step progression and form completion
    - Add conversion event when user completes flow
    - _Requirements: 5.3_

  - [ ]* 6.3 Write property test for campaign integration
    - **Property 6: Campaign Integration**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4**

- [ ] 7. Create routing and deployment setup
  - [x] 7.1 Set up routing for single-track calculator
    - Create separate HTML entry point for single-track app
    - Configure build system to generate both applications
    - Set up URL routing for /reduce-payments path
    - _Requirements: 4.2, 5.1_

  - [x] 7.2 Ensure original calculator remains completely unchanged
    - Verify no modifications to existing App.tsx or components
    - Test that original calculator functionality is preserved
    - Confirm complete separation between applications
    - _Requirements: 4.1, 4.3, 4.5_

  - [ ]* 7.3 Write property test for product isolation
    - **Property 5: Product Isolation**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5**

- [ ] 8. Error handling and fallback implementation
  - [x] 8.1 Add error handling for missing campaign data
    - Handle missing or invalid campaign parameters gracefully
    - Provide default single-track experience when campaign data is unavailable
    - Add fallback behavior for malformed URLs
    - _Requirements: 5.2_

  - [ ]* 8.2 Write unit tests for error handling scenarios
    - Test missing campaign ID handling
    - Test invalid UTM parameter scenarios
    - Test analytics failure recovery
    - _Requirements: 5.2, 5.4_

- [ ] 9. Final integration and testing
  - [x] 9.1 Test complete single-track user journey
    - Verify landing page to completion flow works smoothly
    - Test campaign parameter preservation throughout flow
    - Confirm conversion tracking fires correctly
    - _Requirements: 2.3, 5.2, 5.3_

  - [ ]* 9.2 Write integration tests for complete flow
    - Test end-to-end single-track calculator journey
    - Verify campaign data flows through all steps
    - Test restart behavior maintains campaign context
    - _Requirements: 2.3, 3.1, 5.2_

- [x] 10. Final checkpoint - Ensure both calculators work independently
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The implementation creates two completely separate applications
- No shared components or logic between original and single-track calculators
- Original calculator remains completely unchanged
- Single-track calculator operates independently with its own components and context