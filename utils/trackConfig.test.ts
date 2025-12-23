import * as fc from 'fast-check';
import { 
  TrackConfig, 
  TRACK_CONFIGS, 
  getTrackConfig, 
  getTrackConfigSafe, 
  validateTrackConfig,
  validateAllTrackConfigs,
  TrackConfigError,
  isValidTrack,
  getAvailableTracks,
  getTrackDisplayName
} from './trackConfig';
import { TrackType } from '../types';

describe('Track Configuration System', () => {
  
  /**
   * Feature: flow-specific-user-journeys, Property 2: Track configuration isolation
   * Validates: Requirements 2.1, 2.4, 2.5
   */
  test('Property 2: Track configuration isolation', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.values(TrackType)), // Generate valid track types
        fc.record({
          ui: fc.record({
            primaryColor: fc.string({ minLength: 1, maxLength: 20 }),
            secondaryColor: fc.string({ minLength: 1, maxLength: 20 }),
            iconClass: fc.string({ minLength: 1, maxLength: 50 }),
            stepTitles: fc.dictionary(
              fc.integer({ min: 1, max: 10 }).map(n => n.toString()),
              fc.string({ minLength: 1, maxLength: 100 })
            ),
            stepDescriptions: fc.dictionary(
              fc.integer({ min: 1, max: 10 }).map(n => n.toString()),
              fc.string({ minLength: 1, maxLength: 200 })
            )
          }),
          validation: fc.record({
            paymentRangeMultiplier: fc.float({ min: Math.fround(0.1), max: Math.fround(0.9) }),
            maxTermYears: fc.integer({ min: 5, max: 40 }),
            minPaymentIncrease: fc.integer({ min: 0, max: 2000 }),
            ageWeightFactor: fc.float({ min: Math.fround(0.1), max: Math.fround(2.0) })
          }),
          calculation: fc.record({
            optimizationPriority: fc.constantFrom('payment', 'term', 'balance'),
            simulatorDefaults: fc.record({
              paymentStep: fc.integer({ min: 10, max: 500 }),
              termStep: fc.float({ min: Math.fround(0.1), max: Math.fround(2.0) }),
              focusMetric: fc.string({ minLength: 1, maxLength: 50 })
            })
          }),
          messaging: fc.record({
            tooltips: fc.dictionary(
              fc.string({ minLength: 1, maxLength: 50 }),
              fc.string({ minLength: 1, maxLength: 200 })
            ),
            successMessages: fc.dictionary(
              fc.string({ minLength: 1, maxLength: 50 }),
              fc.string({ minLength: 1, maxLength: 200 })
            ),
            warningMessages: fc.dictionary(
              fc.string({ minLength: 1, maxLength: 50 }),
              fc.string({ minLength: 1, maxLength: 200 })
            ),
            ctaTexts: fc.dictionary(
              fc.string({ minLength: 1, maxLength: 50 }),
              fc.string({ minLength: 1, maxLength: 100 })
            )
          })
        }),
        (targetTrack, modifiedConfig) => {
          // Store original configurations
          const originalConfigs = { ...TRACK_CONFIGS };
          
          // Get all other tracks (not the target track)
          const otherTracks = Object.values(TrackType).filter(track => track !== targetTrack);
          
          // Store original configurations of other tracks for comparison
          const otherTracksOriginal = otherTracks.map(track => ({
            track,
            config: JSON.parse(JSON.stringify(TRACK_CONFIGS[track]))
          }));
          
          try {
            // Modify the target track's configuration
            TRACK_CONFIGS[targetTrack] = modifiedConfig as TrackConfig;
            
            // Verify that other tracks remain completely unchanged
            otherTracksOriginal.forEach(({ track, config: originalConfig }) => {
              const currentConfig = TRACK_CONFIGS[track];
              
              // Deep comparison to ensure no changes
              expect(JSON.stringify(currentConfig)).toBe(JSON.stringify(originalConfig));
              
              // Verify specific properties haven't changed
              expect(currentConfig.ui.primaryColor).toBe(originalConfig.ui.primaryColor);
              expect(currentConfig.validation.paymentRangeMultiplier).toBe(originalConfig.validation.paymentRangeMultiplier);
              expect(currentConfig.calculation.optimizationPriority).toBe(originalConfig.calculation.optimizationPriority);
              expect(Object.keys(currentConfig.messaging.tooltips)).toEqual(Object.keys(originalConfig.messaging.tooltips));
            });
            
            // Verify that the target track has been modified
            const targetConfig = TRACK_CONFIGS[targetTrack];
            expect(targetConfig.ui.primaryColor).toBe(modifiedConfig.ui.primaryColor);
            expect(targetConfig.validation.paymentRangeMultiplier).toBe(modifiedConfig.validation.paymentRangeMultiplier);
            
          } finally {
            // Restore original configurations to prevent test interference
            Object.assign(TRACK_CONFIGS, originalConfigs);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  describe('Track Configuration Validation', () => {
    test('validates all default track configurations', () => {
      expect(() => validateAllTrackConfigs()).not.toThrow();
    });

    test('validates individual track configurations', () => {
      Object.values(TrackType).forEach(track => {
        expect(() => validateTrackConfig(TRACK_CONFIGS[track], track)).not.toThrow();
      });
    });

    test('throws error for missing UI configuration', () => {
      const invalidConfig = { ...TRACK_CONFIGS[TrackType.MONTHLY_REDUCTION] };
      delete (invalidConfig as any).ui;
      
      expect(() => validateTrackConfig(invalidConfig as TrackConfig, TrackType.MONTHLY_REDUCTION))
        .toThrow(TrackConfigError);
    });

    test('throws error for invalid payment range multiplier', () => {
      const invalidConfig = { 
        ...TRACK_CONFIGS[TrackType.MONTHLY_REDUCTION],
        validation: {
          ...TRACK_CONFIGS[TrackType.MONTHLY_REDUCTION].validation,
          paymentRangeMultiplier: 1.5 // Invalid: > 1
        }
      };
      
      expect(() => validateTrackConfig(invalidConfig, TrackType.MONTHLY_REDUCTION))
        .toThrow(TrackConfigError);
    });

    test('throws error for invalid optimization priority', () => {
      const invalidConfig = { 
        ...TRACK_CONFIGS[TrackType.MONTHLY_REDUCTION],
        calculation: {
          ...TRACK_CONFIGS[TrackType.MONTHLY_REDUCTION].calculation,
          optimizationPriority: 'invalid' as any
        }
      };
      
      expect(() => validateTrackConfig(invalidConfig, TrackType.MONTHLY_REDUCTION))
        .toThrow(TrackConfigError);
    });
  });

  describe('Track Configuration Access', () => {
    test('getTrackConfig returns valid configuration', () => {
      Object.values(TrackType).forEach(track => {
        const config = getTrackConfig(track);
        expect(config).toBeDefined();
        expect(config.ui).toBeDefined();
        expect(config.validation).toBeDefined();
        expect(config.calculation).toBeDefined();
        expect(config.messaging).toBeDefined();
      });
    });

    test('getTrackConfigSafe handles null track', () => {
      const config = getTrackConfigSafe(null);
      expect(config).toBeDefined();
      // Should return MONTHLY_REDUCTION as default
      expect(config).toEqual(TRACK_CONFIGS[TrackType.MONTHLY_REDUCTION]);
    });

    test('getTrackConfigSafe handles invalid track gracefully', () => {
      // Mock console.error to avoid noise in test output
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      try {
        const config = getTrackConfigSafe('invalid' as TrackType);
        expect(config).toBeDefined();
        // Should fallback to MONTHLY_REDUCTION
        expect(config).toEqual(TRACK_CONFIGS[TrackType.MONTHLY_REDUCTION]);
        expect(consoleSpy).toHaveBeenCalled();
      } finally {
        consoleSpy.mockRestore();
      }
    });
  });

  describe('Track Utility Functions', () => {
    test('isValidTrack correctly identifies valid tracks', () => {
      expect(isValidTrack(TrackType.MONTHLY_REDUCTION)).toBe(true);
      expect(isValidTrack(TrackType.SHORTEN_TERM)).toBe(true);
      expect(isValidTrack('invalid')).toBe(false);
      expect(isValidTrack(null)).toBe(false);
      expect(isValidTrack(undefined)).toBe(false);
    });

    test('getAvailableTracks returns all track types', () => {
      const tracks = getAvailableTracks();
      expect(tracks).toContain(TrackType.MONTHLY_REDUCTION);
      expect(tracks).toContain(TrackType.SHORTEN_TERM);
      expect(tracks.length).toBe(Object.values(TrackType).length);
    });

    test('getTrackDisplayName returns Hebrew names', () => {
      expect(getTrackDisplayName(TrackType.MONTHLY_REDUCTION)).toBe('הפחתת תשלום חודשי');
      expect(getTrackDisplayName(TrackType.SHORTEN_TERM)).toBe('קיצור תקופת המשכנתא');
    });
  });

  describe('Track Configuration Structure', () => {
    test('all tracks have required UI properties', () => {
      Object.values(TrackType).forEach(track => {
        const config = TRACK_CONFIGS[track];
        expect(config.ui.primaryColor).toBeDefined();
        expect(config.ui.secondaryColor).toBeDefined();
        expect(config.ui.iconClass).toBeDefined();
        expect(config.ui.stepTitles).toBeDefined();
        expect(config.ui.stepDescriptions).toBeDefined();
      });
    });

    test('all tracks have required validation properties', () => {
      Object.values(TrackType).forEach(track => {
        const config = TRACK_CONFIGS[track];
        expect(typeof config.validation.paymentRangeMultiplier).toBe('number');
        expect(typeof config.validation.maxTermYears).toBe('number');
        expect(typeof config.validation.minPaymentIncrease).toBe('number');
        expect(typeof config.validation.ageWeightFactor).toBe('number');
      });
    });

    test('all tracks have required calculation properties', () => {
      Object.values(TrackType).forEach(track => {
        const config = TRACK_CONFIGS[track];
        expect(['payment', 'term', 'balance']).toContain(config.calculation.optimizationPriority);
        expect(config.calculation.simulatorDefaults).toBeDefined();
        expect(typeof config.calculation.simulatorDefaults.paymentStep).toBe('number');
        expect(typeof config.calculation.simulatorDefaults.termStep).toBe('number');
        expect(typeof config.calculation.simulatorDefaults.focusMetric).toBe('string');
      });
    });

    test('all tracks have required messaging properties', () => {
      Object.values(TrackType).forEach(track => {
        const config = TRACK_CONFIGS[track];
        expect(config.messaging.tooltips).toBeDefined();
        expect(config.messaging.successMessages).toBeDefined();
        expect(config.messaging.warningMessages).toBeDefined();
        expect(config.messaging.ctaTexts).toBeDefined();
      });
    });
  });
});