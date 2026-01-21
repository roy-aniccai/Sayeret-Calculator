# Requirements Document

## Introduction

This feature enhances the single-track calculator by improving the contact step (Step 5) user experience and implementing A/B testing variants for the simulator step (Step 6). The improvements focus on removing distracting savings messages from the contact step and providing clearer scenario-based options in the simulator to improve conversion rates.

## Glossary

- **Contact_Step**: Step 5 of the single-track calculator where users enter contact information
- **Simulator_Step**: Step 6 of the single-track calculator where users see payment reduction scenarios
- **Savings_Messages**: Messages displaying potential savings amounts and LTV ratios
- **Marketing_Message**: Encouraging text to motivate valid phone number entry
- **Scenario_Cards**: Visual cards displaying different payment reduction options
- **A/B_Testing**: Method to test two different versions of the simulator step
- **Monthly_Payment_Reduction**: The amount by which monthly mortgage payments can be decreased
- **Minimum_Scenario**: Shortest period where customer has at least 500 NIS savings
- **Maximum_Scenario**: Longest possible period for payment reduction
- **Middle_Scenario**: Period between minimum and maximum scenarios

## Requirements

### Requirement 1: Contact Step Message Cleanup

**User Story:** As a user filling out the contact step, I want to see only relevant messaging about phone number usage, so that I'm not distracted by savings information that belongs in later steps.

#### Acceptance Criteria

1. WHEN a user reaches the contact step, THE Contact_Step SHALL NOT display any savings amount messages
2. WHEN a user views the contact step, THE Contact_Step SHALL NOT display any LTV ratio messages  
3. WHEN a user views the contact step, THE Contact_Step SHALL NOT display any savings confirmation checkboxes
4. THE Contact_Step SHALL maintain all existing contact form functionality without savings-related content

### Requirement 2: Marketing Message for Phone Number Entry

**User Story:** As a user entering my phone number, I want to understand why it's needed, so that I'm motivated to provide a valid Israeli phone number.

#### Acceptance Criteria

1. WHEN a user views the phone number input field, THE Contact_Step SHALL display a marketing message explaining phone number usage
2. THE Marketing_Message SHALL be in Hebrew and mention WhatsApp report delivery OR smart bot usage
3. THE Marketing_Message SHALL encourage entry of a valid Israeli phone number
4. THE Marketing_Message SHALL be prominently displayed near the phone number input field

### Requirement 3: A/B Testing Infrastructure for Simulator Step

**User Story:** As a product manager, I want to test different simulator interfaces, so that I can determine which version provides better conversion rates.

#### Acceptance Criteria

1. THE Simulator_Step SHALL support two distinct versions (A and B) controlled by configuration
2. WHEN version A is selected, THE Simulator_Step SHALL display the current slider-based interface
3. WHEN version B is selected, THE Simulator_Step SHALL display the new scenario cards interface
4. THE A/B_Testing configuration SHALL be easily switchable via feature flag or component prop
5. THE Simulator_Step SHALL maintain identical calculation logic regardless of version

### Requirement 4: Version B Scenario Cards Implementation

**User Story:** As a user viewing payment reduction options, I want to see clear scenario cards with specific savings amounts and periods, so that I can easily understand my options without adjusting sliders.

#### Acceptance Criteria

1. WHEN version B is active, THE Simulator_Step SHALL display exactly three scenario cards
2. THE Minimum_Scenario card SHALL show the shortest period where customer has at least 500 NIS savings
3. THE Maximum_Scenario card SHALL show the maximum possible years for payment spread
4. THE Middle_Scenario card SHALL show a period between minimum and maximum scenarios
5. WHEN displaying each scenario, THE Simulator_Step SHALL show monthly payment reduction amount and period duration in Hebrew
6. THE scenario cards SHALL each be contained in separate visual card components

### Requirement 5: Special Case Handling for Insufficient Savings

**User Story:** As a user with limited savings potential, I want to see appropriate options based on my situation, so that I understand what's available to me.

#### Acceptance Criteria

1. WHEN monthly payment reduction is less than 1000 NIS below current payment, THE Simulator_Step SHALL display a single option with maximum possible period
2. WHEN no mortgage savings are possible, THE Simulator_Step SHALL display an explanation message in Hebrew stating "אין אפשרות לחסוך"
3. WHEN no mortgage savings are possible, THE Simulator_Step SHALL offer mortgage insurance savings option up to 50,000 NIS
4. WHEN no mortgage savings are possible, THE Simulator_Step SHALL display a contact button with text "אשמח שנציג יחזור אלי"
5. WHEN mortgage savings are possible, THE Simulator_Step SHALL display the existing "לשיחה עם המומחים" button

### Requirement 6: Calculation Logic Preservation

**User Story:** As a user of either simulator version, I want to receive accurate calculations, so that the payment reduction scenarios are mathematically correct regardless of interface version.

#### Acceptance Criteria

1. THE Simulator_Step SHALL use identical calculation algorithms for both versions A and B
2. WHEN calculating scenarios, THE Simulator_Step SHALL preserve all existing mortgage calculation logic
3. THE Simulator_Step SHALL ensure scenario calculations match the current slider-based calculations
4. WHEN switching between versions, THE Simulator_Step SHALL produce consistent results for the same input data

### Requirement 7: Hebrew Text Display

**User Story:** As a Hebrew-speaking user, I want all new text to be properly displayed in Hebrew, so that I can understand the interface in my native language.

#### Acceptance Criteria

1. THE Marketing_Message SHALL be displayed in Hebrew with proper RTL text direction
2. THE scenario card messages SHALL be displayed in Hebrew with proper formatting
3. THE special case messages SHALL be displayed in Hebrew with correct grammar
4. THE button text SHALL be in Hebrew and properly aligned for RTL layout