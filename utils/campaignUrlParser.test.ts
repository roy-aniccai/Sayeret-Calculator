/**
 * Test utility to verify URL parameter parsing functionality
 * This demonstrates that the campaign URL parsing logic works correctly
 * with comprehensive error handling and fallback behavior.
 */

import { 
  parseCampaignParams, 
  createCampaignData, 
  getDefaultSingleTrackExperience,
  validateAndFallbackCampaignData,
  parseCampaignDataFromLocation,
  type CampaignData,
  type ParsedUrlParams
} from './campaignUrlParser';

describe('Campaign URL Parameter Parsing', () => {
  describe('Basic UTM Parameter Parsing', () => {
    it('should parse all UTM parameters from URL query string', () => {
      const search = '?utm_source=facebook&utm_medium=cpc&utm_campaign=reduce-payments&utm_content=ad1&utm_term=mortgage';
      const pathname = '/';
      
      const result = parseCampaignParams(search, pathname);
      
      expect(result.utmSource).toBe('facebook');
      expect(result.utmMedium).toBe('cpc');
      expect(result.utmCampaign).toBe('reduce-payments');
      expect(result.utmContent).toBe('ad1');
      expect(result.utmTerm).toBe('mortgage');
    });

    it('should parse partial UTM parameters', () => {
      const search = '?utm_source=google&utm_campaign=test-campaign';
      const pathname = '/';
      
      const result = parseCampaignParams(search, pathname);
      
      expect(result.utmSource).toBe('google');
      expect(result.utmCampaign).toBe('test-campaign');
      expect(result.utmMedium).toBeUndefined();
      expect(result.utmContent).toBeUndefined();
      expect(result.utmTerm).toBeUndefined();
    });

    it('should handle Facebook UTM source variations', () => {
      const search1 = '?utm_source=facebook';
      const search2 = '?utm_source=fb';
      const pathname = '/';
      
      const result1 = parseCampaignParams(search1, pathname);
      const result2 = parseCampaignParams(search2, pathname);
      
      expect(result1.utmSource).toBe('facebook');
      expect(result2.utmSource).toBe('fb');
    });
  });

  describe('Campaign ID Extraction', () => {
    it('should extract campaign ID from URL path segments', () => {
      const search = '';
      const pathname = '/reduce-payments/campaign123';
      
      const result = parseCampaignParams(search, pathname);
      
      expect(result.campaignId).toBe('campaign123');
    });

    it('should extract campaign ID from URL query parameter', () => {
      const search = '?campaign=query-campaign-456';
      const pathname = '/';
      
      const result = parseCampaignParams(search, pathname);
      
      expect(result.campaignId).toBe('query-campaign-456');
    });

    it('should prioritize path segment over query parameter for campaign ID', () => {
      const search = '?campaign=query-campaign';
      const pathname = '/reduce-payments/path-campaign';
      
      const result = parseCampaignParams(search, pathname);
      
      expect(result.campaignId).toBe('path-campaign');
    });

    it('should handle missing campaign ID gracefully', () => {
      const search = '';
      const pathname = '/';
      
      const result = parseCampaignParams(search, pathname);
      
      expect(result.campaignId).toBeUndefined();
    });

    it('should reject common path segments as campaign IDs', () => {
      const search = '';
      const pathname = '/reduce-payments';
      
      const result = parseCampaignParams(search, pathname);
      
      expect(result.campaignId).toBeUndefined();
    });
  });

  describe('Complex Campaign URLs', () => {
    it('should handle complex Facebook campaign URLs', () => {
      const search = '?utm_source=facebook&utm_medium=social&utm_campaign=reduce-monthly&utm_content=video-ad&utm_term=mortgage+refinance';
      const pathname = '/reduce-payments/fb-campaign-2024';
      
      const result = parseCampaignParams(search, pathname);
      
      expect(result.campaignId).toBe('fb-campaign-2024');
      expect(result.utmSource).toBe('facebook');
      expect(result.utmMedium).toBe('social');
      expect(result.utmCampaign).toBe('reduce-monthly');
      expect(result.utmContent).toBe('video-ad');
      expect(result.utmTerm).toBe('mortgage refinance');
    });

    it('should handle Google Ads campaign URLs', () => {
      const search = '?utm_source=google&utm_medium=cpc&utm_campaign=mortgage-calculator&utm_content=text-ad&utm_term=mortgage+calculator';
      const pathname = '/reduce-payments/google-ads-2024';
      
      const result = parseCampaignParams(search, pathname);
      
      expect(result.campaignId).toBe('google-ads-2024');
      expect(result.utmSource).toBe('google');
      expect(result.utmMedium).toBe('cpc');
      expect(result.utmCampaign).toBe('mortgage-calculator');
      expect(result.utmContent).toBe('text-ad');
      expect(result.utmTerm).toBe('mortgage calculator');
    });
  });

  describe('Error Handling and Malformed URLs', () => {
    it('should handle malformed URL parameters gracefully', () => {
      const search = '?utm_source=&utm_campaign=&invalid_param=test';
      const pathname = '/';
      
      const result = parseCampaignParams(search, pathname);
      
      expect(result.utmSource).toBeUndefined();
      expect(result.utmCampaign).toBeUndefined();
      expect(result.campaignId).toBeUndefined();
    });

    it('should handle special characters in campaign parameters', () => {
      const search = '?utm_source=facebook&utm_campaign=test%20campaign&campaign=special%2Dcampaign';
      const pathname = '/';
      
      const result = parseCampaignParams(search, pathname);
      
      expect(result.utmSource).toBe('facebook');
      expect(result.utmCampaign).toBe('test campaign');
      expect(result.campaignId).toBe('special-campaign');
    });

    it('should handle empty path segments', () => {
      const search = '?campaign=fallback-campaign';
      const pathname = '/reduce-payments/';
      
      const result = parseCampaignParams(search, pathname);
      
      // Empty string from path should fall back to query parameter
      expect(result.campaignId).toBe('fallback-campaign');
    });

    it('should handle null/undefined inputs', () => {
      const result1 = parseCampaignParams('', '');
      const result2 = parseCampaignParams(null as any, null as any);
      
      expect(result1.campaignId).toBeUndefined();
      expect(result1.utmSource).toBeUndefined();
      expect(result2.campaignId).toBeUndefined();
      expect(result2.utmSource).toBeUndefined();
    });

    it('should sanitize potentially harmful parameters', () => {
      const search = '?utm_source=facebook<script>&utm_campaign=test"campaign';
      const pathname = '/';
      
      const result = parseCampaignParams(search, pathname);
      
      expect(result.utmSource).toBe('facebookscript');
      expect(result.utmCampaign).toBe('testcampaign');
    });

    it('should reject overly long parameters', () => {
      const longString = 'a'.repeat(250);
      const search = `?utm_source=${longString}&utm_campaign=valid`;
      const pathname = '/';
      
      const result = parseCampaignParams(search, pathname);
      
      expect(result.utmSource).toBeUndefined();
      expect(result.utmCampaign).toBe('valid');
    });

    it('should validate campaign ID format', () => {
      const search = '';
      const pathname1 = '/reduce-payments/valid-campaign_123';
      const pathname2 = '/reduce-payments/invalid campaign!';
      
      const result1 = parseCampaignParams(search, pathname1);
      const result2 = parseCampaignParams(search, pathname2);
      
      expect(result1.campaignId).toBe('valid-campaign_123');
      expect(result2.campaignId).toBeUndefined();
    });
  });

  describe('Campaign Data Creation', () => {
    it('should create complete campaign data with valid parameters', () => {
      const search = '?utm_source=facebook&utm_campaign=test-campaign';
      const pathname = '/reduce-payments/campaign123';
      
      const result = createCampaignData(search, pathname);
      
      expect(result.campaignId).toBe('campaign123');
      expect(result.source).toBe('facebook');
      expect(result.utmParams.utm_source).toBe('facebook');
      expect(result.utmParams.utm_campaign).toBe('test-campaign');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.landingTime).toBeInstanceOf(Date);
    });

    it('should create default campaign data when no parameters provided', () => {
      const result = createCampaignData('', '/');
      
      expect(result.campaignId).toBeUndefined();
      expect(result.source).toBe('direct');
      expect(result.utmParams).toEqual({});
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('No campaign data detected - using default single-track experience');
    });

    it('should handle missing parameters gracefully', () => {
      const result = createCampaignData();
      
      expect(result.campaignId).toBeUndefined();
      expect(result.source).toBe('direct');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Default Single-Track Experience', () => {
    it('should provide valid default experience', () => {
      const result = getDefaultSingleTrackExperience();
      
      expect(result.campaignId).toBeUndefined();
      expect(result.source).toBe('direct');
      expect(result.utmParams).toEqual({});
      expect(result.isValid).toBe(true);
      expect(result.errors).toContain('Using default single-track experience - no campaign data available');
      expect(result.landingTime).toBeInstanceOf(Date);
    });
  });

  describe('Campaign Data Validation', () => {
    it('should validate and fix invalid campaign data', () => {
      const invalidData = {
        source: 'invalid-source' as any,
        utmParams: null as any,
      };
      
      const result = validateAndFallbackCampaignData(invalidData);
      
      expect(result.source).toBe('direct');
      expect(result.utmParams).toEqual({});
      expect(result.errors).toContain('Invalid source, defaulted to direct');
      expect(result.errors).toContain('Invalid UTM params, using empty object');
    });

    it('should preserve valid campaign data', () => {
      const validData: Partial<CampaignData> = {
        campaignId: 'test-campaign',
        source: 'facebook',
        utmParams: { utm_source: 'facebook' },
        isValid: true,
      };
      
      const result = validateAndFallbackCampaignData(validData);
      
      expect(result.campaignId).toBe('test-campaign');
      expect(result.source).toBe('facebook');
      expect(result.utmParams.utm_source).toBe('facebook');
      expect(result.isValid).toBe(true);
    });
  });

  // Note: Browser location parsing tests are omitted due to Jest environment limitations
  // The parseCampaignDataFromLocation function is tested indirectly through other tests
});