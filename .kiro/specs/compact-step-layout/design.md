# Design Document: Compact Step Layout

## Overview

This design transforms the mortgage calculator's multi-step form from a scrollable layout to a compact, single-viewport experience. The solution removes redundant header elements, optimizes tooltip visibility and readability, and integrates call-to-action elements to eliminate unnecessary scrolling while maintaining all essential functionality.

## Architecture

The design follows a component-based architecture with three main areas of modification:

1. **Layout Optimization**: Modify the main App component and step components to remove fixed headers and optimize vertical space usage
2. **Tooltip Enhancement**: Upgrade the tooltip system with intelligent positioning, improved typography, and text wrapping capabilities  
3. **CTA Integration**: Replace explanation boxes with integrated call-to-action elements positioned for optimal visibility

## Components and Interfaces

### Modified Components

**App.tsx**
- Modify the fixed blue header to display step-specific titles instead of the generic "בדיקת דופק למשכנתא"
- Implement dynamic header content based on current step
- Maintain progress bar functionality in the compact form
- Add step-to-header mapping logic

**Step Components (Step1Debts, Step2Payments, etc.)**
- Replace the current `<h2>` header structure with promoted subtitle content
- Remove or integrate explanation boxes with CTA elements
- Implement contextual back navigation with step-specific text
- Ensure all essential content fits within viewport constraints
- Update header hierarchy to use promoted subtitles as main step titles

**InputWithTooltip Component**
- Enhance tooltip positioning logic to prevent viewport overflow
- Implement text wrapping for long tooltip content
- Increase font size for better readability
- Add intelligent positioning that adjusts based on available space

### New Interfaces

```typescript
interface TooltipConfig {
  text: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  maxWidth: number;
  fontSize: 'sm' | 'base' | 'lg';
  allowWrap: boolean;
}

interface CompactLayoutProps {
  stepName: string;
  children: React.ReactNode;
  primaryCTA: React.ReactNode;
  secondaryCTA?: React.ReactNode;
}

interface StepHeaderConfig {
  stepNumber: number;
  mainHeaderTitle: string;
  stepTitle: string;
  backNavigationText: string;
}

interface NavigationContext {
  currentStep: number;
  previousStepName: string;
  nextStepName: string;
}
```

## Data Models

### Tooltip Positioning Model
```typescript
interface TooltipPosition {
  x: number;
  y: number;
  adjustedPosition: 'top' | 'bottom' | 'left' | 'right';
  withinBounds: boolean;
}
```

### Layout Constraints Model
```typescript
interface ViewportConstraints {
  height: number;
  width: number;
  availableHeight: number; // After header/footer
  contentMaxHeight: number;
}
```

### Step Header Mapping Model
```typescript
interface StepHeaderMapping {
  [stepNumber: number]: {
    mainHeaderTitle: string;
    stepTitle: string;
    backNavigationText: string;
  };
}

// Example mapping
const stepHeaderConfig: StepHeaderMapping = {
  1: {
    mainHeaderTitle: "בדיקת דופק למשכנתא", // Home step keeps original
    stepTitle: "בחירת מטרה",
    backNavigationText: ""
  },
  2: {
    mainHeaderTitle: "מצב חובות נוכחי",
    stepTitle: "נבדוק את המצב הכספי הנוכחי", 
    backNavigationText: "חזור לבחירת מטרה"
  },
  3: {
    mainHeaderTitle: "החזרים חודשיים נוכחיים",
    stepTitle: "כמה אתה משלם היום?",
    backNavigationText: "חזור למצב חובות"
  },
  4: {
    mainHeaderTitle: "שווי נכסים",
    stepTitle: "נבדוק את שווי הנכסים",
    backNavigationText: "חזור להחזרים"
  },
  5: {
    mainHeaderTitle: "פרטי קשר",
    stepTitle: "נשלח לך את התוצאות",
    backNavigationText: "חזור לשווי נכסים"
  }
};
```

### Navigation State Model
```typescript
interface NavigationState {
  currentStep: number;
  canGoBack: boolean;
  canGoForward: boolean;
  backDestination: number;
  forwardDestination: number;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After reviewing all properties identified in the prework, several can be consolidated:
- Properties 2.1 and 2.4 both address tooltip boundary detection and can be combined
- Properties 3.1 and 3.3 both ensure CTA visibility and can be unified
- Properties 1.2 and 1.4 both address viewport content optimization and can be merged

### Layout Properties

**Property 1: Step header replacement**
*For any* step component, when rendered, the component should display only the step-specific name as the primary header without any fixed header text
**Validates: Requirements 1.1**

**Property 2: Viewport content optimization**
*For any* step component and viewport size, when the step loads, all essential content (form fields and CTAs) should be positioned within the initial viewport boundaries
**Validates: Requirements 1.2, 1.4**

**Property 3: Consistent compact layout**
*For any* navigation between steps, each step component should maintain the same compact layout structure and spacing patterns
**Validates: Requirements 1.3**

**Property 4: Explanation box replacement**
*For any* step component that previously contained explanation boxes, those elements should be replaced with or integrated into actionable CTA elements
**Validates: Requirements 1.5**

### Tooltip Properties

**Property 5: Tooltip boundary containment**
*For any* tooltip trigger and viewport size, when a tooltip is displayed, it should be completely contained within the page boundaries without being cut off
**Validates: Requirements 2.1, 2.4**

**Property 6: Tooltip readability enhancement**
*For any* tooltip, when displayed, the text should render with increased font size compared to the previous implementation
**Validates: Requirements 2.2**

**Property 7: Tooltip text wrapping**
*For any* tooltip with text content exceeding single line width, the text should wrap across multiple lines instead of overflowing or being truncated
**Validates: Requirements 2.3**

**Property 8: Tooltip accessibility compliance**
*For any* visible tooltip, the element should maintain proper contrast ratios and spacing that meet accessibility standards
**Validates: Requirements 2.5**

### CTA Properties

**Property 9: CTA viewport visibility**
*For any* step component, when loaded or after form interaction, the primary CTA should be visible within the viewport without requiring scrolling
**Validates: Requirements 3.1, 3.3**

**Property 10: CTA content integration**
*For any* step component with explanation content, that content should be either integrated with or replaced by actionable CTA elements
**Validates: Requirements 3.2**

**Property 11: CTA interaction persistence**
*For any* form interaction within a step, the primary CTA should remain visible throughout the interaction process
**Validates: Requirements 3.4**

**Property 12: CTA prioritization**
*For any* step with multiple available actions, the primary CTA should have greater visual prominence and better positioning than secondary actions
**Validates: Requirements 3.5**

### Header Restructuring Properties

**Property 13: Step-specific header display**
*For any* step component (except home step), when rendered, the main header should display the step-specific title instead of the generic application title
**Validates: Requirements 4.1**

**Property 14: Subtitle promotion**
*For any* step component, when loaded, the previous subtitle should become the primary step title within the content area
**Validates: Requirements 4.2**

**Property 15: Header hierarchy maintenance**
*For any* step component, when displaying headers, the visual hierarchy should be maintained while reducing overall header height
**Validates: Requirements 4.3**

**Property 16: Specific step header mapping**
*For any* specific step (debts, payments, assets, etc.), when loaded, the correct step-specific title should appear in the main header and the correct promoted subtitle should appear as the step title
**Validates: Requirements 4.4, 4.5**

### Contextual Navigation Properties

**Property 17: Contextual back navigation text**
*For any* step with back navigation, the back button text should indicate the specific previous step the user will return to
**Validates: Requirements 5.1**

**Property 18: Step-specific back navigation mapping**
*For any* specific step, when displaying back navigation, the text should correctly reference the previous step in the flow
**Validates: Requirements 5.2, 5.3, 5.4, 5.5**

## Error Handling

### Tooltip Positioning Failures
- Fallback to default positioning when intelligent positioning fails
- Ensure tooltip content is always readable even if positioning is suboptimal
- Log positioning failures for debugging without breaking user experience

### Viewport Constraint Violations
- Implement graceful degradation when content cannot fit in viewport
- Prioritize form functionality over visual perfection
- Provide scroll fallback for extreme viewport constraints

### CTA Integration Issues
- Maintain original explanation content as fallback if CTA integration fails
- Ensure at least one navigation method is always available
- Preserve form progression functionality regardless of layout issues

## Testing Strategy

### Unit Testing Approach
- Test individual component rendering with different props
- Verify tooltip positioning calculations with various viewport sizes
- Test CTA visibility detection across different content lengths
- Validate accessibility compliance for enhanced tooltips

### Property-Based Testing Approach
Using **React Testing Library** and **@fast-check/jest** for property-based testing:

- Generate random viewport dimensions and verify layout constraints
- Generate random tooltip content lengths and verify wrapping behavior
- Generate random step sequences and verify consistent layout maintenance
- Generate random form interaction patterns and verify CTA persistence

**Configuration Requirements:**
- Each property-based test should run a minimum of 100 iterations
- Tests should use realistic viewport dimension ranges (320px-1920px width, 568px-1080px height)
- Tooltip content generators should include edge cases (very short, very long, multi-line text)
- Form interaction generators should simulate realistic user behavior patterns

**Test Tagging Format:**
Each property-based test must include a comment with the format:
`**Feature: compact-step-layout, Property {number}: {property_text}**`