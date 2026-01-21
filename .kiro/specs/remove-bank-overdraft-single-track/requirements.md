# Requirements Document

## Introduction

This feature removes the bank overdraft question and related functionality from the single-track calculator application while preserving all other debt tracking capabilities and maintaining the integrity of the original calculator flow.

## Glossary

- **Single_Track_Calculator**: The focused mortgage payment reduction calculator flow
- **Bank_Overdraft_Field**: The `bankAccountBalance` field that stores negative values for overdrafts
- **Original_Calculator**: The existing multi-track calculator that remains unchanged
- **Step2_Debts**: The SingleTrackStep2Debts.tsx component that collects debt information
- **Form_Context**: The SingleTrackFormContext that manages form state
- **Calculation_Engine**: All calculation logic that processes financial data

## Requirements

### Requirement 1: Remove Bank Overdraft UI Elements

**User Story:** As a user of the single-track calculator, I want the bank overdraft question removed from Step 2, so that the form is simplified and focused on relevant debt types.

#### Acceptance Criteria

1. WHEN a user navigates to Step 2 (Debts) in the single-track calculator, THE System SHALL NOT display the bank overdraft question "האם יש מינוס בבנק?"
2. WHEN a user views Step 2, THE System SHALL continue to display all other debt collection fields (mortgage, other loans)
3. WHEN a user completes Step 2, THE System SHALL allow progression without requiring bank overdraft input
4. WHERE the original calculator is used, THE System SHALL continue to display the bank overdraft question unchanged

### Requirement 2: Update Form State Management

**User Story:** As a developer, I want the form context to exclude bank overdraft tracking, so that the single-track calculator state is clean and consistent.

#### Acceptance Criteria

1. WHEN the single-track form context initializes, THE System SHALL NOT include the `bankAccountBalance` field in the form state
2. WHEN form validation occurs in single-track mode, THE System SHALL NOT validate or require the `bankAccountBalance` field
3. WHEN form data is processed, THE System SHALL handle the absence of `bankAccountBalance` gracefully
4. WHERE the original calculator context is used, THE System SHALL continue to track `bankAccountBalance` unchanged

### Requirement 3: Update Calculation Logic

**User Story:** As a user, I want accurate calculations without bank overdraft data, so that my mortgage payment scenarios remain mathematically correct.

#### Acceptance Criteria

1. WHEN LTV ratio calculations are performed in Step 4 (Assets), THE System SHALL exclude `bankAccountBalance` from asset calculations
2. WHEN regulatory minimum payment calculations are performed in Step 3 (Payments), THE System SHALL exclude `bankAccountBalance` from debt calculations
3. WHEN payment calculations and validation occur in Step 6 (Simulator), THE System SHALL exclude `bankAccountBalance` from all financial computations
4. WHEN any calculation requires debt totals, THE System SHALL compute totals without including `bankAccountBalance`
5. WHERE the original calculator performs calculations, THE System SHALL continue to include `bankAccountBalance` unchanged

### Requirement 4: Maintain Calculation Accuracy

**User Story:** As a user, I want the calculator to provide accurate results, so that my financial planning decisions are based on correct data.

#### Acceptance Criteria

1. WHEN calculations are performed without bank overdraft data, THE System SHALL produce mathematically consistent results
2. WHEN debt-to-income ratios are calculated, THE System SHALL use only the remaining debt types
3. WHEN affordability assessments are made, THE System SHALL account for the absence of overdraft liabilities
4. WHEN payment scenarios are generated, THE System SHALL reflect accurate cash flow without overdraft considerations

### Requirement 5: Preserve Original Calculator Functionality

**User Story:** As a user of the original calculator, I want all existing functionality preserved, so that my experience remains unchanged.

#### Acceptance Criteria

1. WHEN using the original (non-single-track) calculator, THE System SHALL continue to collect bank overdraft information
2. WHEN the original calculator performs calculations, THE System SHALL continue to include `bankAccountBalance` in all computations
3. WHEN switching between calculator modes, THE System SHALL maintain appropriate field visibility for each mode
4. WHERE original calculator components are rendered, THE System SHALL display all original form fields including bank overdraft

### Requirement 6: Maintain Data Integrity

**User Story:** As a system administrator, I want data consistency maintained across the application, so that no broken states or invalid data occur.

#### Acceptance Criteria

1. WHEN single-track forms are submitted without `bankAccountBalance`, THE System SHALL handle the missing field gracefully
2. WHEN data validation occurs, THE System SHALL not flag missing `bankAccountBalance` as an error in single-track mode
3. WHEN form data is serialized or stored, THE System SHALL maintain consistent data structures
4. IF existing single-track sessions have `bankAccountBalance` data, THEN THE System SHALL handle legacy data appropriately