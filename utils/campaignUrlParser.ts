/**
 * Campaign URL Parser Utility
 * 
 * Provides robust parsing of campaign parameters from URLs with comprehensive
 * error handling and fallback behavior for missing or malformed data.
 * 
 * Requirements: 5.2 - Handle missing or invalid campaign parameters gracefully
 */

export interface CampaignData {
  campaignId?: string;
  source: 'facebook' | 'google' | 'direct';
  utmParams: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
  };
  landingTime: Date;
  isValid: boolean;
  errors: string[];
}

export interface ParsedUrlParams {
  campaignId?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
}

/**
 * Default campaign data for fallback scenarios
 */
const DEFAULT_CAMPAIGN_DATA: CampaignData = {
  campaignId: undefined,
  source: 'direct',
  utmParams: {},
  landingTime: new Date(),
  isValid: true,
  errors: [],
};

/**
 * Safely parse URL search parameters with error handling
 */
function safeParseUrlParams(search: string): URLSearchParams {
  try {
    // Handle empty or malformed search strings
    if (!search || typeof search !== 'string') {
      return new URLSearchParams();
    }

    // Remove leading '?' if present
    const cleanSearch = search.startsWith('?') ? search.substring(1) : search;

    // Handle malformed URL encoding
    try {
      return new URLSearchParams(cleanSearch);
    } catch (encodingError) {
      console.warn('URL parameter encoding error, attempting manual parsing:', encodingError);

      // Manual parsing as fallback
      const params = new URLSearchParams();
      const pairs = cleanSearch.split('&');

      for (const pair of pairs) {
        const [key, value] = pair.split('=');
        if (key && value) {
          try {
            params.set(decodeURIComponent(key), decodeURIComponent(value));
          } catch (decodeError) {
            // Skip malformed parameters
            console.warn(`Skipping malformed parameter: ${pair}`, decodeError);
          }
        }
      }

      return params;
    }
  } catch (error) {
    console.warn('Failed to parse URL parameters, using empty params:', error);
    return new URLSearchParams();
  }
}

/**
 * Safely extract campaign ID from URL path with error handling
 */
function safeExtractCampaignId(pathname: string, urlParams: URLSearchParams): string | undefined {
  try {
    if (!pathname || typeof pathname !== 'string') {
      return urlParams.get('campaign') || undefined;
    }

    const pathSegments = pathname.split('/').filter(segment => segment.length > 0);
    const lastSegment = pathSegments[pathSegments.length - 1];

    // Validate campaign ID format (alphanumeric, hyphens, underscores only)
    if (lastSegment && /^[a-zA-Z0-9_-]+$/.test(lastSegment)) {
      // Don't treat common path segments as campaign IDs
      const commonPaths = ['reduce-payments', 'calculator', 'mortgage', 'index', 'home'];
      if (!commonPaths.includes(lastSegment.toLowerCase())) {
        return lastSegment;
      }
    }

    // Fall back to query parameter
    const queryCampaignId = urlParams.get('campaign');
    if (queryCampaignId && /^[a-zA-Z0-9_-]+$/.test(queryCampaignId)) {
      return queryCampaignId;
    }

    return undefined;
  } catch (error) {
    console.warn('Error extracting campaign ID from path:', error);
    return urlParams.get('campaign') || undefined;
  }
}

/**
 * Determine campaign source with fallback logic
 */
function determineCampaignSource(utmSource?: string): 'facebook' | 'google' | 'direct' {
  if (!utmSource || typeof utmSource !== 'string') {
    return 'direct';
  }

  const source = utmSource.toLowerCase().trim();

  if (source === 'facebook' || source === 'fb') {
    return 'facebook';
  }

  if (source === 'google' || source === 'googleads' || source === 'google-ads') {
    return 'google';
  }

  return 'direct';
}

/**
 * Validate UTM parameter values
 */
function validateUtmParam(value: string | null): string | undefined {
  if (!value || typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();

  // Reject empty strings or strings that are too long
  if (trimmed.length === 0 || trimmed.length > 200) {
    return undefined;
  }

  // Basic sanitization - remove potentially harmful characters
  const sanitized = trimmed.replace(/[<>\"']/g, '');

  return sanitized || undefined;
}

/**
 * Parse campaign parameters from URL with comprehensive error handling
 * 
 * @param search - URL search string (e.g., "?utm_source=facebook&utm_campaign=test")
 * @param pathname - URL pathname (e.g., "/reduce-payments/campaign123")
 * @returns Parsed campaign data with error information
 */
export function parseCampaignParams(search: string, pathname: string): ParsedUrlParams {
  const errors: string[] = [];

  try {
    const urlParams = safeParseUrlParams(search);
    const campaignId = safeExtractCampaignId(pathname, urlParams);

    // Validate and extract UTM parameters
    const utmSource = validateUtmParam(urlParams.get('utm_source'));
    const utmMedium = validateUtmParam(urlParams.get('utm_medium'));
    const utmCampaign = validateUtmParam(urlParams.get('utm_campaign'));
    const utmContent = validateUtmParam(urlParams.get('utm_content'));
    const utmTerm = validateUtmParam(urlParams.get('utm_term'));

    // Log warnings for invalid parameters
    if (urlParams.get('utm_source') && !utmSource) {
      errors.push('Invalid utm_source parameter');
    }
    if (urlParams.get('utm_medium') && !utmMedium) {
      errors.push('Invalid utm_medium parameter');
    }
    if (urlParams.get('utm_campaign') && !utmCampaign) {
      errors.push('Invalid utm_campaign parameter');
    }

    return {
      campaignId,
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
      utmTerm,
    };
  } catch (error) {
    console.error('Critical error parsing campaign parameters:', error);
    errors.push(`Parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`);

    // Return empty params on critical error
    return {
      campaignId: undefined,
      utmSource: undefined,
      utmMedium: undefined,
      utmCampaign: undefined,
      utmContent: undefined,
      utmTerm: undefined,
    };
  }
}

/**
 * Create campaign data with comprehensive error handling and fallback behavior
 * 
 * @param search - URL search string
 * @param pathname - URL pathname
 * @returns Complete campaign data with validation status
 */
export function createCampaignData(search?: string, pathname?: string): CampaignData {
  const errors: string[] = [];

  try {
    // Provide defaults for missing parameters
    const safeSearch = search || '';
    const safePathname = pathname || '/';

    const parsedParams = parseCampaignParams(safeSearch, safePathname);
    const source = determineCampaignSource(parsedParams.utmSource);

    // Determine if this is a valid campaign
    const hasValidCampaignData = !!(
      parsedParams.campaignId ||
      parsedParams.utmSource ||
      parsedParams.utmCampaign
    );

    if (!hasValidCampaignData) {
      errors.push('No campaign data detected - using default single-track experience');
    }

    const campaignData: CampaignData = {
      campaignId: parsedParams.campaignId,
      source,
      utmParams: {
        utm_source: parsedParams.utmSource,
        utm_medium: parsedParams.utmMedium,
        utm_campaign: parsedParams.utmCampaign,
        utm_content: parsedParams.utmContent,
        utm_term: parsedParams.utmTerm,
      },
      landingTime: new Date(),
      isValid: hasValidCampaignData,
      errors,
    };

    // Log campaign data creation for debugging
    if (errors.length > 0) {
      console.warn('Campaign data created with warnings:', { campaignData, errors });
    } else {
      console.log('Campaign data created successfully:', campaignData);
    }

    return campaignData;
  } catch (error) {
    console.error('Critical error creating campaign data, using defaults:', error);

    return {
      ...DEFAULT_CAMPAIGN_DATA,
      errors: [`Critical error: ${error instanceof Error ? error.message : 'Unknown error'}`],
      isValid: false,
    };
  }
}

/**
 * Get default single-track experience when campaign data is unavailable
 */
export function getDefaultSingleTrackExperience(): CampaignData {
  return {
    ...DEFAULT_CAMPAIGN_DATA,
    errors: ['Using default single-track experience - no campaign data available'],
    isValid: true, // Still valid for single-track experience
  };
}

/**
 * Validate campaign data and provide fallback if needed
 */
export function validateAndFallbackCampaignData(campaignData: Partial<CampaignData>): CampaignData {
  try {
    const errors: string[] = campaignData.errors || [];

    // Validate source first
    let source = campaignData.source || 'direct';
    if (!['facebook', 'google', 'direct'].includes(source)) {
      source = 'direct';
      errors.push('Invalid source, defaulted to direct');
    }

    // Valid keys for UTM params
    const validUtmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

    // Validate UTM params structure and filter keys
    let utmParams: Record<string, string | undefined> = {};
    if (typeof campaignData.utmParams === 'object' && campaignData.utmParams !== null) {
      // Only copy valid keys
      validUtmKeys.forEach(key => {
        if (key in campaignData.utmParams!) {
          utmParams[key] = (campaignData.utmParams as any)[key];
        }
      });
    } else {
      errors.push('Invalid UTM params, using empty object');
    }

    // Ensure required fields are present
    const validatedData: CampaignData = {
      campaignId: campaignData.campaignId,
      source,
      utmParams: utmParams as any,
      landingTime: campaignData.landingTime || new Date(),
      isValid: campaignData.isValid !== false,
      errors,
    };

    return validatedData;
  } catch (error) {
    console.error('Error validating campaign data, using defaults:', error);
    return getDefaultSingleTrackExperience();
  }
}

/**
 * Parse campaign data from current browser location
 * Safe to use in browser environments with comprehensive error handling
 */
export function parseCampaignDataFromLocation(): CampaignData {
  try {
    if (typeof window === 'undefined' || !window.location) {
      console.warn('Browser location not available, using default campaign data');
      return getDefaultSingleTrackExperience();
    }

    return createCampaignData(window.location.search, window.location.pathname);
  } catch (error) {
    console.error('Error parsing campaign data from location:', error);
    return getDefaultSingleTrackExperience();
  }
}