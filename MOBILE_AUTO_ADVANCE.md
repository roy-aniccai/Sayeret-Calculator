# Mobile Auto-Advance Feature

## Overview

The mobile auto-advance feature automatically moves focus to the next input field when the current field is completed, improving the mobile user experience by reducing the need for manual navigation.

## How It Works

### Detection
- Automatically detects mobile devices using user agent and screen width
- Only activates on mobile devices (phones/tablets) or screens ≤ 768px wide

### Trigger Conditions
The auto-advance triggers when:

1. **Phone Numbers** (`inputMode="tel"` with `maxLength`):
   - When the number of digits (excluding formatting) reaches maxLength
   - Example: Phone field with maxLength=10 advances after 10 digits are entered

2. **Numeric Fields with maxLength**:
   - When the input length reaches the specified maxLength
   - Useful for fixed-length numeric codes or IDs

3. **General Numeric Fields** (`inputMode="numeric"` without maxLength):
   - When 4 or more digits are entered (reasonable amount for monetary values)
   - Helps with mortgage amounts, payments, etc.

### Visual Indicators
- Small arrow icon (↓) appears in the top-right corner of auto-advance enabled fields
- Helper text "יעבור אוטומטית לשדה הבא" (Will automatically move to next field) appears below the field
- Indicators only show on mobile devices

## Usage

### Basic Usage
```tsx
<Input 
  autoAdvance={true}
  inputMode="tel"
  maxLength={10}
  placeholder="Phone number"
/>
```

### For Numeric Fields
```tsx
<Input 
  autoAdvance={true}
  inputMode="numeric"
  placeholder="Amount"
/>
```

### With InputWithTooltip Wrapper
```tsx
<InputWithTooltip
  label="Phone Number"
  tooltip="Enter your phone number"
  name="phone"
  inputMode="tel"
  autoAdvance={true}
  maxLength={11}
  // ... other props
/>
```

## Implementation Details

### Components Updated
- `components/ui/Input.tsx` - Core auto-advance logic
- `components/steps/Step1Debts.tsx` - Mortgage balance and other loans fields
- `components/steps/Step2Payments.tsx` - Payment amount fields  
- `components/steps/Step4Contact.tsx` - Phone number field

### Technical Details
- Uses `setTimeout` with 150ms delay for smooth transitions
- Finds next available input using `form.querySelectorAll('input:not([disabled]):not([readonly])')`
- Automatically selects text in the next field for easy replacement
- Respects form boundaries (only advances within the same form)

## Benefits

1. **Improved Mobile UX**: Reduces taps needed to navigate between fields
2. **Faster Data Entry**: Especially beneficial for forms with multiple numeric fields
3. **Better Flow**: Creates a more natural progression through the form
4. **Accessibility**: Maintains keyboard navigation while adding convenience

## Browser Support

Works on all modern mobile browsers that support:
- `querySelector` and `querySelectorAll`
- `setTimeout`
- Standard form navigation

## Future Enhancements

Potential improvements could include:
- Customizable trigger conditions per field type
- Animation effects during transitions
- Support for custom validation before advancing
- Integration with form validation libraries