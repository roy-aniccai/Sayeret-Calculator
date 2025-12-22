# Requirements Document

## Introduction

This feature addresses a Hebrew text formatting issue in the mortgage calculator's Step 5 Simulator component. Currently, when displaying the "ideal situation" with double savings, the payment reduction amount shows a redundant minus sign since the Hebrew text already indicates "reduction" (הפחתת).

## Glossary

- **Step5Simulator**: The mortgage calculator component that displays simulation results and recommendations
- **Payment_Reduction_Display**: The UI element showing monthly payment reduction amounts in Hebrew
- **Hebrew_Text_Formatting**: The display format for Hebrew numerical values with contextual text

## Requirements

### Requirement 1

**User Story:** As a Hebrew-speaking user viewing the mortgage calculator results, I want the payment reduction text to be clear and not redundant, so that the information is presented professionally without confusing double-negative indicators.

#### Acceptance Criteria

1. WHEN the system displays the "ideal situation" message with double savings THEN the Hebrew_Text_Formatting SHALL show payment reduction amounts without minus signs since the text already indicates reduction
2. WHEN displaying payment reduction amounts in Hebrew THEN the Payment_Reduction_Display SHALL use absolute values with the contextual Hebrew text "הפחתת תשלום ב-" (payment reduction by)
3. WHEN formatting numerical values for Hebrew reduction text THEN the system SHALL ensure the number formatting function returns positive values for display
4. WHEN the ideal situation component renders THEN the system SHALL maintain consistent Hebrew text formatting across all reduction-related displays
5. WHERE Hebrew text already indicates the nature of the change (reduction/savings) THEN the system SHALL avoid redundant mathematical signs in the displayed numbers