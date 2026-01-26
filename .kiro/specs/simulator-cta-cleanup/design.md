# Simulator CTA Cleanup - Design Document

## Architecture Overview

The simulator CTA cleanup focuses on the `SingleTrackStep6Simulator` component, specifically the scenario rendering logic for insufficient-savings cases.

## Current State Analysis

### Problem Areas Identified

1. **Insufficient-Savings Scenario (`scenarios.specialCase === 'insufficient-savings'`)**
   - Contains embedded CTA button within the scenario card
   - Creates confusion with duplicate call-to-action options
   - Inconsistent with other scenarios

2. **CTA Button Hierarchy Issues**
   - Multiple CTA buttons with similar purposes
   - Unclear user flow for contacting experts
   - Inconsistent button placement across scenarios

## Design Solution

### 1. Clean Scenario Card Structure

```typescript
// Insufficient-savings scenario should contain ONLY:
{scenarios.specialCase === 'insufficient-savings' && (
  <div className="scenario-card">
    {/* Scenario information */}
    <div className="scenario-info">
      {/* Best option display */}
      {/* Insurance savings offer */}
      {/* Explanatory text */}
    </div>
    {/* NO CTA BUTTONS HERE */}
  </div>
)}
```

### 2. Global CTA Structure

```typescript
// Single global CTA section at bottom:
<div className="global-cta-section">
  <Button onClick={handleContactExpert}>
    לשיחה עם המומחים
  </Button>
  <button onClick={handleTryAnother}>
    בדוק תרחיש אחר
  </button>
</div>
```

## Component Structure

### SingleTrackStep6Simulator Component

```
SingleTrackStep6Simulator
├── Header Section
├── Scenario Cards Container
│   ├── Special Cases (no embedded CTAs)
│   │   ├── no-mortgage-savings
│   │   └── insufficient-savings (CLEAN)
│   └── Normal Scenario Cards
│       ├── Minimum Scenario
│       ├── Middle Scenario
│       └── Maximum Scenario
└── Global CTA Section (SINGLE SOURCE OF TRUTH)
    ├── Primary: "לשיחה עם המומחים"
    └── Secondary: "בדוק תרחיש אחר"
```

## Implementation Strategy

### Phase 1: Remove Embedded CTAs
1. Locate all embedded CTA buttons in scenario cards
2. Remove them while preserving scenario information
3. Ensure no functionality is lost

### Phase 2: Verify Global CTAs
1. Confirm global CTA buttons work correctly
2. Ensure proper event tracking
3. Verify ContactOptionsPage integration

### Phase 3: Clean Up and Document
1. Add clear comments preventing future CTA duplication
2. Update any related tests
3. Document the single-CTA pattern

## Code Changes Required

### File: `components/steps/SingleTrackStep6Simulator.tsx`

#### Areas to Modify:

1. **Insufficient-Savings Scenario Block**
   - Remove any `<Button>` or `<button>` elements
   - Keep only informational content
   - Add preventive comments

2. **Global CTA Section**
   - Ensure it's the single source of truth for all actions
   - Verify proper styling and positioning
   - Confirm event tracking works

#### Specific Patterns to Remove:
- Any button with `onClick={handleContactExpert}` inside scenario cards
- Any button with text containing "אשמח", "נציג", "יחזור", "אלי"
- Any embedded CTA that duplicates global functionality

## Testing Strategy

### Manual Testing Scenarios:
1. **Insufficient-Savings Flow**
   - Enter data that results in < 1000 NIS savings
   - Verify no embedded CTA in scenario card
   - Verify global CTAs work correctly

2. **Normal Scenarios Flow**
   - Enter data that results in normal scenarios
   - Verify scenario cards are clean
   - Verify global CTAs work correctly

3. **No-Savings Flow**
   - Enter data that results in no savings
   - Verify clean display
   - Verify global CTAs work correctly

### Automated Testing:
- Update existing tests to verify CTA button count
- Add tests to prevent regression of embedded CTAs
- Verify ContactOptionsPage integration

## Success Metrics

1. **User Experience**
   - Single clear path to contact experts
   - No confusion from duplicate buttons
   - Consistent behavior across all scenarios

2. **Code Quality**
   - Clean, maintainable code structure
   - Clear separation of concerns
   - Preventive documentation

3. **Functionality**
   - All existing functionality preserved
   - Proper event tracking maintained
   - ContactOptionsPage integration intact

## Risk Mitigation

### Potential Risks:
1. **Breaking existing functionality** - Mitigated by thorough testing
2. **Missing edge cases** - Mitigated by comprehensive scenario testing
3. **User confusion during transition** - Mitigated by clean, intuitive design

### Rollback Plan:
- Git commit structure allows easy rollback
- Feature flags could be implemented if needed
- Monitoring user behavior post-deployment