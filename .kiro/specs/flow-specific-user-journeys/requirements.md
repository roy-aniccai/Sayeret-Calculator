# Requirements Document

## Introduction

This feature will create unique, tailored user flows for each entry point in the mortgage calculator application. Currently, users select between "monthly payment reduction" and "term shortening" goals, but the subsequent steps and user experience remain largely identical. This enhancement will create distinct user journeys that optimize the experience, questions, and calculations for each specific goal.

## Glossary

- **Flow**: A complete user journey from entry point selection to final results
- **Entry Point**: The initial goal selection (monthly reduction vs. term shortening)
- **Track**: The selected user path (TrackType.MONTHLY_REDUCTION or TrackType.SHORTEN_TERM)
- **Step Configuration**: The specific questions, validations, and UI elements shown for each track
- **Flow Context**: The data and logic that varies based on the selected track
- **Mortgage Calculator**: The existing application that helps users analyze mortgage refinancing options

## Requirements

### Requirement 1

**User Story:** As a user seeking term shortening, I want a flow optimized for aggressive payoff strategies, so that I can explore options to minimize total interest paid.

#### Acceptance Criteria

1. WHEN a user selects term shortening track THEN the system SHALL display steps optimized for term reduction analysis
2. WHEN displaying payment input fields THEN the system SHALL emphasize additional payment capacity and aggressive payoff options
3. WHEN calculating results THEN the system SHALL prioritize showing term reduction and total interest savings
4. WHEN showing simulator options THEN the system SHALL focus on term shortening scenarios with higher payment options
5. WHERE term shortening is the goal, THE system SHALL validate that proposed terms meet borrower age and regulatory limits

### Requirement 2

**User Story:** As a developer, I want flow-specific configuration and logic, so that changes to one flow don't impact the other flow's behavior.

#### Acceptance Criteria

1. WHEN implementing flow logic THEN the system SHALL use track-specific configuration objects for each flow type
2. WHEN rendering UI components THEN the system SHALL apply track-specific styling, labels, and validation rules
3. WHEN calculating mortgage scenarios THEN the system SHALL use track-appropriate calculation priorities and constraints
4. WHEN updating one flow's configuration THEN the system SHALL ensure other flows remain unaffected
5. WHERE flow-specific data exists, THE system SHALL maintain clear separation between track configurations

### Requirement 3

**User Story:** As a user, I want consistent navigation and progress tracking, so that I understand my position in the flow regardless of which track I selected.

#### Acceptance Criteria

1. WHEN progressing through steps THEN the system SHALL maintain consistent step numbering and progress indicators
2. WHEN displaying step content THEN the system SHALL show track-appropriate titles and descriptions
3. WHEN navigating between steps THEN the system SHALL preserve track context throughout the entire flow
4. WHEN resetting the form THEN the system SHALL return to the initial track selection step
5. WHERE step validation occurs, THE system SHALL apply track-specific validation rules consistently

### Requirement 4

**User Story:** As a user, I want track-specific guidance and messaging, so that I receive advice relevant to my chosen goal throughout the process.

#### Acceptance Criteria

1. WHEN displaying help text THEN the system SHALL show track-specific tooltips and explanations
2. WHEN showing calculation results THEN the system SHALL present track-appropriate success metrics and warnings
3. WHEN displaying error messages THEN the system SHALL provide track-specific guidance for resolution
4. WHEN presenting final recommendations THEN the system SHALL emphasize outcomes aligned with the selected track goal
5. WHERE user guidance is needed, THE system SHALL provide context-aware assistance based on the active track

### Requirement 5

**User Story:** As a developer, I want specific implementation patterns for flow differentiation, so that I can systematically modify each flow's behavior with clear separation of concerns.

#### Acceptance Criteria

1. WHEN implementing step components THEN the system SHALL use track-aware conditional rendering for different UI elements
2. WHEN defining validation rules THEN the system SHALL implement track-specific validation functions that can be easily modified
3. WHEN creating calculation logic THEN the system SHALL separate track-specific calculation methods from shared utilities
4. WHEN styling components THEN the system SHALL use track-based CSS classes and styling variations
5. WHERE flow differences exist, THE system SHALL implement them through track-specific configuration objects and conditional logic patterns

### Requirement 6

**User Story:** As a developer, I want a systematic approach to modify each step, so that I can implement flow-specific changes incrementally without breaking existing functionality.

#### Acceptance Criteria

1. WHEN modifying Step1Goal THEN the system SHALL maintain the existing track selection but add track-specific descriptions and styling
2. WHEN updating Step1Debts THEN the system SHALL customize field labels and tooltips based on the selected track
3. WHEN enhancing Step2Payments THEN the system SHALL show different payment input strategies and slider ranges per track
4. WHEN improving Step3Assets THEN the system SHALL emphasize different asset considerations based on track goals
5. WHERE Step5Simulator exists, THE system SHALL present track-specific calculation scenarios and result interpretations

### Requirement 7

**User Story:** As a developer, I want clear patterns for track-specific modifications, so that future enhancements follow consistent implementation approaches.

#### Acceptance Criteria

1. WHEN accessing track information THEN the system SHALL provide track context through the existing FormContext
2. WHEN implementing conditional logic THEN the system SHALL use consistent track checking patterns across all components
3. WHEN creating track-specific content THEN the system SHALL organize content in track-based configuration objects
4. WHEN styling track differences THEN the system SHALL use systematic CSS class naming conventions
5. WHERE shared logic exists, THE system SHALL maintain common functionality while allowing track-specific overrides