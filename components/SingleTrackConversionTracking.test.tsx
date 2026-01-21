import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SingleTrackFormProvider } from '../context/SingleTrackFormContext';
import { SingleTrackStep5Contact } from './steps/SingleTrackStep5Contact';
import { SingleTrackStep6Simulator } from './steps/SingleTrackStep6Simulator';
import { TrackType } from '../types';

// Mock the API module
jest.mock('../utils/api', () => ({
  submitData: jest.fn().mockResolvedValue({ success: true }),
  trackEvent: jest.fn().mockResolvedValue(undefined),
}));

describe('Single Track Conversion Tracking', () => {
  beforeEach(() => {
    // Mock crypto.randomUUID
    Object.defineProperty(global, 'crypto', {
      value: {
        randomUUID: () => 'test-session-id',
      },
      writable: true,
    });

    // Mock console.log to capture tracking events
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should track lead_submission conversion when contact form is submitted', async () => {
    const consoleSpy = jest.spyOn(console, 'log');

    render(
      <SingleTrackFormProvider>
        <SingleTrackStep5Contact />
      </SingleTrackFormProvider>
    );

    // Fill out the form
    fireEvent.change(screen.getByPlaceholderText('ישראל ישראלי'), {
      target: { value: 'ישראל ישראלי' }
    });
    fireEvent.change(screen.getByPlaceholderText('050-1234567'), {
      target: { value: '0501234567' }
    });

    // Submit the form
    fireEvent.click(screen.getByText('בואו נראה!'));

    // Wait for async operations
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Single Track Conversion:',
        expect.objectContaining({
          eventType: 'single_track_conversion',
          conversionType: 'lead_submission',
          track: TrackType.MONTHLY_REDUCTION,
          step: 5,
          hasInsuranceInterest: false,
        })
      );
    });
  });

  it('should track flow_completion conversion when simulator loads', async () => {
    const consoleSpy = jest.spyOn(console, 'log');

    render(
      <SingleTrackFormProvider>
        <SingleTrackStep6Simulator />
      </SingleTrackFormProvider>
    );

    // Wait for useEffect to run
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Single Track Conversion:',
        expect.objectContaining({
          eventType: 'single_track_conversion',
          conversionType: 'flow_completion',
          track: TrackType.MONTHLY_REDUCTION,
          step: 6,
        })
      );
    });
  });

  it('should track contact_expert conversion when expert button is clicked', async () => {
    const consoleSpy = jest.spyOn(console, 'log');

    render(
      <SingleTrackFormProvider initialFormData={{ age: 35 }}>
        <SingleTrackStep6Simulator />
      </SingleTrackFormProvider>
    );

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('לשיחה עם המומחים')).toBeInTheDocument();
    });

    // Click the contact expert button
    fireEvent.click(screen.getByText('לשיחה עם המומחים'));

    // Wait for conversion tracking
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Single Track Conversion:',
        expect.objectContaining({
          eventType: 'single_track_conversion',
          conversionType: 'contact_expert',
          track: TrackType.MONTHLY_REDUCTION,
          step: 6,
        })
      );
    });
  });

  it('should include campaign data in conversion events when available', async () => {
    const consoleSpy = jest.spyOn(console, 'log');
    const testCampaignData = {
      campaignId: 'test-campaign-123',
      source: 'facebook' as const,
      utmParams: {
        utm_source: 'facebook',
        utm_campaign: 'test-campaign',
        utm_medium: 'cpc',
      },
      landingTime: new Date(),
    };

    render(
      <SingleTrackFormProvider initialCampaignData={testCampaignData}>
        <SingleTrackStep6Simulator />
      </SingleTrackFormProvider>
    );

    // Wait for conversion tracking
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Single Track Conversion:',
        expect.objectContaining({
          eventType: 'single_track_conversion',
          conversionType: 'flow_completion',
          track: TrackType.MONTHLY_REDUCTION,
          campaignData: expect.objectContaining({
            campaignId: 'test-campaign-123',
            source: 'facebook',
            utmParams: expect.objectContaining({
              utm_source: 'facebook',
              utm_campaign: 'test-campaign',
              utm_medium: 'cpc',
            }),
          }),
        })
      );
    });
  });

  it('should include form data in conversion events', async () => {
    const consoleSpy = jest.spyOn(console, 'log');

    render(
      <SingleTrackFormProvider 
        initialFormData={{ 
          leadName: 'ישראל ישראלי',
          leadPhone: '0501234567',
          mortgageBalance: 1500000,
          propertyValue: 3000000,
        }}
      >
        <SingleTrackStep6Simulator />
      </SingleTrackFormProvider>
    );

    // Wait for conversion tracking
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Single Track Conversion:',
        expect.objectContaining({
          eventType: 'single_track_conversion',
          conversionType: 'flow_completion',
          formData: expect.objectContaining({
            leadName: 'ישראל ישראלי',
            leadPhone: '0501234567',
            mortgageBalance: 1500000,
            propertyValue: 3000000,
          }),
        })
      );
    });
  });

  it('should track multiple conversion types in a single session', async () => {
    const consoleSpy = jest.spyOn(console, 'log');

    const { rerender } = render(
      <SingleTrackFormProvider>
        <SingleTrackStep5Contact />
      </SingleTrackFormProvider>
    );

    // Submit contact form (lead_submission conversion)
    fireEvent.change(screen.getByPlaceholderText('ישראל ישראלי'), {
      target: { value: 'ישראל ישראלי' }
    });
    fireEvent.change(screen.getByPlaceholderText('050-1234567'), {
      target: { value: '0501234567' }
    });
    fireEvent.click(screen.getByText('בואו נראה!'));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Single Track Conversion:',
        expect.objectContaining({
          conversionType: 'lead_submission',
        })
      );
    });

    // Navigate to simulator (flow_completion conversion)
    rerender(
      <SingleTrackFormProvider>
        <SingleTrackStep6Simulator />
      </SingleTrackFormProvider>
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Single Track Conversion:',
        expect.objectContaining({
          conversionType: 'flow_completion',
        })
      );
    });

    // Verify both conversions were tracked
    const conversionCalls = consoleSpy.mock.calls.filter(call => 
      call[0] === 'Single Track Conversion:'
    );
    expect(conversionCalls).toHaveLength(2);
    
    const conversionTypes = conversionCalls.map(call => call[1].conversionType);
    expect(conversionTypes).toContain('lead_submission');
    expect(conversionTypes).toContain('flow_completion');
  });
});