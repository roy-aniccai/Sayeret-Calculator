# Design Document

## Overview

This feature enhances the mortgage refinancing simulator by implementing dynamic color schemes for the summary bars based on refinancing outcomes. The design maintains visual consistency with the existing banner color logic while providing immediate visual feedback about whether refinancing reduces or extends the mortgage term.

## Architecture

The enhancement will be implemented within the existing `Step5Simulator` component by:

1. **Color Logic Extraction**: Extract the existing banner color determination logic into a reusable function
2. **Dynamic Styling**: Apply conditional CSS classes based on the refinancing outcome
3. **Consistent Color Mapping**: Ensure bar colors match the corresponding banner colors exactly

## Components and Interfaces

### Color Determination Function

```typescript
interface ColorScheme {
  barGradient: string;
  textColor: string;
  headerTextColor: string;
  paymentBoxBg: string;
  paymentBoxText: string;
}

function getSimulatedBarColorScheme(currentYears: number, simulatedYears: number): ColorScheme
```

This function will:
- Take current and simulated mortgage terms as input
- Return a complete color scheme object for styling the simulated bar
- Mirror the logic used in the banner color determination

### CSS Class Structure

```css
/* Green scheme (reduced years) */
.bar-green {
  background: linear-gradient(to top, #10b981, #059669);
}
.text-green-scheme {
  color: #065f46;
}
.payment-box-green {
  background: #d1fae5;
  color: #065f46;
}

/* Amber scheme (extended years) */
.bar-amber {
  background: linear-gradient(to top, #f59e0b, #d97706);
}
.text-amber-scheme {
  color: #92400e;
}
.payment-box-amber {
  background: #fef3c7;
  color: #92400e;
}

/* Grey scheme (current state - unchanged) */
.bar-grey {
  background: linear-gradient(to top, #9ca3af, #6b7280);
}
.text-grey-scheme {
  color: #374151;
}
.payment-box-grey {
  background: #f3f4f6;
  color: #374151;
}
```

## Data Models

No new data models are required. The feature uses existing data:
- `currentYears`: Current mortgage term length
- `simulatedYears`: Projected mortgage term after refinancing

## Error Handling

- **Fallback Colors**: If color determination fails, default to green scheme
- **Invalid Data**: Handle edge cases where years might be undefined or invalid
- **Graceful Degradation**: Ensure the component remains functional even if styling fails

## Testing Strategy

### Unit Tests
- Test color scheme determination function with various year combinations
- Verify correct CSS class application based on different scenarios
- Test edge cases (equal years, invalid inputs)

### Property-Based Tests
Property-based testing will use the `@fast-check/jest` library with a minimum of 100 iterations per test.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

**Property 1: Shorter term yields green scheme**
*For any* pair of mortgage terms where simulated years is less than current years, the color scheme determination function should return a green color scheme
**Validates: Requirements 1.1**

**Property 2: Longer term yields amber scheme**
*For any* pair of mortgage terms where simulated years is greater than current years, the color scheme determination function should return an amber color scheme
**Validates: Requirements 1.2**

**Property 3: Current bar always grey**
*For any* combination of current and simulated mortgage terms, the current state bar should always receive grey styling regardless of the comparison outcome
**Validates: Requirements 1.4**

**Property 4: Gradient consistency**
*For any* color scheme returned by the system, the background gradient should follow the pattern of lighter shade to darker shade
**Validates: Requirements 1.5**

**Property 5: Complete color scheme**
*For any* valid input to the color determination function, the returned color scheme should include all required styling properties: barGradient, textColor, headerTextColor, paymentBoxBg, and paymentBoxText
**Validates: Requirements 1.6**