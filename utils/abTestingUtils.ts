/**
 * A/B Testing Utility for Simulator Version Detection
 * 
 * Provides robust detection of simulator version from URL parameters with
 * comprehensive error handling and fallback behavior.
 * 
 * Requirements: 3.1, 3.4 - Support A/B version detection from query string with fallback
 */

export type SimulatorVersion = 'A' | 'B';

export interface ABTestConfig {
  version: SimulatorVersion;
  source: 'url' | 'prop' | 'default';
  isValid: boolean;
  errors: string[];
}

/**
 * Default A/B test configuration
 */
const DEFAULT_AB_CONFIG: ABTestConfig = {
  version: 'B',
  source: 'default',
  isValid: true,
  errors: [],
};

/**
 * Safely parse URL search parameters with error handling
 */
function safeParseUrlParams(search: string): URLSearchParams {
  try {
    if (!search || typeof search !== 'string') {
      return new URLSearchParams();
    }
    
    const cleanSearch = search.startsWith('?') ? search.substring(1) : search;
    return new URLSearchParams(cleanSearch);
  } catch (error) {
    console.warn('Failed to parse URL parameters for A/B testing:', error);
    return new URLSearchParams();
  }
}

/**
 * Validate simulator version parameter
 */
function validateSimulatorVersion(value: string | null): SimulatorVersion | null {
  if (!value || typeof value !== 'string') {
    return null;
  }
  
  const trimmed = value.trim().toUpperCase();
  
  if (trimmed === 'A' || trimmed === 'B') {
    return trimmed as SimulatorVersion;
  }
  
  return null;
}

/**
 * Detect simulator version from URL parameter
 * 
 * @param search - URL search string (e.g., "?simulatorVersion=B&other=param")
 * @param paramName - Parameter name to look for (default: 'simulatorVersion')
 * @returns Detected version or null if not found/invalid
 */
export function detectVersionFromUrl(search?: string, paramName: string = 'simulatorVersion'): SimulatorVersion | null {
  try {
    if (!search) {
      return null;
    }
    
    const urlParams = safeParseUrlParams(search);
    const versionParam = urlParams.get(paramName);
    
    return validateSimulatorVersion(versionParam);
  } catch (error) {
    console.warn('Error detecting simulator version from URL:', error);
    return null;
  }
}

/**
 * Create A/B test configuration with comprehensive error handling
 * 
 * @param search - URL search string
 * @param propVersion - Version passed as component prop
 * @param defaultVersion - Fallback version (default: 'B')
 * @returns Complete A/B test configuration
 */
export function createABTestConfig(
  search?: string,
  propVersion?: SimulatorVersion,
  defaultVersion: SimulatorVersion = 'B'
): ABTestConfig {
  const errors: string[] = [];
  
  try {
    // First priority: URL parameter
    const urlVersion = detectVersionFromUrl(search);
    if (urlVersion) {
      return {
        version: urlVersion,
        source: 'url',
        isValid: true,
        errors: [],
      };
    }
    
    // Second priority: Component prop
    if (propVersion && (propVersion === 'A' || propVersion === 'B')) {
      return {
        version: propVersion,
        source: 'prop',
        isValid: true,
        errors: [],
      };
    } else if (propVersion) {
      errors.push(`Invalid prop version "${propVersion}", using default`);
    }
    
    // Third priority: Default version
    if (defaultVersion !== 'A' && defaultVersion !== 'B') {
      errors.push(`Invalid default version "${defaultVersion}", using 'B'`);
      defaultVersion = 'B';
    }
    
    return {
      version: defaultVersion,
      source: 'default',
      isValid: true,
      errors,
    };
  } catch (error) {
    console.error('Critical error creating A/B test config:', error);
    
    return {
      ...DEFAULT_AB_CONFIG,
      errors: [`Critical error: ${error instanceof Error ? error.message : 'Unknown error'}`],
    };
  }
}

/**
 * Get simulator version from current browser location
 * Safe to use in browser environments with comprehensive error handling
 * 
 * @param paramName - Parameter name to look for (default: 'simulatorVersion')
 * @param defaultVersion - Fallback version (default: 'B')
 * @returns Simulator version configuration
 */
export function getVersionFromLocation(
  paramName: string = 'simulatorVersion',
  defaultVersion: SimulatorVersion = 'B'
): ABTestConfig {
  try {
    if (typeof window === 'undefined' || !window.location) {
      console.warn('Browser location not available, using default version');
      return {
        ...DEFAULT_AB_CONFIG,
        version: defaultVersion,
        errors: ['Browser location not available'],
      };
    }
    
    return createABTestConfig(window.location.search, undefined, defaultVersion);
  } catch (error) {
    console.error('Error getting version from location:', error);
    return {
      ...DEFAULT_AB_CONFIG,
      version: defaultVersion,
      errors: [`Location error: ${error instanceof Error ? error.message : 'Unknown error'}`],
    };
  }
}

/**
 * Get simulator version from current browser URL
 * Convenience function that returns just the version string
 * 
 * @param paramName - Parameter name to look for (default: 'simulatorVersion')
 * @param defaultVersion - Fallback version (default: 'B')
 * @returns Simulator version ('A' or 'B')
 */
export function getSimulatorVersionFromUrl(
  paramName: string = 'simulatorVersion',
  defaultVersion: SimulatorVersion = 'B'
): SimulatorVersion {
  const config = getVersionFromLocation(paramName, defaultVersion);
  return config.version;
}

/**
 * Simple utility to get just the version string from URL
 * Convenience function for components that only need the version
 * 
 * @param search - URL search string
 * @param defaultVersion - Fallback version (default: 'B')
 * @returns Simulator version ('A' or 'B')
 */
export function getSimulatorVersion(search?: string, defaultVersion: SimulatorVersion = 'B'): SimulatorVersion {
  const config = createABTestConfig(search, undefined, defaultVersion);
  return config.version;
}

/**
 * Generate URL with simulator version parameter
 * Utility for creating test URLs or navigation
 * 
 * @param baseUrl - Base URL to append parameter to
 * @param version - Simulator version to set
 * @param paramName - Parameter name (default: 'simulatorVersion')
 * @returns URL with simulator version parameter
 */
export function generateVersionUrl(
  baseUrl: string,
  version: SimulatorVersion,
  paramName: string = 'simulatorVersion'
): string {
  try {
    const url = new URL(baseUrl, window.location.origin);
    url.searchParams.set(paramName, version);
    return url.toString();
  } catch (error) {
    console.warn('Error generating version URL:', error);
    return `${baseUrl}?${paramName}=${version}`;
  }
}