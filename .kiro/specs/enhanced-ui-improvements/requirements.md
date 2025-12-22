# Requirements Document

## Introduction

This feature addresses several UI/UX improvements for the mortgage calculator application, focusing on navigation behavior, color scheme accuracy, and visual feedback consistency. The improvements ensure users have a smooth experience when navigating between steps and receive accurate visual feedback based on refinancing outcomes.

## Glossary

- **Step Navigation**: Moving between different steps (Step1-Step5) in the mortgage calculator flow
- **Summary Bars**: The visual bar chart comparison showing current mortgage term vs. simulated refinanced term in Step5Simulator
- **Outcome Banner**: The colored information box above the summary bars that displays the refinancing outcome summary
- **Double Positive Outcome**: When both payment decreases AND years decrease (ideal scenario)
- **Mixed Outcome**: When payment increases but years decrease, or payment decreases but years increase
- **Same Term Outcome**: When the mortgage term remains the same but payment changes
- **Page Scroll Position**: The vertical scroll position of the browser window

## Requirements

### Requirement 1

**User Story:** As a user navigating between calculator steps, I want the page to automatically scroll to the top when I move to a new step, so that I can immediately see the step content without manual scrolling.

#### Acceptance Criteria

1. WHEN a user navigates from any step to another step THEN the system SHALL automatically scroll the browser window to the top of the page
2. WHEN the scroll-to-top action occurs THEN the system SHALL use smooth scrolling behavior for better user experience
3. WHEN a user returns to a previously visited step THEN the system SHALL still scroll to the top regardless of previous scroll position
4. THE system SHALL ensure scroll-to-top occurs after the new step content has been rendered
5. THE system SHALL maintain this behavior across all step transitions (Step1 to Step2, Step2 to Step3, etc.)

### Requirement 2

**User Story:** As a user viewing refinancing simulation results, I want the summary bar colors to accurately reflect the specific outcome type, so that I can quickly understand the exact nature of my refinancing scenario.

#### Acceptance Criteria

1. WHEN the outcome shows decreased payment with same mortgage term THEN the system SHALL display green colors for both the simulated bar and outcome text
2. WHEN the outcome shows both decreased payment AND decreased years (double positive) THEN the system SHALL display green colors for the simulated bar, header text, and payment box
3. WHEN the outcome shows increased payment but decreased years OR decreased payment but increased years (mixed outcomes) THEN the system SHALL display blue colors for the simulated bar, header text, and payment box
4. WHEN the outcome shows increased payment with increased years THEN the system SHALL display amber/yellow colors for the simulated bar, header text, and payment box
5. THE system SHALL maintain the current state bar with grey colors regardless of the simulation outcome
6. THE system SHALL apply consistent color schemes across all visual elements (bar gradient, text colors, payment box background and text)

### Requirement 3

**User Story:** As a user viewing Hebrew text in outcome banners, I want specific Hebrew phrases to display in the correct colors, so that the visual feedback matches the outcome type accurately.

#### Acceptance Criteria

1. WHEN the Hebrew text "אותה תקופת משכנתא" appears with payment reduction information THEN the system SHALL display this text in green color scheme
2. WHEN the Hebrew text includes "הפחתה של [amount] ש"ח בחודש" with same term THEN the system SHALL display this text in green color scheme
3. WHEN the Hebrew text describes double positive outcomes THEN the system SHALL display all related text in green color scheme
4. WHEN the Hebrew text describes mixed outcomes (payment increase with year reduction or vice versa) THEN the system SHALL display all related text in blue color scheme
5. THE system SHALL ensure Hebrew text color consistency matches the corresponding summary bar colors