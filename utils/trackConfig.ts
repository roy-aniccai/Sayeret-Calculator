/**
 * Track Configuration System for Flow-Specific User Journeys
 * Provides track-specific UI, validation, calculation, and messaging configurations
 */

import { TrackType } from '../types';

export interface TrackConfig {
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

/**
 * Track Configuration Objects
 */
export const TRACK_CONFIGS: Record<TrackType, TrackConfig> = {
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

/**
 * Configuration validation errors
 */
export class TrackConfigError extends Error {
  constructor(message: string, public track?: TrackType, public field?: string) {
    super(message);
    this.name = 'TrackConfigError';
  }
}

/**
 * Validates a track configuration object
 */
export const validateTrackConfig = (config: TrackConfig, track: TrackType): void => {
  // Validate UI configuration
  if (!config.ui) {
    throw new TrackConfigError(`Missing UI configuration for track ${track}`, track, 'ui');
  }
  
  if (!config.ui.primaryColor || !config.ui.secondaryColor || !config.ui.iconClass) {
    throw new TrackConfigError(`Incomplete UI configuration for track ${track}`, track, 'ui');
  }
  
  // Validate validation configuration
  if (!config.validation) {
    throw new TrackConfigError(`Missing validation configuration for track ${track}`, track, 'validation');
  }
  
  if (config.validation.paymentRangeMultiplier <= 0 || config.validation.paymentRangeMultiplier > 1) {
    throw new TrackConfigError(`Invalid paymentRangeMultiplier for track ${track}: must be between 0 and 1`, track, 'validation.paymentRangeMultiplier');
  }
  
  if (config.validation.maxTermYears <= 0 || config.validation.maxTermYears > 50) {
    throw new TrackConfigError(`Invalid maxTermYears for track ${track}: must be between 1 and 50`, track, 'validation.maxTermYears');
  }
  
  if (config.validation.minPaymentIncrease < 0) {
    throw new TrackConfigError(`Invalid minPaymentIncrease for track ${track}: cannot be negative`, track, 'validation.minPaymentIncrease');
  }
  
  if (config.validation.ageWeightFactor <= 0) {
    throw new TrackConfigError(`Invalid ageWeightFactor for track ${track}: must be positive`, track, 'validation.ageWeightFactor');
  }
  
  // Validate calculation configuration
  if (!config.calculation) {
    throw new TrackConfigError(`Missing calculation configuration for track ${track}`, track, 'calculation');
  }
  
  const validPriorities = ['payment', 'term', 'balance'];
  if (!validPriorities.includes(config.calculation.optimizationPriority)) {
    throw new TrackConfigError(`Invalid optimizationPriority for track ${track}: must be one of ${validPriorities.join(', ')}`, track, 'calculation.optimizationPriority');
  }
  
  if (!config.calculation.simulatorDefaults) {
    throw new TrackConfigError(`Missing simulatorDefaults for track ${track}`, track, 'calculation.simulatorDefaults');
  }
  
  if (config.calculation.simulatorDefaults.paymentStep <= 0) {
    throw new TrackConfigError(`Invalid paymentStep for track ${track}: must be positive`, track, 'calculation.simulatorDefaults.paymentStep');
  }
  
  if (config.calculation.simulatorDefaults.termStep <= 0) {
    throw new TrackConfigError(`Invalid termStep for track ${track}: must be positive`, track, 'calculation.simulatorDefaults.termStep');
  }
  
  // Validate messaging configuration
  if (!config.messaging) {
    throw new TrackConfigError(`Missing messaging configuration for track ${track}`, track, 'messaging');
  }
  
  const requiredMessageSections = ['tooltips', 'successMessages', 'warningMessages', 'ctaTexts'];
  for (const section of requiredMessageSections) {
    if (!config.messaging[section as keyof typeof config.messaging]) {
      throw new TrackConfigError(`Missing ${section} in messaging configuration for track ${track}`, track, `messaging.${section}`);
    }
  }
};

/**
 * Gets track configuration with validation
 */
export const getTrackConfig = (track: TrackType): TrackConfig => {
  const config = TRACK_CONFIGS[track];
  
  if (!config) {
    throw new TrackConfigError(`No configuration found for track: ${track}`, track);
  }
  
  try {
    validateTrackConfig(config, track);
    return config;
  } catch (error) {
    if (error instanceof TrackConfigError) {
      throw error;
    }
    throw new TrackConfigError(`Validation failed for track ${track}: ${error}`, track);
  }
};

/**
 * Gets track configuration with fallback to default
 */
export const getTrackConfigSafe = (track: TrackType | null): TrackConfig => {
  if (!track) {
    return getTrackConfig(TrackType.MONTHLY_REDUCTION); // Default fallback
  }
  
  try {
    return getTrackConfig(track);
  } catch (error) {
    console.error(`Failed to get track config for ${track}, falling back to MONTHLY_REDUCTION:`, error);
    return getTrackConfig(TrackType.MONTHLY_REDUCTION);
  }
};

/**
 * Validates all track configurations at startup
 */
export const validateAllTrackConfigs = (): void => {
  const tracks = Object.values(TrackType);
  const errors: TrackConfigError[] = [];
  
  for (const track of tracks) {
    try {
      validateTrackConfig(TRACK_CONFIGS[track], track);
    } catch (error) {
      if (error instanceof TrackConfigError) {
        errors.push(error);
      } else {
        errors.push(new TrackConfigError(`Unexpected error validating ${track}: ${error}`, track));
      }
    }
  }
  
  if (errors.length > 0) {
    const errorMessages = errors.map(e => `${e.track}: ${e.message}`).join('\n');
    throw new TrackConfigError(`Track configuration validation failed:\n${errorMessages}`);
  }
};

/**
 * Utility functions for track configuration
 */
export const isValidTrack = (track: any): track is TrackType => {
  return Object.values(TrackType).includes(track);
};

export const getAvailableTracks = (): TrackType[] => {
  return Object.values(TrackType);
};

export const getTrackDisplayName = (track: TrackType): string => {
  switch (track) {
    case TrackType.MONTHLY_REDUCTION:
      return 'הפחתת תשלום חודשי';
    case TrackType.SHORTEN_TERM:
      return 'קיצור תקופת המשכנתא';
    default:
      return 'מסלול לא מוכר';
  }
};