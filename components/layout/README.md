# Shared Layout Utilities

This directory contains reusable layout components and utilities that implement consistent spacing patterns, viewport constraint handling, and compact layout design across all step components.

## Components

### CompactStepLayout

A wrapper component that provides consistent structure for all step components.

```tsx
import { CompactStepLayout } from './components/layout';

<CompactStepLayout
  stepName="נתוני משכנתא"
  primaryCTA={<IntegratedCTA config={ctaConfig} />}
  onBack={handleBack}
>
  {/* Your step content */}
</CompactStepLayout>
```

**Features:**
- Consistent step header styling
- Automatic spacing patterns
- CTA section management
- Back button integration
- Viewport constraint handling

### IntegratedCTA

Replaces explanation boxes with actionable call-to-action elements.

```tsx
import { IntegratedCTA, createCTAConfig } from './components/layout';

const ctaConfig = createCTAConfig.primary(
  'מידע מדויק = חיסכון מדויק יותר',
  'המשך לחישוב',
  handleNext,
  'כל השדות מלאים בהצלחה'
);

<IntegratedCTA config={ctaConfig} />
```

**Available CTA Types:**
- `createCTAConfig.primary()` - Main actions
- `createCTAConfig.success()` - Success states
- `createCTAConfig.info()` - Information/tips
- `createCTAConfig.calculator()` - Calculation actions
- `createCTAConfig.security()` - Security/privacy

### InputWithTooltip

Standardized input component with enhanced tooltip system.

```tsx
import { InputWithTooltip } from './components/layout';

<InputWithTooltip
  label="יתרת משכנתא נוכחית"
  tooltip="נדרש לחישוב הריבית החדשה ואפשרויות המיחזור"
  name="mortgageBalance"
  value={formData.mortgageBalance}
  onChange={handleChange}
  icon={<i className="fa-solid fa-home text-blue-500"></i>}
  autoAdvance={true}
/>
```

## Utilities

### Layout Utils

```tsx
import {
  SPACING_PATTERNS,
  VIEWPORT_BREAKPOINTS,
  isMobileViewport,
  getResponsiveSpacing,
  combineClasses
} from './components/layout';

// Use consistent spacing
<div className={SPACING_PATTERNS.container}>
  {/* Content with space-y-4 */}
</div>

// Responsive spacing
<div className={getResponsiveSpacing('compact', 'section', 'container')}>
  {/* Responsive spacing based on viewport */}
</div>

// Combine classes safely
<div className={combineClasses('base-class', condition && 'conditional-class')}>
```

### Viewport Constraints

```tsx
import { useViewportConstraints, willFitInViewport } from './components/layout';

const MyComponent = () => {
  const constraints = useViewportConstraints();
  
  const contentFits = willFitInViewport(500); // Check if 500px content fits
  
  return (
    <div style={{ maxHeight: constraints.contentMaxHeight }}>
      {/* Content that respects viewport constraints */}
    </div>
  );
};
```

## Design Patterns

### Consistent Spacing

All components use the same spacing patterns:

- `space-y-4` - Main container spacing between sections
- `space-y-3` - Within sections (form groups)
- `mb-2` - Individual elements (labels, etc.)
- `space-y-2` - Compact layouts

### Viewport Optimization

Components automatically adapt to viewport constraints:

- Mobile (≤768px): Compact spacing and layout
- Tablet (769-1024px): Medium spacing
- Desktop (>1024px): Full spacing

### CTA Integration

Replace explanation boxes with integrated CTAs:

```tsx
// Instead of explanation boxes
<div className="bg-blue-50 p-4">
  <p>This is an explanation...</p>
</div>

// Use integrated CTAs
<IntegratedCTA
  config={createCTAConfig.info(
    'Helpful tip',
    'Learn More',
    handleLearnMore,
    'Additional context'
  )}
/>
```

## Migration Guide

To migrate existing step components:

1. **Wrap with CompactStepLayout:**
   ```tsx
   // Before
   <div className="animate-fade-in-up">
     <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Step Name</h2>
     {/* content */}
   </div>

   // After
   <CompactStepLayout stepName="Step Name">
     {/* content */}
   </CompactStepLayout>
   ```

2. **Replace InputWithTooltip:**
   ```tsx
   // Use the shared component instead of local implementations
   import { InputWithTooltip } from './components/layout';
   ```

3. **Convert explanation boxes to CTAs:**
   ```tsx
   // Before
   <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
     <p>Explanation text</p>
   </div>

   // After
   <IntegratedCTA config={createCTAConfig.info('Title', 'Action', handler)} />
   ```

4. **Use consistent spacing:**
   ```tsx
   import { SPACING_PATTERNS } from './components/layout';
   
   <div className={SPACING_PATTERNS.container}>
     {/* Your content */}
   </div>
   ```

## Testing

The layout utilities include comprehensive tests:

```bash
npm test -- --testPathPatterns="layoutUtils|CompactStepLayout"
```

Tests cover:
- Component rendering
- Viewport detection
- Spacing calculations
- CTA functionality
- Responsive behavior