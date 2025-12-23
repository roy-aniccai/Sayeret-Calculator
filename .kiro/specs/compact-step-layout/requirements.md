# Requirements Document

## Introduction

This feature focuses on improving the user experience of the mortgage calculator's step-by-step form by creating a more compact, single-page layout that eliminates unnecessary scrolling and improves readability of interactive elements.

## Glossary

- **Step Component**: Individual form sections (Step1Debts, Step2Payments, etc.) that guide users through the mortgage calculation process
- **Fixed Header**: The current white text on blue background header that appears at the top of each step
- **Step Name**: The secondary header that identifies the specific step (e.g., "Debts", "Payments", "Assets")
- **Tooltip**: Interactive help text that appears when users hover over or interact with form elements
- **Explanation Box**: Current informational content sections within each step
- **CTA (Call-to-Action)**: Action buttons or prompts that guide users to the next step or action
- **Mortgage Calculator**: The multi-step form application for calculating mortgage scenarios

## Requirements

### Requirement 1

**User Story:** As a user filling out the mortgage calculator, I want a more compact step layout, so that I can complete the form without excessive scrolling.

#### Acceptance Criteria

1. WHEN a user views any step component THEN the system SHALL display only the step name as the primary header without the fixed header text
2. WHEN a step loads THEN the system SHALL present all essential content within the initial viewport to minimize scrolling
3. WHEN a user navigates between steps THEN the system SHALL maintain consistent compact layout across all step components
4. WHEN content exceeds viewport height THEN the system SHALL prioritize form fields and CTAs over explanatory content
5. WHERE space optimization is needed THE system SHALL replace explanation boxes with integrated CTAs

### Requirement 2

**User Story:** As a user interacting with form elements, I want improved tooltip visibility and readability, so that I can easily understand form requirements without strain.

#### Acceptance Criteria

1. WHEN a user triggers a tooltip THEN the system SHALL display the tooltip completely within the page boundaries
2. WHEN a tooltip contains text THEN the system SHALL render it with increased font size for better readability
3. WHEN tooltip text exceeds single line length THEN the system SHALL wrap the text across multiple lines
4. WHEN tooltips appear THEN the system SHALL ensure they do not get cut off by viewport edges
5. WHILE tooltips are visible THE system SHALL maintain proper contrast and spacing for accessibility

### Requirement 3

**User Story:** As a user progressing through the mortgage calculator, I want clear action prompts visible without scrolling, so that I know how to proceed at each step.

#### Acceptance Criteria

1. WHEN a user completes form fields in a step THEN the system SHALL display the CTA prominently within the viewport
2. WHEN explanation content is present THEN the system SHALL integrate or replace it with actionable CTAs
3. WHEN a step loads THEN the system SHALL ensure CTAs are visible without requiring scrolling
4. WHEN users interact with the form THEN the system SHALL maintain CTA visibility throughout the interaction
5. WHERE multiple actions are available THE system SHALL prioritize the primary CTA for visibility

### Requirement 4

**User Story:** As a user navigating through the mortgage calculator steps, I want a restructured header hierarchy that makes better use of space, so that I can see more relevant content without scrolling.

#### Acceptance Criteria

1. WHEN a user views any step (except the home step) THEN the system SHALL display the step-specific title in the main header instead of the generic "בדיקת דופק למשכנתא"
2. WHEN a step loads THEN the system SHALL promote the step subtitle to become the primary step title within the content area
3. WHEN displaying step headers THEN the system SHALL maintain visual hierarchy while reducing overall header height
4. WHEN a user is on step 2 (debts) THEN the system SHALL show "מצב חובות נוכחי" in the main header and "נבדוק את המצב הכספי הנוכחי" as the step title
5. WHEN a user is on step 3 (payments) THEN the system SHALL show "החזרים חודשיים נוכחיים" in the main header and "כמה אתה משלם היום?" as the step title

### Requirement 5

**User Story:** As a user navigating between steps in the mortgage calculator, I want contextual back navigation that clearly indicates where I'm going, so that I understand the navigation flow.

#### Acceptance Criteria

1. WHEN a user views the back navigation button THEN the system SHALL display text that indicates the specific previous step they will return to
2. WHEN a user is on step 2 (debts) THEN the system SHALL show "חזור לבחירת מטרה" as the back button text
3. WHEN a user is on step 3 (payments) THEN the system SHALL show "חזור למצב חובות" as the back button text
4. WHEN a user is on step 4 (assets) THEN the system SHALL show "חזור להחזרים" as the back button text
5. WHEN a user is on step 5 (contact) THEN the system SHALL show "חזור לשווי נכסים" as the back button text