# Implementation Plan: Contact Step Improvements and A/B Testing

## Overview

This implementation plan converts the approved design into discrete coding tasks for improving the contact step (Step 5) and implementing A/B testing variants for the simulator step (Step 6). The tasks focus on removing distracting savings messages, adding marketing messages, and creating scenario-based simulator options.

## Tasks

- [x] 1. Update Contact Step (Step 5) - Remove Savings Content
  - [x] 1.1 Remove savings-related UI elements from SingleTrackStep5Contact.tsx
    - Remove insurance savings banner component
    - Remove LTV ratio messages and displays
    - Remove savings confirmation checkbox
    - Preserve all core contact form functionality
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ]* 1.2 Write property test for savings content removal
    - **Property 1: Contact Step Savings Content Removal**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4**

- [x] 2. Add Marketing Message to Contact Step
  - [x] 2.1 Create MarketingMessage component
    - Create reusable component for marketing messages
    - Support Hebrew text with RTL direction
    - Include variants for WhatsApp report and smart bot messaging
    - Position component near phone input field
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 2.2 Integrate marketing message into SingleTrackStep5Contact.tsx
    - Add marketing message component to contact step
    - Position prominently near phone number input
    - Configure with appropriate Hebrew text variant
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [ ]* 2.3 Write property test for marketing message display
    - **Property 2: Marketing Message Display and Content**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4**

- [x] 3. Checkpoint - Contact Step Changes Complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement A/B Testing Infrastructure
  - [x] 4.1 Create URL parameter detection utility
    - Create function to detect simulatorVersion URL parameter
    - Support A/B version detection from query string
    - Provide fallback to default version
    - _Requirements: 3.1, 3.4_

  - [x] 4.2 Update SingleTrackStep6Simulator.tsx for version support
    - Add version prop to component interface
    - Implement conditional rendering based on version
    - Maintain existing slider interface for version A
    - _Requirements: 3.1, 3.2, 3.4_

  - [ ]* 4.3 Write property test for A/B testing version support
    - **Property 3: A/B Testing Version Support**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**

- [x] 5. Implement Version B - Scenario Cards Interface
  - [x] 5.1 Create ScenarioCard component
    - Create reusable scenario card component
    - Display payment reduction amount and period in Hebrew
    - Support different scenario types (minimum, maximum, middle)
    - Include proper RTL text formatting
    - _Requirements: 4.5, 4.6_

  - [x] 5.2 Create scenario calculation logic
    - Implement minimum scenario calculation (shortest period with 500+ NIS savings)
    - Implement maximum scenario calculation (longest possible period)
    - Implement middle scenario calculation (between min and max)
    - Preserve existing mortgage calculation logic
    - _Requirements: 4.2, 4.3, 4.4, 6.2_

  - [ ]* 5.3 Write property test for scenario calculation logic
    - **Property 5: Scenario Calculation Logic**
    - **Validates: Requirements 4.2, 4.3, 4.4**

  - [x] 5.4 Integrate scenario cards into version B interface
    - Replace slider with three scenario cards for version B
    - Ensure exactly three cards are displayed
    - Maintain calculation consistency with version A
    - _Requirements: 4.1, 4.6, 6.1_

  - [ ]* 5.5 Write property test for scenario cards structure
    - **Property 4: Scenario Cards Structure and Display**
    - **Validates: Requirements 4.1, 4.5, 4.6**

- [x] 6. Implement Special Case Handling
  - [x] 6.1 Add insufficient savings handling
    - Display single option when reduction is less than 1000 NIS
    - Show "אין אפשרות לחסוך" message for no mortgage savings
    - Offer insurance savings option up to 50,000 NIS
    - Display appropriate contact buttons with Hebrew text
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]* 6.2 Write property test for special case handling
    - **Property 6: Special Case Handling**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**

- [x] 7. Ensure Calculation Consistency
  - [x] 7.1 Validate calculation consistency across versions
    - Ensure identical results for same input data across versions A and B
    - Preserve all existing mortgage calculation algorithms
    - Maintain consistency when switching between versions
    - _Requirements: 6.1, 6.3, 6.4_

  - [ ]* 7.2 Write property test for calculation consistency
    - **Property 7: Calculation Consistency Across Versions**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4**

- [x] 8. Hebrew Text and RTL Support
  - [x] 8.1 Implement proper Hebrew text display
    - Ensure all new text elements use proper RTL direction
    - Validate Hebrew grammar in scenario messages
    - Align buttons properly for Hebrew layout
    - Test Hebrew text rendering across components
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ]* 8.2 Write property test for Hebrew text display
    - **Property 8: Hebrew Text Display and RTL Support**
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4**

- [x] 9. Integration and Wiring
  - [x] 9.1 Wire A/B testing into SingleTrackApp
    - Integrate URL parameter detection into main app
    - Pass version prop to simulator step
    - Ensure proper fallback behavior
    - _Requirements: 3.1, 3.4_

  - [x] 9.2 Update parent components for new contact step
    - Ensure contact step changes integrate properly
    - Verify form data flow remains intact
    - Test navigation between steps
    - _Requirements: 1.4, 2.1_

  - [ ]* 9.3 Write integration tests for complete flow
    - Test end-to-end user flow with both versions
    - Verify contact step to simulator step transition
    - Test URL parameter switching functionality

- [x] 10. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties using @fast-check/jest
- Unit tests validate specific examples and edge cases
- All Hebrew text must be tested for proper RTL display and grammar
- A/B testing should be easily switchable via URL parameters for manual testing