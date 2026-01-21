# Implementation Plan: Single-Track Assets Step Restructure

## Overview

This implementation restructures the Single-Track Assets Step (Step 4) by changing the title to "פרטים נוספים" (Additional Details), removing LTV ratio display, and moving the age field from Step 6 to Step 4. All changes maintain existing calculation logic while improving user experience.

## Tasks

- [x] 1. Update step header configuration for new title
  - Modify stepHeaderConfig.ts to change Step 4 title from "שווי נכסים" to "פרטים נוספים"
  - Update both mainHeaderTitle and stepTitle for step 4
  - _Requirements: 1.1, 1.2_

- [x] 2. Restructure SingleTrackStep4Assets component
  - [x] 2.1 Remove LTV ratio display section
    - Remove the entire LTV ratio display div and all related UI elements
    - Remove LTV calculation variables and helper functions from component
    - _Requirements: 2.1, 2.2, 2.3_
  
  - [ ]* 2.2 Write unit tests for LTV display removal
    - Test that LTV-related text and components are not rendered
    - Test that LTV calculations still work internally
    - _Requirements: 2.1, 2.2, 2.3_
  
  - [x] 2.3 Add age input field below property value field
    - Create age input field using existing Input component
    - Position field between property value and navigation buttons
    - Add Hebrew label "גיל" and placeholder "35"
    - Implement numeric input validation (18-120 years)
    - _Requirements: 3.1, 3.6, 5.1, 5.2_
  
  - [ ]* 2.4 Write property test for age input acceptance
    - **Property 1: Age Input Acceptance**
    - **Validates: Requirements 3.2, 3.6**
  
  - [ ]* 2.5 Write property test for age validation boundaries
    - **Property 2: Age Validation Boundaries**
    - **Validates: Requirements 3.7**

- [x] 3. Update SingleTrackStep6Simulator component
  - [x] 3.1 Remove age input section from simulator
    - Remove the age input header div and all age input UI elements
    - Remove handleAgeChange function and age-related event handlers
    - _Requirements: 3.3, 3.4_
  
  - [x] 3.2 Update simulator to use age from form context
    - Ensure all age-dependent calculations use formData.age from Step 4
    - Update validation messages to assume age is already provided
    - Remove age-related conditional rendering logic
    - _Requirements: 3.5, 6.1_
  
  - [ ]* 3.3 Write unit tests for age input removal
    - Test that age input elements are not rendered in Step 6
    - Test that age collection functionality is removed
    - _Requirements: 3.3, 3.4_
  
  - [ ]* 3.4 Write property test for age data flow
    - **Property 4: Age Data Flow to Calculations**
    - **Validates: Requirements 3.5, 6.1**

- [x] 4. Implement form validation updates
  - [x] 4.1 Add age validation to Step 4 navigation
    - Update Step 4 validation to require both property value and age
    - Add age-specific error messages in Hebrew
    - Prevent navigation to Step 5 without valid age
    - _Requirements: 6.5_
  
  - [x] 4.2 Update form reset functionality
    - Ensure age field is included in form reset operations
    - Test that age field clears when form is reset
    - _Requirements: 4.5_
  
  - [ ]* 4.3 Write property test for age data persistence
    - **Property 3: Age Data Persistence**
    - **Validates: Requirements 4.1, 4.2**
  
  - [ ]* 4.4 Write property test for form reset completeness
    - **Property 6: Form Reset Completeness**
    - **Validates: Requirements 4.5**
  
  - [ ]* 4.5 Write property test for required field validation
    - **Property 7: Required Field Validation**
    - **Validates: Requirements 6.5**

- [x] 5. Verify calculation consistency
  - [x] 5.1 Test LTV calculation preservation
    - Verify internal LTV calculations produce identical results
    - Test with various combinations of property value and debt amounts
    - Ensure calculations work without UI display
    - _Requirements: 2.4, 2.5, 6.2, 6.3_
  
  - [ ]* 5.2 Write property test for LTV calculation preservation
    - **Property 5: LTV Calculation Preservation**
    - **Validates: Requirements 2.4, 2.5, 6.2, 6.3**

- [x] 6. Integration testing and validation
  - [x] 6.1 Test complete user flow with age migration
    - Test navigation from Step 4 to Step 6 with age data
    - Verify age data is used correctly in Step 6 calculations
    - Test backward navigation preserves age data
    - _Requirements: 3.5, 4.1, 4.2, 4.3_
  
  - [ ]* 6.2 Write integration tests for step-to-step data flow
    - Test age data flow from Step 4 to Step 6
    - Test backward navigation data preservation
    - Test error handling and recovery scenarios
    - _Requirements: 4.1, 4.2, 4.3_

- [x] 7. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- LTV calculations continue working internally despite UI removal
- Age field migration maintains all existing validation rules
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Hebrew text is used throughout for labels and error messages