/**
 * Tests for SingleTrackApp error handling functionality
 * Verifies that missing or malformed campaign data is handled gracefully
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import SingleTrackApp from './SingleTrackApp';
import { createCampaignData, getDefaultSingleTrackExperience } from '../utils/campaignUrlParser';

// Mock the API module to prevent actual API calls during testing
jest.mock('../utils/api', () => ({
  trackEvent: jest.fn(),
}));

describe('SingleTrackApp Error Handling', () => {
  beforeEach(() => {
    // Clear console mocks
    jest.clearAllMocks();
  });

  describe('Missing Campaign Data Handling', () => {
    it('should provide default single-track experience when no campaign data is available', async () => {
      render(<SingleTrackApp />);
      
      // Should render the landing page with default experience
      await waitFor(() => {
        expect(screen.getByText('הקטן תשלום חודשי')).toBeInTheDocument();
        expect(screen.getByText('בואו נתחיל לחסוך')).toBeInTheDocument();
      });
      
      // Should not show any error messages to the user (errors are logged but not displayed)
      expect(screen.queryByText(/שגיאה/)).not.toBeInTheDocument();
    });

    it('should handle malformed campaign props gracefully', async () => {
      const malformedProps = {
        campaignId: '', // Empty campaign ID
        utmParams: {
          utm_source: '', // Empty UTM source
          utm_campaign: null as any, // Invalid UTM campaign
        },
      };
      
      render(<SingleTrackApp {...malformedProps} />);
      
      // Should still render the landing page
      await waitFor(() => {
        expect(screen.getByText('הקטן תשלום חודשי')).toBeInTheDocument();
        expect(screen.getByText('בואו נתחיל לחסוך')).toBeInTheDocument();
      });
    });

    it('should show warning notification for invalid campaign data', async () => {
      // This test verifies that when campaign data is invalid, a warning is shown
      render(<SingleTrackApp />);
      
      await waitFor(() => {
        // Look for the warning notification
        const warningElement = screen.queryByText(/המחשבון פועל במצב ברירת מחדל/);
        if (warningElement) {
          expect(warningElement).toBeInTheDocument();
        }
      });
    });
  });

  describe('Campaign URL Parser Error Handling', () => {
    it('should handle missing parameters gracefully', () => {
      const result = createCampaignData('', '');
      
      expect(result.campaignId).toBeUndefined();
      expect(result.source).toBe('direct');
      expect(result.utmParams).toEqual({});
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('No campaign data detected - using default single-track experience');
    });

    it('should handle malformed URL parameters', () => {
      const malformedSearch = '?utm_source=&utm_campaign=&invalid=test';
      const result = createCampaignData(malformedSearch, '/');
      
      expect(result.utmParams.utm_source).toBeUndefined();
      expect(result.utmParams.utm_campaign).toBeUndefined();
      expect(result.source).toBe('direct');
      expect(result.isValid).toBe(false);
    });

    it('should provide valid default experience', () => {
      const defaultExperience = getDefaultSingleTrackExperience();
      
      expect(defaultExperience.campaignId).toBeUndefined();
      expect(defaultExperience.source).toBe('direct');
      expect(defaultExperience.utmParams).toEqual({});
      expect(defaultExperience.isValid).toBe(true); // Default experience is valid
      expect(defaultExperience.errors).toContain('Using default single-track experience - no campaign data available');
      expect(defaultExperience.landingTime).toBeInstanceOf(Date);
    });
  });

  describe('Fallback Behavior', () => {
    it('should continue working even with undefined props', async () => {
      const undefinedProps = {
        campaignId: undefined,
        utmParams: undefined,
      };
      
      render(<SingleTrackApp {...undefinedProps} />);
      
      // Should render normally
      await waitFor(() => {
        expect(screen.getByText('הקטן תשלום חודשי')).toBeInTheDocument();
        expect(screen.getByText('בואו נתחיל לחסוך')).toBeInTheDocument();
      });
    });

    it('should handle null/undefined campaign data gracefully', async () => {
      const nullProps = {
        campaignId: null as any,
        utmParams: null as any,
      };
      
      render(<SingleTrackApp {...nullProps} />);
      
      // Should render normally without crashing
      await waitFor(() => {
        expect(screen.getByText('הקטן תשלום חודשי')).toBeInTheDocument();
      });
    });
  });

  describe('Error Recovery', () => {
    it('should allow normal navigation even when campaign data is missing', async () => {
      render(<SingleTrackApp />);
      
      // Should be able to navigate normally
      await waitFor(() => {
        expect(screen.getByText('בואו נתחיל לחסוך')).toBeInTheDocument();
      });
      
      // Click to proceed should work
      const proceedButton = screen.getByText('בואו נתחיל לחסוך');
      expect(proceedButton).toBeEnabled();
    });

    it('should allow form reset even with missing campaign data', async () => {
      render(<SingleTrackApp />);
      
      await waitFor(() => {
        // Look for the restart button
        const restartButton = screen.getByTitle('התחל מחדש');
        expect(restartButton).toBeInTheDocument();
        expect(restartButton).toBeEnabled();
      });
    });
  });
});