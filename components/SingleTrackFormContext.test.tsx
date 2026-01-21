import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { SingleTrackFormProvider, useSingleTrackForm } from '../context/SingleTrackFormContext';
import { TrackType } from '../types';

// Test component that uses the single track form context
const TestComponent: React.FC = () => {
  const {
    step,
    formData,
    nextStep,
    prevStep,
    resetForm,
    updateFormData,
    getTrack,
    isMonthlyReductionTrack,
    campaignData,
    trackCampaignEvent,
    trackConversion,
  } = useSingleTrackForm();

  return (
    <div>
      <div data-testid="step">{step}</div>
      <div data-testid="track">{getTrack()}</div>
      <div data-testid="is-monthly-reduction">{isMonthlyReductionTrack().toString()}</div>
      <div data-testid="mortgage-balance">{formData.mortgageBalance}</div>
      <div data-testid="campaign-id">{campaignData?.campaignId || 'none'}</div>
      <div data-testid="landing-viewed">{formData.landingPageViewed?.toString()}</div>
      
      <button data-testid="next-step" onClick={nextStep}>Next</button>
      <button data-testid="prev-step" onClick={prevStep}>Previous</button>
      <button data-testid="reset-form" onClick={resetForm}>Reset</button>
      <button 
        data-testid="update-data" 
        onClick={() => updateFormData({ mortgageBalance: 1500000 })}
      >
        Update Data
      </button>
      <button 
        data-testid="track-event" 
        onClick={() => trackCampaignEvent('test_event', { test: true })}
      >
        Track Event
      </button>
      <button 
        data-testid="track-conversion" 
        onClick={() => trackConversion('test_conversion', { test: true })}
      >
        Track Conversion
      </button>
    </div>
  );
};

describe('SingleTrackFormContext', () => {
  beforeEach(() => {
    // Mock crypto.randomUUID
    Object.defineProperty(global, 'crypto', {
      value: {
        randomUUID: () => 'test-session-id',
      },
      writable: true,
    });

    // Mock console.log to avoid noise in tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should initialize with default values', () => {
    render(
      <SingleTrackFormProvider>
        <TestComponent />
      </SingleTrackFormProvider>
    );

    expect(screen.getByTestId('step')).toHaveTextContent('1');
    expect(screen.getByTestId('track')).toHaveTextContent(TrackType.MONTHLY_REDUCTION);
    expect(screen.getByTestId('is-monthly-reduction')).toHaveTextContent('true');
    expect(screen.getByTestId('mortgage-balance')).toHaveTextContent('1200000');
  });

  it('should parse campaign data from URL parameters', async () => {
    const testCampaignData = {
      campaignId: 'test123',
      source: 'facebook' as const,
      utmParams: {
        utm_source: 'facebook',
        utm_campaign: 'test-campaign',
      },
      landingTime: new Date(),
    };

    render(
      <SingleTrackFormProvider initialCampaignData={testCampaignData}>
        <TestComponent />
      </SingleTrackFormProvider>
    );

    // Wait for useEffect to run
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(screen.getByTestId('campaign-id')).toHaveTextContent('test123');
  });

  it('should handle step navigation correctly', () => {
    render(
      <SingleTrackFormProvider>
        <TestComponent />
      </SingleTrackFormProvider>
    );

    // Test next step
    fireEvent.click(screen.getByTestId('next-step'));
    expect(screen.getByTestId('step')).toHaveTextContent('2');

    // Test next step again
    fireEvent.click(screen.getByTestId('next-step'));
    expect(screen.getByTestId('step')).toHaveTextContent('3');

    // Test previous step
    fireEvent.click(screen.getByTestId('prev-step'));
    expect(screen.getByTestId('step')).toHaveTextContent('2');

    // Test previous step again
    fireEvent.click(screen.getByTestId('prev-step'));
    expect(screen.getByTestId('step')).toHaveTextContent('1');
  });

  it('should not go below step 1 or above step 6', () => {
    render(
      <SingleTrackFormProvider>
        <TestComponent />
      </SingleTrackFormProvider>
    );

    // Try to go below step 1
    fireEvent.click(screen.getByTestId('prev-step'));
    expect(screen.getByTestId('step')).toHaveTextContent('1');

    // Go to step 6
    for (let i = 0; i < 5; i++) {
      fireEvent.click(screen.getByTestId('next-step'));
    }
    expect(screen.getByTestId('step')).toHaveTextContent('6');

    // Try to go above step 6
    fireEvent.click(screen.getByTestId('next-step'));
    expect(screen.getByTestId('step')).toHaveTextContent('6');
  });

  it('should update form data correctly', () => {
    render(
      <SingleTrackFormProvider>
        <TestComponent />
      </SingleTrackFormProvider>
    );

    fireEvent.click(screen.getByTestId('update-data'));
    expect(screen.getByTestId('mortgage-balance')).toHaveTextContent('1500000');
  });

  it('should reset form while preserving campaign data', async () => {
    const testCampaignData = {
      campaignId: 'test123',
      source: 'facebook' as const,
      utmParams: {
        utm_source: 'facebook',
        utm_campaign: 'test-campaign',
      },
      landingTime: new Date(),
    };

    render(
      <SingleTrackFormProvider initialCampaignData={testCampaignData}>
        <TestComponent />
      </SingleTrackFormProvider>
    );

    // Wait for initial campaign data parsing
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Navigate to step 3 and update data
    fireEvent.click(screen.getByTestId('next-step'));
    fireEvent.click(screen.getByTestId('next-step'));
    fireEvent.click(screen.getByTestId('update-data'));

    expect(screen.getByTestId('step')).toHaveTextContent('3');
    expect(screen.getByTestId('mortgage-balance')).toHaveTextContent('1500000');

    // Reset form
    fireEvent.click(screen.getByTestId('reset-form'));

    expect(screen.getByTestId('step')).toHaveTextContent('1');
    expect(screen.getByTestId('mortgage-balance')).toHaveTextContent('1200000');
    expect(screen.getByTestId('campaign-id')).toHaveTextContent('test123'); // Campaign data preserved
  });

  it('should always return monthly reduction track', () => {
    render(
      <SingleTrackFormProvider>
        <TestComponent />
      </SingleTrackFormProvider>
    );

    expect(screen.getByTestId('track')).toHaveTextContent(TrackType.MONTHLY_REDUCTION);
    expect(screen.getByTestId('is-monthly-reduction')).toHaveTextContent('true');
  });

  it('should handle missing campaign data gracefully', () => {
    render(
      <SingleTrackFormProvider>
        <TestComponent />
      </SingleTrackFormProvider>
    );

    expect(screen.getByTestId('campaign-id')).toHaveTextContent('none');
  });

  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useSingleTrackForm must be used within a SingleTrackFormProvider');

    consoleSpy.mockRestore();
  });

  it('should track campaign events', () => {
    const consoleSpy = jest.spyOn(console, 'log');

    render(
      <SingleTrackFormProvider>
        <TestComponent />
      </SingleTrackFormProvider>
    );

    fireEvent.click(screen.getByTestId('track-event'));

    expect(consoleSpy).toHaveBeenCalledWith(
      'Single Track Campaign Event:',
      expect.objectContaining({
        eventType: 'test_event',
        track: TrackType.MONTHLY_REDUCTION,
        test: true,
      })
    );
  });

  it('should track conversion events', () => {
    const consoleSpy = jest.spyOn(console, 'log');

    render(
      <SingleTrackFormProvider>
        <TestComponent />
      </SingleTrackFormProvider>
    );

    fireEvent.click(screen.getByTestId('track-conversion'));

    expect(consoleSpy).toHaveBeenCalledWith(
      'Single Track Conversion:',
      expect.objectContaining({
        eventType: 'single_track_conversion',
        conversionType: 'test_conversion',
        track: TrackType.MONTHLY_REDUCTION,
        test: true,
      })
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      'Single Track Campaign Event:',
      expect.objectContaining({
        eventType: 'single_track_conversion',
        conversionType: 'test_conversion',
        track: TrackType.MONTHLY_REDUCTION,
        test: true,
      })
    );
  });
});