# Requirements Document

## Introduction

This feature enhances the mortgage refinancing simulator's visual feedback by making the summary bar colors dynamic based on the refinancing outcome. Currently, the "current state" bar is grey and the "simulated state" bar is always green. This enhancement will keep the current state bar grey but change the simulated state bar color to match the banner color logic: green for reduced years (positive outcome) and yellow/amber for increased years (trade-off scenario).

## Glossary

- **Summary Bars**: The visual bar chart comparison showing current mortgage term vs. simulated refinanced term on the results page (Step5Simulator component)
- **Current State Bar**: The left bar representing the user's existing mortgage term length
- **Simulated State Bar**: The right bar representing the projected mortgage term after refinancing
- **Banner**: The colored information box above the summary bars that displays the refinancing outcome summary
- **Term Years**: The total length of the mortgage in years

## Requirements

### Requirement 1

**User Story:** As a user viewing refinancing simulation results, I want the summary bar colors to reflect the outcome type, so that I can quickly understand whether the refinancing reduces or extends my mortgage term.

#### Acceptance Criteria

1. WHEN the simulated term is shorter than the current term THEN the system SHALL display the simulated state bar with green background gradient and green text colors (matching the positive outcome banner styling)
2. WHEN the simulated term is longer than the current term THEN the system SHALL display the simulated state bar with yellow/amber background gradient and yellow/amber text colors (matching the extended term banner styling)
3. WHEN the simulated term equals the current term THEN the system SHALL display the simulated state bar with green background gradient and green text colors (default positive state)
4. THE system SHALL maintain the current state bar with grey background gradient and grey text colors regardless of the simulation outcome
5. THE system SHALL apply the same color gradient pattern (from lighter to darker shade) for all bar background colors to maintain visual consistency
6. THE system SHALL update both the bar fill color and the associated text colors (header text and payment box text) to match the corresponding banner color scheme
