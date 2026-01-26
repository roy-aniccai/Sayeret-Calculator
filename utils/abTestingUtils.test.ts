import {
  detectVersionFromUrl,
  createABTestConfig,
  getSimulatorVersion,
  SimulatorVersion
} from './abTestingUtils';

describe('abTestingUtils', () => {
  describe('detectVersionFromUrl', () => {
    it('detects version A from URL parameter', () => {
      const result = detectVersionFromUrl('?simulatorVersion=A');
      expect(result).toBe('A');
    });

    it('detects version B from URL parameter', () => {
      const result = detectVersionFromUrl('?simulatorVersion=B');
      expect(result).toBe('B');
    });

    it('handles case insensitive input', () => {
      expect(detectVersionFromUrl('?simulatorVersion=a')).toBe('A');
      expect(detectVersionFromUrl('?simulatorVersion=b')).toBe('B');
    });

    it('returns null for invalid version', () => {
      const result = detectVersionFromUrl('?simulatorVersion=C');
      expect(result).toBeNull();
    });

    it('returns null for missing parameter', () => {
      const result = detectVersionFromUrl('?other=value');
      expect(result).toBeNull();
    });

    it('returns null for empty search string', () => {
      const result = detectVersionFromUrl('');
      expect(result).toBeNull();
    });
  });

  describe('createABTestConfig', () => {
    it('prioritizes URL parameter over prop and default', () => {
      const config = createABTestConfig('?simulatorVersion=A', 'B', 'B');
      expect(config.version).toBe('A');
      expect(config.source).toBe('url');
      expect(config.isValid).toBe(true);
    });

    it('uses prop when URL parameter is not present', () => {
      const config = createABTestConfig('', 'A', 'B');
      expect(config.version).toBe('A');
      expect(config.source).toBe('prop');
      expect(config.isValid).toBe(true);
    });

    it('uses default when neither URL nor prop is valid', () => {
      const config = createABTestConfig('', undefined, 'B');
      expect(config.version).toBe('B');
      expect(config.source).toBe('default');
      expect(config.isValid).toBe(true);
    });

    it('defaults to B when no parameters provided', () => {
      const config = createABTestConfig();
      expect(config.version).toBe('B');
      expect(config.source).toBe('default');
      expect(config.isValid).toBe(true);
    });
  });

  describe('getSimulatorVersion', () => {
    it('returns version from URL parameter', () => {
      const version = getSimulatorVersion('?simulatorVersion=A');
      expect(version).toBe('A');
    });

    it('returns default version B when no URL parameter', () => {
      const version = getSimulatorVersion('');
      expect(version).toBe('B');
    });

    it('returns custom default when specified', () => {
      const version = getSimulatorVersion('', 'A');
      expect(version).toBe('A');
    });

    it('handles multiple URL parameters', () => {
      const version = getSimulatorVersion('?other=value&simulatorVersion=A&another=test');
      expect(version).toBe('A');
    });
  });

  describe('default behavior change', () => {
    it('defaults to version B instead of A', () => {
      // Test that the default has changed from A to B
      const config = createABTestConfig();
      expect(config.version).toBe('B');
      
      const version = getSimulatorVersion();
      expect(version).toBe('B');
    });

    it('still allows version A via URL parameter', () => {
      const version = getSimulatorVersion('?simulatorVersion=A');
      expect(version).toBe('A');
    });
  });
});