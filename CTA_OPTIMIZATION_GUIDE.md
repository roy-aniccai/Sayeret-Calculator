# CTA Visibility Optimization Guide

This guide documents the CTA (Call-to-Action) visibility optimization system implemented for the compact step layout feature.

## Overview

The CTA optimization system ensures that action buttons remain visible and accessible throughout user interactions, eliminating the need for scrolling to find CTAs and improving the overall user experience.

## Features

### 1. Viewport Visibility Detection
- Automatically detects if CTAs are visible within the viewport
- Monitors viewport changes (resize, scroll) in real-time
- Calculates optimal positioning based on available space

### 2. Automatic Positioning Adjustments
- Dynamically adjusts CTA position based on content height
- Supports multiple positioning strategies:
  - **Static/Inline**: When content fits within viewport
  - **Fixed Bottom**: When content requires scrolling but space is available
  - **Sticky**: Fallback for complex layouts

### 3. CTA Interaction Persistence
- CTAs remain visible during form interactions
- Monitors focus, input, and scroll events
- Updates positioning dynamically when content changes
- Prevents CTA from being hidden during user input

### 4. CTA Prioritization System
- Visual hierarchy for multiple CTAs
- Primary, secondary, and tertiary priority levels
- Automatic layout optimization based on CTA count
- Enhanced styling for primary CTAs

## Components

### CTAPrioritization Component

The main component for managing multiple CTAs with priorities.

```tsx
import { CTAPrioritization, CTAConfig } from './components/ui/CTAPrioritization';

const ctas: CTAConfig[] = [
  {
    id: 'submit',
    text: 'Submit',
    onClick: handleSubmit,
    priority: 'primary',
    icon: 'fa-solid fa-check',
    variant: 'primary'
  },
  {
    id: 'save',
    text: 'Save Draft',
    onClick: handleSave,
    priority: 'secondary',
    icon: 'fa-solid fa-save'
  }
];

<CTAPrioritization
  ctas={ctas}
  layout="stacked"
  persistentPrimary={true}
/>
```

### SimpleCTAGroup Component

A simplified component for common use cases with one or two CTAs.

```tsx
import { SimpleCTAGroup } from './components/ui/CTAPrioritization';

<SimpleCTAGroup
  primaryText="Continue"
  primaryAction={handleNext}
  primaryIcon="fa-solid fa-arrow-right"
  secondaryText="Back"
  secondaryAction={handleBack}
  secondaryIcon="fa-solid fa-arrow-left"
  layout="inline"
/>
```

## Utilities

### CTA Positioning Utilities

Located in `utils/ctaPositioning.ts`, these utilities provide low-level positioning logic:

- `getViewportConstraints()`: Get current viewport dimensions and constraints
- `isElementInViewport()`: Check if an element is visible
- `calculateOptimalCTAPosition()`: Calculate best position for a CTA
- `applyCTAPositioning()`: Apply positioning styles to an element
- `createCTAPositionMonitor()`: Monitor and update positions automatically
- `ensureCTAVisibility()`: Use IntersectionObserver for visibility tracking
- `requiresScrolling()`: Check if content needs scrolling
- `getScrollFreeCTAPosition()`: Get positioning strategy for scroll-free access

### CTA Interaction Persistence Hook

Located in `utils/useCTAInteractionPersistence.ts`, this hook manages CTA visibility during interactions:

```tsx
import { useCTAInteractionPersistence } from './utils/useCTAInteractionPersistence';

const { interactionState, updatePositioning } = useCTAInteractionPersistence(
  contentContainerRef,
  [primaryCTARef, secondaryCTARef],
  {
    persistDuringFocus: true,
    persistDuringInput: true,
    persistDuringScroll: true,
    stickyBehavior: 'when-hidden',
    updateOnContentChange: true
  }
);
```

## Configuration Options

### CTAInteractionConfig

```typescript
interface CTAInteractionConfig {
  persistDuringFocus: boolean;      // Keep CTA visible when inputs are focused
  persistDuringInput: boolean;      // Keep CTA visible during typing
  persistDuringScroll: boolean;     // Keep CTA visible during scrolling
  stickyBehavior: 'always' | 'when-hidden' | 'never';  // Sticky positioning strategy
  updateOnContentChange: boolean;   // Update position when content changes
}
```

### CTAConfig

```typescript
interface CTAConfig {
  id: string;                       // Unique identifier
  text: string;                     // Button text
  onClick: () => void;              // Click handler
  priority: 'primary' | 'secondary' | 'tertiary';  // Visual priority
  icon?: string;                    // Optional icon class
  disabled?: boolean;               // Disabled state
  loading?: boolean;                // Loading state
  variant?: 'primary' | 'secondary' | 'success';  // Button variant
}
```

## Layout Options

### Stacked Layout
Best for emphasizing a single primary action:
```tsx
<CTAPrioritization ctas={ctas} layout="stacked" />
```

### Inline Layout
Best for multiple actions of similar importance:
```tsx
<CTAPrioritization ctas={ctas} layout="inline" />
```

### Auto Layout
Automatically determines the best layout based on CTA count and priorities:
```tsx
<CTAPrioritization ctas={ctas} layout="auto" />
```

## Priority Levels

### Primary
- Largest size and most prominent styling
- Gets optimal positioning (always visible)
- Enhanced hover effects and shadows
- Recommended for main actions (Submit, Continue, etc.)

### Secondary
- Medium size and subtle styling
- Positioned after primary CTA
- Good for alternative actions (Save Draft, Cancel, etc.)

### Tertiary
- Smallest size and minimal styling
- Positioned last
- Best for optional actions (Reset, Help, etc.)

## Best Practices

1. **Use One Primary CTA**: Each step should have one clear primary action
2. **Limit CTA Count**: Keep to 2-3 CTAs maximum per view
3. **Consistent Positioning**: Use the same layout pattern across similar steps
4. **Enable Persistence**: Always enable interaction persistence for forms
5. **Test on Mobile**: Verify CTA visibility on small viewports
6. **Provide Feedback**: Use loading states during async operations
7. **Accessible Icons**: Always include text with icons

## Integration Example

Here's a complete example of integrating the CTA optimization system into a step component:

```tsx
import React, { useRef } from 'react';
import { SimpleCTAGroup } from '../ui/CTAPrioritization';
import { useCTAInteractionPersistence } from '../../utils/useCTAInteractionPersistence';

export const MyStepComponent: React.FC = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  
  // Enable CTA persistence
  useCTAInteractionPersistence(
    contentRef,
    [ctaRef],
    { stickyBehavior: 'when-hidden' }
  );

  return (
    <div ref={contentRef} className="space-y-4">
      {/* Your form content */}
      <input type="text" placeholder="Name" />
      <input type="email" placeholder="Email" />
      
      {/* CTA Group */}
      <div ref={ctaRef}>
        <SimpleCTAGroup
          primaryText="Continue"
          primaryAction={handleNext}
          secondaryText="Back"
          secondaryAction={handleBack}
        />
      </div>
    </div>
  );
};
```

## Demo Component

A complete demonstration is available in `components/examples/CTAOptimizationDemo.tsx`. This component shows:
- All CTA layouts (stacked, inline, auto)
- Interaction persistence in action
- Priority system with multiple CTAs
- Real-time status indicators
- Scrolling behavior

To use the demo:
```tsx
import { CTAOptimizationDemo } from './components/examples/CTAOptimizationDemo';

// In your app
<CTAOptimizationDemo />
```

## Requirements Validation

This implementation validates the following requirements:

- **Requirement 3.1**: CTAs are prominently displayed within viewport
- **Requirement 3.3**: CTAs are visible without requiring scrolling
- **Requirement 3.4**: CTA visibility is maintained throughout interactions
- **Requirement 3.5**: Primary CTAs are prioritized for visibility

## Browser Support

- Modern browsers with IntersectionObserver support
- Fallback to basic positioning for older browsers
- Tested on Chrome, Firefox, Safari, and Edge

## Performance Considerations

- Uses `requestAnimationFrame` for smooth updates
- Debounced content change detection (100ms)
- Efficient IntersectionObserver usage
- Minimal re-renders with React hooks

## Troubleshooting

### CTA Not Staying Visible
- Ensure `persistentPrimary={true}` is set
- Check that refs are properly attached
- Verify content container has proper height

### Positioning Issues
- Check viewport constraints calculation
- Verify z-index values don't conflict
- Test with different content heights

### Performance Issues
- Reduce number of monitored CTAs
- Disable `updateOnContentChange` if not needed
- Use `stickyBehavior: 'never'` for static layouts

## Future Enhancements

Potential improvements for future iterations:
- Keyboard navigation support
- Animation transitions between positions
- Mobile-specific optimizations
- A/B testing integration
- Analytics tracking for CTA interactions