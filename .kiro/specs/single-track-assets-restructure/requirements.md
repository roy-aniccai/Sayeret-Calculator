# Requirements Document

## Introduction

This feature restructures the Single-Track Assets Step (Step 4) in the monthly payment reduction calculator flow to improve user experience by simplifying the interface, moving the age field from Step 6 to Step 4, and removing LTV ratio display while maintaining calculation functionality.

## Glossary

- **Single_Track_Calculator**: The monthly payment reduction calculator application
- **Assets_Step**: Step 4 in the single-track calculator flow (SingleTrackStep4Assets.tsx)
- **Simulator_Step**: Step 6 in the single-track calculator flow (SingleTrackStep6Simulator.tsx)
- **LTV_Ratio**: Loan-to-Value ratio calculation used internally for mortgage calculations
- **Age_Field**: User input field for collecting borrower age information
- **Property_Value_Field**: Input field for estimated current property value

## Requirements

### Requirement 1: Step Title Update

**User Story:** As a user navigating the single-track calculator, I want the assets step to have a clear and appropriate title, so that I understand what information is being collected.

#### Acceptance Criteria

1. WHEN a user reaches Step 4 of the single-track calculator, THE Assets_Step SHALL display "פרטים נוספים" (Additional Details) as the page title
2. THE Assets_Step SHALL NOT display "שווי נכסים" (Asset Value) as the title
3. WHEN the step title is rendered, THE Single_Track_Calculator SHALL use Hebrew text formatting

### Requirement 2: LTV Ratio Display Removal

**User Story:** As a user completing the assets step, I want a simplified interface without technical mortgage terms, so that the process feels less complex and intimidating.

#### Acceptance Criteria

1. THE Assets_Step SHALL NOT display any LTV ratio values to the user
2. THE Assets_Step SHALL NOT display any LTV ratio labels or explanatory text
3. THE Assets_Step SHALL NOT contain any UI components specifically for showing LTV calculations
4. WHEN LTV calculations are performed, THE Single_Track_Calculator SHALL continue using them internally for mortgage calculations
5. THE Assets_Step SHALL maintain all existing calculation logic that depends on LTV ratios

### Requirement 3: Age Field Migration

**User Story:** As a user progressing through the calculator, I want to provide my age information earlier in the flow, so that the process feels more streamlined and logical.

#### Acceptance Criteria

1. THE Assets_Step SHALL include an age input field below the property value field
2. WHEN a user enters age information in Step 4, THE Single_Track_Calculator SHALL store it in the form context
3. THE Simulator_Step SHALL NOT display an age input field
4. THE Simulator_Step SHALL NOT collect age information from the user
5. WHEN a user reaches Step 6, THE Single_Track_Calculator SHALL use the age value collected in Step 4
6. THE Age_Field SHALL accept numeric input representing the borrower's age in years
7. WHEN age validation is performed, THE Single_Track_Calculator SHALL ensure the age is within reasonable bounds (18-120 years)

### Requirement 4: Form Data Continuity

**User Story:** As a user completing the calculator flow, I want my entered information to be preserved correctly when fields are moved between steps, so that I don't lose data or encounter calculation errors.

#### Acceptance Criteria

1. WHEN age data is entered in Step 4, THE Single_Track_Calculator SHALL persist it through the entire form flow
2. WHEN a user navigates backward from Step 6 to Step 4, THE Age_Field SHALL display the previously entered value
3. WHEN a user navigates forward from Step 4 to Step 6, THE Simulator_Step SHALL have access to the age value for calculations
4. THE Single_Track_Calculator SHALL maintain all existing form validation rules for the age field
5. WHEN form data is reset or cleared, THE Age_Field SHALL be included in the reset operation

### Requirement 5: UI Layout and Positioning

**User Story:** As a user interacting with the assets step, I want the form fields to be logically organized and easy to understand, so that I can complete the step efficiently.

#### Acceptance Criteria

1. WHEN the Assets_Step is rendered, THE Property_Value_Field SHALL appear first in the form layout
2. WHEN the Assets_Step is rendered, THE Age_Field SHALL appear immediately below the Property_Value_Field
3. THE Assets_Step SHALL maintain consistent styling and spacing with other form fields
4. THE Age_Field SHALL use the same input component styling as other numeric fields in the application
5. WHEN field labels are displayed, THE Single_Track_Calculator SHALL use Hebrew text for all field labels and placeholders

### Requirement 6: Calculation Integration

**User Story:** As a system administrator, I want all mortgage calculations to continue working correctly after the UI changes, so that users receive accurate financial projections.

#### Acceptance Criteria

1. WHEN mortgage calculations are performed, THE Single_Track_Calculator SHALL use the age value from Step 4
2. WHEN LTV calculations are performed, THE Single_Track_Calculator SHALL continue using the same calculation logic
3. THE Single_Track_Calculator SHALL produce identical calculation results before and after the UI restructuring
4. WHEN calculation errors occur, THE Single_Track_Calculator SHALL display appropriate error messages
5. THE Single_Track_Calculator SHALL validate that all required fields (including age) are completed before allowing progression to calculation steps