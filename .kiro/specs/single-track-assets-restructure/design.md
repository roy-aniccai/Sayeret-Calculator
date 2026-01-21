# Design Document

## Overview

This design restructures the Single-Track Assets Step (Step 4) to improve user experience by simplifying the interface, moving the age field from Step 6 to Step 4, and removing LTV ratio display while maintaining all calculation functionality. The changes focus on streamlining the user flow and reducing cognitive load while preserving the underlying mortgage calculation logic.

## Architecture

The restructuring involves modifications to three main components:

1. **SingleTrackStep4Assets.tsx** - Updated to include age field and remove LTV display
2. **SingleTrackStep6Simulator.tsx** - Updated to remove age input and use age from form context
3. **stepHeaderConfig.ts** - Updated to change Step 4 title from "שווי נכסים" to "פרטים נוספים"

The form context (SingleTrackFormContext.tsx) already supports the age field, so no changes are needed there.

## Components and Interfaces

### SingleTrackStep4Assets Component

**Current Structure:**
- Title: "נבדוק את שווי הנכסים" (Let's check asset value)
- Property value input field
- LTV ratio display section with calculation and messaging
- Navigation buttons

**New Structure:**
- Title: "פרטים נוספים" (Additional Details)
- Property value input field
- Age input field (moved from Step 6)
- Navigation buttons
- **Removed:** LTV ratio display section

**Age Field Specifications:**
- **Position:** Below property value field
- **Input Type:** Numeric input (type="number")
- **Validation:** Range 18-120 years
- **Styling:** Consistent with existing form fields
- **Label:** "גיל" (Age) in Hebrew
- **Placeholder:** "35"
- **Error Handling:** Required field validation

### SingleTrackStep6Simulator Component

**Current Age Input Section:**
```typescript
// Age Input Header in simulator
<div className="flex items-center justify-between mb-4">
  <div className="flex items-center gap-3 w-full justify-start">
    <span className="text-lg font-bold text-gray-900">גיל:</span>
    <div className="relative">
      <input
        type="number"
        min="18"
        max="80"
        value={formData.age || ''}
        onChange={handleAgeChange}
        // ... styling and validation
      />
    </div>
  </div>
</div>
```

**Updated Structure:**
- **Removed:** Age input section entirely
- **Updated:** Age-dependent calculations use `formData.age` from Step 4
- **Updated:** Validation messages assume age is already provided
- **Maintained:** All calculation logic using age value

### Step Header Configuration

**Current Step 4 Configuration:**
```typescript
4: {
  stepNumber: 4,
  mainHeaderTitle: "שווי נכסים",
  stepTitle: "נבדוק את שווי הנכסים",
  backNavigationText: "חזור להחזרים"
}
```

**Updated Step 4 Configuration:**
```typescript
4: {
  stepNumber: 4,
  mainHeaderTitle: "פרטים נוספים",
  stepTitle: "פרטים נוספים",
  backNavigationText: "חזור להחזרים"
}
```

## Data Models

### Form Data Structure

The existing `SingleTrackFormData` interface already includes the age field:

```typescript
interface SingleTrackFormData {
  // ... other fields
  age: number | null;  // Already exists
  propertyValue: number;  // Already exists
  // ... other fields
}
```

**No changes needed** to the form data structure as it already supports both fields.

### Age Field Validation

**Validation Rules:**
- **Required:** Age must be provided to proceed from Step 4
- **Range:** 18 ≤ age ≤ 120 years
- **Type:** Integer values only
- **Error Messages:** Hebrew error messages for validation failures

**Validation Implementation:**
```typescript
const validateAge = (age: number | null): string | null => {
  if (!age) return 'נא להזין גיל';
  if (age < 18) return 'גיל מינימלי: 18 שנים';
  if (age > 120) return 'גיל מקסימלי: 120 שנים';
  return null;
};
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Based on the prework analysis, the following properties validate the correctness of the restructuring:

### Property 1: Age Input Acceptance
*For any* valid numeric age input (18-120), the age field in Step 4 should accept and store the value correctly in the form context
**Validates: Requirements 3.2, 3.6**

### Property 2: Age Validation Boundaries  
*For any* age input outside the valid range (< 18 or > 120), the system should reject the input and display appropriate error messages
**Validates: Requirements 3.7**

### Property 3: Age Data Persistence
*For any* age value entered in Step 4, navigating to any other step and back should preserve the age value in the input field
**Validates: Requirements 4.1, 4.2**

### Property 4: Age Data Flow to Calculations
*For any* age value set in Step 4, when reaching Step 6, all mortgage calculations should use that age value for term limits and validation
**Validates: Requirements 3.5, 6.1**

### Property 5: LTV Calculation Preservation
*For any* combination of property value, mortgage balance, and other loans balance, the internal LTV calculations should produce identical results before and after the UI restructuring
**Validates: Requirements 2.4, 2.5, 6.2, 6.3**

### Property 6: Form Reset Completeness
*For any* form state with age data, performing a form reset should clear the age field along with all other form fields
**Validates: Requirements 4.5**

### Property 7: Required Field Validation
*For any* attempt to progress from Step 4 without entering age, the system should prevent navigation and display validation errors
**Validates: Requirements 6.5**

## Error Handling

### Age Input Validation

**Validation Scenarios:**
1. **Empty Age:** Display "נא להזין גיל" (Please enter age)
2. **Age Too Low:** Display "גיל מינימלי: 18 שנים" (Minimum age: 18 years)  
3. **Age Too High:** Display "גיל מקסימלי: 120 שנים" (Maximum age: 120 years)
4. **Non-numeric Input:** Prevent input or display "נא להזין מספר תקין" (Please enter a valid number)

**Error Display:**
- Errors appear below the age input field
- Red text color for error messages
- Error icon (exclamation) next to error text
- Errors clear when user starts typing valid input

### Navigation Validation

**Step 4 to Step 5 Progression:**
- Validate both property value and age are provided
- Display consolidated error message if either field is missing
- Prevent navigation until both fields are valid

**Backward Navigation:**
- No validation required for backward navigation
- Preserve all entered data when navigating backward

### Calculation Error Handling

**Age-Dependent Calculations:**
- If age is missing during calculations, use default validation rules
- Display clear error messages for age-related calculation failures
- Graceful degradation if age validation fails

## Testing Strategy

### Dual Testing Approach

The testing strategy employs both unit tests and property-based tests to ensure comprehensive coverage:

**Unit Tests:**
- Specific examples of UI component rendering
- Edge cases for age validation (boundary values: 17, 18, 120, 121)
- Error message display scenarios
- Component integration between Step 4 and Step 6
- LTV display removal verification

**Property-Based Tests:**
- Universal properties across all valid age inputs (18-120)
- Form data persistence across navigation scenarios  
- Calculation consistency with randomized input combinations
- Comprehensive input coverage through randomization

**Property-Based Testing Configuration:**
- **Library:** React Testing Library with @fast-check/jest for property-based testing
- **Iterations:** Minimum 100 iterations per property test
- **Test Tags:** Each property test references its design document property
- **Tag Format:** `Feature: single-track-assets-restructure, Property {number}: {property_text}`

**Test Organization:**
- Unit tests focus on specific UI behaviors and edge cases
- Property tests validate universal correctness properties
- Integration tests verify data flow between Step 4 and Step 6
- Each correctness property implemented by a single property-based test

### Test Coverage Areas

**UI Component Tests:**
- Step 4 title change verification
- Age field positioning and styling
- LTV display removal confirmation
- Step 6 age input removal verification

**Data Flow Tests:**
- Age data storage in form context
- Age data retrieval in Step 6 calculations
- Form reset functionality including age field
- Navigation with age data preservation

**Calculation Tests:**
- LTV calculation consistency (internal vs. previous implementation)
- Age-dependent mortgage term calculations
- Validation rule enforcement
- Error handling for invalid inputs

**Integration Tests:**
- Complete user flow from Step 4 to Step 6 with age data
- Backward navigation data preservation
- Form reset and restart scenarios
- Error recovery and correction flows