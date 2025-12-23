# Flow-Specific User Journeys Design Document

## Overview

This design implements unique user flows for each entry point in the mortgage calculator application. The system will differentiate between "monthly payment reduction" and "term shortening" tracks, providing tailored experiences that optimize for each user's specific goal.

The design maintains the existing 6-step structure while introducing track-aware components, calculations, and user guidance. Each track will have distinct UI elements, validation rules, calculation priorities, and messaging that align with the user's selected goal.

## Architecture

### Current Architecture
The application follows a step-based flow with:
- **FormContext**: Manages global state and step navigation
- **Step Components**: Individual UI components for each step (Step1Goal through Step5Simulator)
- **Calculation Utilities**: Mortgage calculation logic in `utils/calculator.ts`
- **Parameter Management**: Mortgage parameters and validation in `utils/mortgageParams.ts`

### Enhanced Architecture
The enhanced architecture introduces track-aware layers:

```
┌─────────────────────────────────────────────────────────────┐
│                    FormContext (Enhanced)                   │
│  - Existing state management                                │
│  - Track context provider                                   │
│  - Track-specific validation                                │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                 Track Configuration Layer                   │
│  - Track-specific UI configurations                         │
│  - Track-specific validation rules                          │
│  - Track-specific calculation parameters                    │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                   Step Components (Enhanced)                │
│  - Conditional rendering based on track                    │
│  - Track-specific styling and messaging                    │
│  - Track-aware validation and behavior                     │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                Calculation Layer (Enhanced)                 │
│  - Track-specific calculation priorities                    │
│  - Track-aware result interpretation                        │
│  - Track-specific optimization strategies                   │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Track Configuration System

#### TrackConfig Interface
```typescript
interface TrackConfig {
  // UI Configuration
  ui: {
    primaryColor: string;
    secondaryColor: string;
    iconClass: string;
    stepTitles: Record<number, string>;
    stepDescriptions: Record<number, string>;
  };
  
  // Validation Configuration
  validation: {
    paymentRangeMultiplier: number;
    maxTermYears: number;
    minPaymentIncrease: number;
    ageWeightFactor: number;
  };
  
  // Calculation Configuration
  calculation: {
    optimizationPriority: 'payment' | 'term' | 'balance';
    simulatorDefaults: {
      paymentStep: number;
      termStep: number;
      focusMetric: string;
    };
  };
  
  // Messaging Configuration
  messaging: {
    tooltips: Record<string, string>;
    successMessages: Record<string, string>;
    warningMessages: Record<string, string>;
    ctaTexts: Record<string, string>;
  };
}
```

#### Track Configuration Objects
```typescript
const TRACK_CONFIGS: Record<TrackType, TrackConfig> = {
  [TrackType.MONTHLY_REDUCTION]: {
    ui: {
      primaryColor: 'blue',
      secondaryColor: 'blue-50',
      iconClass: 'fa-arrow-trend-down',
      stepTitles: {
        2: 'מצב חובות נוכחי',
        3: 'החזרים חודשיים נוכחיים',
        4: 'שווי הנכס',
        6: 'סימולטור הפחתת תשלום'
      },
      stepDescriptions: {
        2: 'נבדוק את המצב הכספי הנוכחי',
        3: 'כמה אתה משלם היום?',
        4: 'שווי הנכס לחישוב המיחזור',
        6: 'בדוק אפשרויות להפחתת התשלום'
      }
    },
    validation: {
      paymentRangeMultiplier: 0.4, // 40% range for payment reduction
      maxTermYears: 30,
      minPaymentIncrease: 0,
      ageWeightFactor: 0.8
    },
    calculation: {
      optimizationPriority: 'payment',
      simulatorDefaults: {
        paymentStep: 100,
        termStep: 0.5,
        focusMetric: 'monthlyReduction'
      }
    },
    messaging: {
      tooltips: {
        mortgagePayment: 'ההחזר הנוכחי שלך - בסיס לחישוב החיסכון',
        targetPayment: 'כמה תרצה לשלם? נמצא את הדרך הטובה ביותר',
        simulator: 'שחק עם הסליידר לראות אפשרויות הפחתה'
      },
      successMessages: {
        calculation: 'מצאנו דרך להפחית את התשלום החודשי!',
        simulation: 'חיסכון מעולה בתשלום החודשי'
      },
      warningMessages: {
        termExtension: 'הפחתת התשלום תאריך את תקופת המשכנתא',
        minPayment: 'התשלום המינימלי המותר הוא'
      },
      ctaTexts: {
        primary: 'בדוק הפחתת תשלום',
        secondary: 'חזור לבחירת מטרה'
      }
    }
  },
  
  [TrackType.SHORTEN_TERM]: {
    ui: {
      primaryColor: 'green',
      secondaryColor: 'green-50',
      iconClass: 'fa-piggy-bank',
      stepTitles: {
        2: 'מצב חובות לאיחוד',
        3: 'יכולת תשלום מוגברת',
        4: 'שווי הנכס',
        6: 'סימולטור קיצור תקופה'
      },
      stepDescriptions: {
        2: 'נאחד את כל החובות למשכנתא אחת',
        3: 'כמה אתה יכול לשלם בחודש?',
        4: 'שווי הנכס לחישוב המיחזור',
        6: 'בדוק אפשרויות לקיצור שנים'
      }
    },
    validation: {
      paymentRangeMultiplier: 0.6, // 60% range for aggressive payment
      maxTermYears: 25, // Shorter max for aggressive payoff
      minPaymentIncrease: 500, // Minimum increase for term shortening
      ageWeightFactor: 1.2
    },
    calculation: {
      optimizationPriority: 'term',
      simulatorDefaults: {
        paymentStep: 200,
        termStep: 1,
        focusMetric: 'termReduction'
      }
    },
    messaging: {
      tooltips: {
        mortgagePayment: 'ההחזר הנוכחי - נוסיף עליו לקיצור שנים',
        targetPayment: 'כמה אתה מוכן לשלם כדי לקצר שנים?',
        simulator: 'שחק עם הסליידר לראות כמה שנים תחסוך'
      },
      successMessages: {
        calculation: 'מצאנו דרך לקצר את תקופת המשכנתא!',
        simulation: 'חיסכון מרשים בשנים ובריבית'
      },
      warningMessages: {
        paymentIncrease: 'קיצור שנים דורש העלאת התשלום החודשי',
        ageLimit: 'תקופת המשכנתא מוגבלת לפי הגיל'
      },
      ctaTexts: {
        primary: 'בדוק קיצור שנים',
        secondary: 'חזור לבחירת מטרה'
      }
    }
  }
};
```

### Enhanced FormContext

The FormContext will be extended to provide track-aware functionality:

```typescript
interface EnhancedFormContextType extends FormContextType {
  // Track-specific methods
  getTrackConfig: () => TrackConfig;
  isTrack: (track: TrackType) => boolean;
  getTrackSpecificValidation: (field: string) => ValidationRule[];
  getTrackSpecificStyling: (component: string) => string;
  
  // Track-aware calculation methods
  calculateWithTrackPriority: (data: Partial<FormData>) => CalculationResult;
  getTrackOptimizedRange: (baseValue: number) => { min: number; max: number };
}
```

### Track-Aware Step Components

Each step component will implement track-aware rendering:

```typescript
// Example: Enhanced Step2Payments
const Step2Payments: React.FC = () => {
  const { formData, track, getTrackConfig } = useForm();
  const config = getTrackConfig();
  
  // Track-specific UI elements
  const stepTitle = config.ui.stepTitles[3];
  const stepDescription = config.ui.stepDescriptions[3];
  const primaryColor = config.ui.primaryColor;
  
  // Track-specific validation
  const paymentRange = getTrackOptimizedRange(formData.mortgagePayment);
  
  // Track-specific messaging
  const tooltips = config.messaging.tooltips;
  
  return (
    <div className={`track-${track} animate-fade-in-up`}>
      <h2 className={`text-2xl font-bold text-${primaryColor}-900 mb-4 text-center`}>
        {stepTitle}
      </h2>
      <p className="text-gray-600 text-center mb-6">{stepDescription}</p>
      
      {/* Track-specific input fields and validation */}
      {/* ... */}
    </div>
  );
};
```

## Data Models

### Enhanced FormData
The existing FormData interface remains unchanged to maintain compatibility, but track-specific derived data will be calculated:

```typescript
interface TrackSpecificData {
  track: TrackType;
  
  // Calculated track-specific values
  optimizedPaymentRange: { min: number; max: number };
  trackPriorityMetrics: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  
  // Track-specific validation results
  trackValidation: {
    isValid: boolean;
    warnings: string[];
    recommendations: string[];
  };
  
  // Track-specific calculation results
  trackOptimizedResult: {
    bestScenario: CalculationResult;
    alternativeScenarios: CalculationResult[];
    tradeoffAnalysis: string[];
  };
}
```

### Track-Specific Calculation Models

```typescript
interface TrackCalculationInput {
  formData: FormData;
  trackConfig: TrackConfig;
  optimizationGoal: 'payment' | 'term' | 'balance';
}

interface TrackCalculationResult extends CalculationResult {
  trackSpecific: {
    primaryMetric: {
      name: string;
      value: number;
      improvement: number;
      unit: string;
    };
    secondaryMetrics: Array<{
      name: string;
      value: number;
      change: number;
      unit: string;
    }>;
    tradeoffs: string[];
    recommendations: string[];
  };
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, several properties can be consolidated to eliminate redundancy:

- Properties related to track-specific UI rendering (1.2, 2.2, 4.1, 5.1, 6.2, 6.3, 6.4) can be combined into a comprehensive UI consistency property
- Properties about configuration separation (2.1, 2.5, 5.5, 7.3) can be merged into a single configuration isolation property  
- Properties about calculation behavior (1.3, 2.3, 6.5) can be unified into one calculation priority property
- Properties about validation (1.5, 3.5, 5.2) can be combined into a track-specific validation property

### Property 1: Track-specific UI consistency
*For any* selected track and any UI component, the component should render with track-appropriate styling, labels, tooltips, and content that matches the track's configuration
**Validates: Requirements 1.2, 2.2, 4.1, 5.1, 6.2, 6.3, 6.4**

### Property 2: Track configuration isolation
*For any* track configuration change, only the modified track's behavior should be affected while other tracks remain completely unchanged
**Validates: Requirements 2.1, 2.4, 2.5, 5.5, 7.3**

### Property 3: Track-specific calculation priority
*For any* calculation performed within a track, the results should prioritize metrics and optimizations that align with that track's defined goals
**Validates: Requirements 1.3, 2.3, 6.5**

### Property 4: Track-aware validation consistency
*For any* form input or user action, validation rules should be applied consistently according to the active track's configuration
**Validates: Requirements 1.5, 3.5, 5.2**

### Property 5: Track context preservation
*For any* navigation or state change within the application, the selected track context should be preserved throughout the entire user session
**Validates: Requirements 3.3, 7.1**

### Property 6: Track-specific guidance alignment
*For any* user guidance, error message, or recommendation displayed, the content should align with and support the goals of the active track
**Validates: Requirements 4.2, 4.3, 4.4, 4.5**

### Property 7: Implementation pattern consistency
*For any* track-specific implementation, the code should follow consistent patterns for conditional logic, styling conventions, and configuration usage
**Validates: Requirements 5.4, 7.2, 7.4**

### Property 8: Shared functionality preservation
*For any* shared utility or common functionality, modifications should maintain backward compatibility while allowing track-specific overrides
**Validates: Requirements 7.5**

## Error Handling

### Track Configuration Errors
- **Missing Track Configuration**: If a track configuration is missing or incomplete, the system should fall back to default values and log warnings
- **Invalid Track Selection**: If an invalid track is selected, the system should default to MONTHLY_REDUCTION and notify the user
- **Configuration Validation**: Track configurations should be validated at startup to ensure all required properties exist

### Runtime Errors
- **Calculation Failures**: If track-specific calculations fail, fall back to standard calculations with appropriate user messaging
- **UI Rendering Errors**: If track-specific UI elements fail to render, display default elements with error logging
- **Validation Errors**: If track-specific validation fails, apply default validation rules and warn the user

### User Experience Errors
- **Track Context Loss**: If track context is lost during navigation, prompt user to reselect their goal
- **Inconsistent State**: If form state becomes inconsistent with track selection, offer to reset or correct the state
- **Performance Issues**: If track-specific processing causes delays, show loading indicators and allow cancellation

## Testing Strategy

### Dual Testing Approach
The system requires both unit testing and property-based testing to ensure comprehensive coverage:

- **Unit tests** verify specific examples, edge cases, and error conditions for track-specific functionality
- **Property tests** verify universal properties that should hold across all inputs and track combinations
- Together they provide comprehensive coverage: unit tests catch concrete bugs, property tests verify general correctness

### Unit Testing Requirements
Unit tests will focus on:
- Specific track configuration scenarios and edge cases
- Integration points between track-aware components and shared utilities
- Error handling for invalid track states and configuration issues
- UI component rendering with different track configurations

### Property-Based Testing Requirements
Property-based testing will use **fast-check** for JavaScript/TypeScript and implement the following requirements:
- Each property-based test will run a minimum of 100 iterations to ensure thorough random testing
- Each property-based test will be tagged with a comment explicitly referencing the correctness property from this design document
- Tag format: **Feature: flow-specific-user-journeys, Property {number}: {property_text}**
- Each correctness property will be implemented by a SINGLE property-based test

### Test Implementation Strategy
1. **Track Configuration Testing**: Verify that track configurations are properly isolated and applied
2. **UI Consistency Testing**: Test that UI elements render correctly for each track across different scenarios
3. **Calculation Priority Testing**: Verify that calculations prioritize the correct metrics for each track
4. **Validation Testing**: Test that validation rules are applied consistently for each track
5. **Context Preservation Testing**: Verify that track context is maintained throughout user sessions
6. **Integration Testing**: Test the interaction between track-specific and shared functionality

### Test Data Generation
Property-based tests will use smart generators that:
- Generate valid track configurations with realistic parameter ranges
- Create form data that represents typical user inputs for each track
- Generate edge cases for age limits, payment ranges, and term constraints
- Ensure generated data respects regulatory and business constraints