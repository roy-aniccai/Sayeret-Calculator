# Simulator CTA Cleanup - Requirements

## Overview
Clean up duplicate and unwanted CTA buttons in the mortgage simulator, specifically in the insufficient-savings scenario (less than 1000 NIS savings).

## Problem Statement
Currently, in the reduce-payments simulator when savings are less than 1000 NIS, there is an unwanted CTA button "אשמח שנציג יחזור אלי" appearing inside the scenario card, in addition to the correct global CTA buttons at the bottom.

## User Stories

### US-1: Clean Insufficient-Savings Scenario Display
**As a** user viewing the simulator with less than 1000 NIS savings  
**I want** to see only the appropriate CTA buttons  
**So that** I'm not confused by duplicate or conflicting call-to-action options

### US-2: Maintain Correct Global CTAs
**As a** user in any simulator scenario  
**I want** to see the correct global CTA buttons at the bottom  
**So that** I can proceed with contacting experts or trying another scenario

## Acceptance Criteria

### AC-1: Remove Unwanted CTA from Insufficient-Savings Card
**GIVEN** I am in the simulator with insufficient savings (< 1000 NIS)  
**WHEN** I view the "האפשרות הטובה ביותר עבורך" card  
**THEN** I should NOT see the "אשמח שנציג יחזור אלי" button inside the card  
**AND** I should only see the scenario information and insurance savings offer

### AC-2: Preserve Global CTA Buttons
**GIVEN** I am in any simulator scenario  
**WHEN** I scroll to the bottom of the page  
**THEN** I should see the "לשיחה עם המומחים" button  
**AND** I should see the "בדוק תרחיש אחר" button  
**AND** these should be the only CTA buttons available

### AC-3: Consistent CTA Behavior Across Scenarios
**GIVEN** I am in any simulator scenario (normal, insufficient-savings, no-savings)  
**WHEN** I want to contact experts  
**THEN** I should use the same global "לשיחה עם המומחים" button  
**AND** there should be no scenario-specific CTA buttons

## Technical Requirements

### TR-1: Code Location
- Primary file: `components/steps/SingleTrackStep6Simulator.tsx`
- Focus on the `insufficient-savings` scenario handling
- Ensure no duplicate CTA buttons in any scenario

### TR-2: Button Hierarchy
1. **Global CTAs (bottom of page):**
   - "לשיחה עם המומחים" - Primary CTA
   - "בדוק תרחיש אחר" - Secondary CTA

2. **Scenario Cards:**
   - Should contain ONLY scenario information
   - Should NOT contain any CTA buttons
   - Should rely on global CTAs for user actions

### TR-3: Specific Scenarios to Address
- `insufficient-savings`: Remove any embedded CTA buttons
- `no-mortgage-savings`: Ensure no duplicate CTAs
- `hasValidScenarios`: Ensure clean scenario cards without embedded CTAs

## Definition of Done
- [ ] No "אשמח שנציג יחזור אלי" button appears in any scenario card
- [ ] Global "לשיחה עם המומחים" button works correctly
- [ ] Global "בדוק תרחיש אחר" button works correctly
- [ ] All simulator scenarios display consistently
- [ ] Code is clean and well-documented
- [ ] Changes are tested and deployed to production

## Priority
**High** - This affects user experience and creates confusion in the conversion flow.