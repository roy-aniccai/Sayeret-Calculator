# Implementation Plan: Remove Bank Overdraft Single Track

## Overview

This implementation plan removes the bank overdraft question and related functionality from the single-track calculator while preserving all other debt tracking capabilities and maintaining the integrity of the original calculator flow. The tasks are organized to ensure incremental progress with proper testing at each step.

## Tasks

- [x] 1. Update SingleTrackFormContext interface and data structure
  - Remove `bankAccountBalance` field from SingleTrackFormData interface
  - Update initial form data to exclude bankAccountBalance
  - Ensure TypeScript compilation passes with interface changes
  - _Requirements: 2.1, 2.4_

- [ ]* 1.1 Write property test for SingleTrackFormContext data structure
  - **Property 3: Single-track form context excludes bankAccountBalance**
  - **Validates: Requirements 2.1**

- [ ]* 1.2 Write property test for original FormContext preservation
  - **Property 4: Original form context includes bankAccountBalance**
  - **Validates: Requirements 2.4**

- [x] 2. Remove bank overdraft UI from SingleTrackStep2Debts component
  - Remove hasBankOverdraft state variable and related handlers
  - Remove handleBankOverdraftChange and handleBankOverdraftToggle functions
  - Remove entire bank overdraft UI section from JSX
  - Update component to only show mortgage and other loans sections
  - _Requirements: 1.1, 1.2_

- [ ]* 2.1 Write property test for single-track UI element removal
  - **Property 1: Single-track UI excludes bank overdraft elements**
  - **Validates: Requirements 1.1, 1.2**

- [ ]* 2.2 Write property test for original calculator UI preservation
  - **Property 2: Original calculator UI includes all debt fields**
  - **Validates: Requirements 1.4, 5.1, 5.4**

- [x] 3. Update form validation logic in SingleTrackStep2Debts
  - Remove any validation logic that references bankAccountBalance
  - Ensure form validation passes without bankAccountBalance field
  - Update validation error handling to ignore missing bankAccountBalance
  - _Requirements: 2.2, 6.2_

- [ ]* 3.1 Write property test for single-track form validation
  - **Property 5: Single-track form validation ignores bankAccountBalance**
  - **Validates: Requirements 2.2, 6.2**

- [ ]* 3.2 Write property test for form progression without bankAccountBalance
  - **Property 6: Single-track form progression works without bankAccountBalance**
  - **Validates: Requirements 1.3**

- [x] 4. Update calculation logic in SingleTrackStep3Payments
  - Remove Math.abs(formData.bankAccountBalance) from totalDebt calculation
  - Update calculateRegulatoryMin function to exclude bankAccountBalance
  - Ensure regulatory minimum payment calculation uses only mortgage and other loans
  - _Requirements: 3.2, 3.4_

- [x] 5. Update calculation logic in SingleTrackStep4Assets
  - Remove Math.abs(formData.bankAccountBalance) from LTV ratio calculation
  - Update totalDebt calculation to exclude bankAccountBalance
  - Ensure LTV ratio display shows correct debt amounts
  - _Requirements: 3.1, 3.4_

- [ ]* 5.1 Write property test for single-track calculation accuracy
  - **Property 7: Single-track calculations exclude bankAccountBalance**
  - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**

- [ ]* 5.2 Write property test for original calculator calculation preservation
  - **Property 8: Original calculator calculations include bankAccountBalance**
  - **Validates: Requirements 3.5, 5.2**

- [x] 6. Create single-track specific calculation utilities
  - Create calculateRefinancedPaymentSingleTrack function that excludes bankAccountBalance
  - Update SingleTrackStep6Simulator to use single-track calculation function
  - Ensure all single-track calculations exclude bankAccountBalance from debt totals
  - _Requirements: 3.3, 3.4_

- [ ]* 6.1 Write property test for calculation mathematical consistency
  - **Property 10: Calculation accuracy is maintained without bankAccountBalance**
  - **Validates: Requirements 4.1, 4.2, 4.3, 4.4**

- [x] 7. Add data handling safeguards for missing bankAccountBalance
  - Add defensive programming to handle undefined bankAccountBalance
  - Update form data processing to gracefully handle missing fields
  - Add legacy data compatibility for existing sessions with bankAccountBalance
  - _Requirements: 2.3, 6.1, 6.3, 6.4_

- [ ]* 7.1 Write property test for graceful data handling
  - **Property 9: Single-track data handling gracefully manages missing bankAccountBalance**
  - **Validates: Requirements 2.3, 6.1, 6.3**

- [ ]* 7.2 Write property test for legacy data compatibility
  - **Property 11: Legacy data with bankAccountBalance is handled gracefully**
  - **Validates: Requirements 6.4**

- [x] 8. Checkpoint - Ensure all tests pass and functionality works
  - Run all existing tests to ensure no regressions
  - Test single-track calculator flow end-to-end without bank overdraft
  - Verify original calculator remains unchanged
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Update TypeScript types and interfaces
  - Ensure all TypeScript interfaces reflect the bankAccountBalance removal
  - Fix any type errors related to missing bankAccountBalance field
  - Update component prop types if necessary
  - _Requirements: 2.1, 6.3_

- [x] 10. Final integration and verification
  - Test complete single-track calculator flow from Step 1 to Step 6
  - Verify calculations are accurate without bank overdraft data
  - Ensure original calculator functionality is preserved
  - Test edge cases and error scenarios
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.1, 5.2_

- [x] 11. Final checkpoint - Comprehensive testing
  - Ensure all property tests pass with 100+ iterations each
  - Verify no console errors or warnings in browser
  - Test both single-track and original calculator flows
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties with comprehensive input coverage
- Unit tests validate specific examples, edge cases, and integration points
- The implementation maintains strict separation between single-track and original calculator functionality
- All changes are isolated to single-track components to prevent affecting the original calculator