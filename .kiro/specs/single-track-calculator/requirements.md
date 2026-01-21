# Requirements Document

## Introduction

The single-track-calculator feature creates a campaign-optimized version of the mortgage calculator that bypasses track selection and provides a focused, single-purpose user experience. This version is specifically designed for Facebook campaigns that direct users into the "reduce monthly installments" track, eliminating choice paralysis and optimizing conversion rates.

## Glossary

- **Single_Track_Calculator**: The campaign-optimized calculator version that supports only the "reduce monthly installments" track
- **Original_Calculator**: The existing calculator that supports multiple tracks with user choice
- **Track_Selection_Modal**: The UI component that allows users to choose between different calculator tracks
- **Reduce_Monthly_Installments_Track**: The specific calculator flow focused on reducing monthly mortgage payments
- **Landing_Page_Step**: The first step of the single-track flow that acts as an entry point for campaign users
- **Campaign_User**: A user who arrives via Facebook campaign links
- **Restart_Flow**: The action of returning to the beginning of the calculator process

## Requirements

### Requirement 1: Single Track Navigation

**User Story:** As a campaign user, I want to be directed straight into the reduce monthly installments flow, so that I can focus on my specific goal without distractions.

#### Acceptance Criteria

1. WHEN a user accesses the single-track calculator, THE Single_Track_Calculator SHALL bypass the Track_Selection_Modal entirely
2. WHEN the single-track calculator loads, THE Single_Track_Calculator SHALL navigate users directly to the first step of the Reduce_Monthly_Installments_Track
3. THE Single_Track_Calculator SHALL prevent users from accessing or switching to other calculator tracks
4. WHEN a user attempts to navigate to other tracks, THE Single_Track_Calculator SHALL maintain them within the Reduce_Monthly_Installments_Track

### Requirement 2: Landing Page Experience

**User Story:** As a campaign user, I want the first step to serve as a clear landing page, so that I understand what the calculator will help me achieve.

#### Acceptance Criteria

1. WHEN a user enters the single-track calculator, THE Landing_Page_Step SHALL display content optimized for campaign users
2. THE Landing_Page_Step SHALL clearly communicate the "reduce monthly installments" value proposition
3. WHEN users interact with the Landing_Page_Step, THE Single_Track_Calculator SHALL guide them through the predefined flow sequence

### Requirement 3: Restart Behavior

**User Story:** As a campaign user, I want to return to the beginning of my specific flow when I restart, so that I can maintain focus on my original goal.

#### Acceptance Criteria

1. WHEN a user triggers a restart action, THE Single_Track_Calculator SHALL return them to the Landing_Page_Step
2. WHEN restarting, THE Single_Track_Calculator SHALL maintain the single-track context and prevent access to track selection
3. THE Single_Track_Calculator SHALL preserve the campaign-optimized user experience throughout restart cycles

### Requirement 4: Product Separation

**User Story:** As a product manager, I want to maintain two distinct calculator products, so that I can optimize each for different user acquisition channels.

#### Acceptance Criteria

1. THE Original_Calculator SHALL continue to support multiple tracks with user choice between them
2. THE Single_Track_Calculator SHALL operate as a separate product instance focused solely on the Reduce_Monthly_Installments_Track
3. WHEN users access the Original_Calculator, THE system SHALL provide the full track selection experience
4. WHEN users access the Single_Track_Calculator, THE system SHALL provide the focused single-track experience
5. THE system SHALL maintain clear separation between the two calculator products without cross-contamination

### Requirement 5: Campaign Integration

**User Story:** As a marketing manager, I want seamless integration with Facebook campaigns, so that I can drive users to a conversion-optimized experience.

#### Acceptance Criteria

1. WHEN Campaign_Users arrive via Facebook campaign links, THE system SHALL direct them to the Single_Track_Calculator
2. THE Single_Track_Calculator SHALL maintain campaign context throughout the user session
3. WHEN users complete the single-track flow, THE system SHALL provide appropriate conversion tracking capabilities
4. THE Single_Track_Calculator SHALL support URL parameters for campaign tracking and analytics