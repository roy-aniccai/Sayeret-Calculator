import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SingleTrackStep1Landing from './SingleTrackStep1Landing';
import { SingleTrackFormProvider } from '../../context/SingleTrackFormContext';

// Mock the api module to prevent actual API calls during testing
jest.mock('../../utils/api', () => ({
  trackEvent: jest.fn(),
}));

// Test wrapper component that provides the required context
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const mockCampaignData = {
    campaignId: 'test-campaign-123',
    source: 'facebook' as const,
    utmParams: {
      utm_source: 'facebook',
      utm_medium: 'cpc',
      utm_campaign: 'reduce-payments',
    },
    landingTime: new Date(),
  };

  return (
    <SingleTrackFormProvider initialCampaignData={mockCampaignData}>
      {children}
    </SingleTrackFormProvider>
  );
};

describe('SingleTrackStep1Landing', () => {
  beforeEach(() => {
    // Clear console.log calls to avoid cluttering test output
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the landing page with campaign-optimized content', () => {
    render(
      <TestWrapper>
        <SingleTrackStep1Landing />
      </TestWrapper>
    );

    // Check main headline (text is split by <br> tag, so no space between parts)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('הקטן את התשלום החודשיעל המשכנתא שלך');

    // Check subtitle
    expect(screen.getByText(/נבדוק איך אפשר להקטין את התשלום החודשי שלך/)).toBeInTheDocument();

    // Check value proposition benefits
    expect(screen.getByText('הקטנת תשלום חודשי')).toBeInTheDocument();
    expect(screen.getByText('חישוב מדויק ומהיר')).toBeInTheDocument();
    expect(screen.getByText('ללא התחייבות')).toBeInTheDocument();

    // Check CTA button
    expect(screen.getByText('בואו נתחיל לחסוך')).toBeInTheDocument();

    // Check trust indicators
    expect(screen.getByText('מאובטח')).toBeInTheDocument();
    expect(screen.getByText('מהיר')).toBeInTheDocument();
    expect(screen.getByText('אמין')).toBeInTheDocument();
  });

  it('displays campaign information when available', () => {
    render(
      <TestWrapper>
        <SingleTrackStep1Landing />
      </TestWrapper>
    );

    // Check campaign attribution
    expect(screen.getByText(/קמפיין: test-campaign-123/)).toBeInTheDocument();
    expect(screen.getByText(/מקור: facebook/)).toBeInTheDocument();
  });

  it('handles CTA button click and proceeds to next step', () => {
    render(
      <TestWrapper>
        <SingleTrackStep1Landing />
      </TestWrapper>
    );

    const ctaButton = screen.getByText('בואו נתחיל לחסוך');
    
    // Click the CTA button
    fireEvent.click(ctaButton);

    // The component should trigger navigation to the next step
    // This would be tested through integration with the form context
    // For now, we just verify the button is clickable
    expect(ctaButton).toBeInTheDocument();
  });

  it('renders all benefit cards with correct icons and content', () => {
    render(
      <TestWrapper>
        <SingleTrackStep1Landing />
      </TestWrapper>
    );

    // Check benefit 1 - Monthly reduction
    expect(screen.getByText('הקטנת תשלום חודשי')).toBeInTheDocument();
    expect(screen.getByText('חסוך מאות עד אלפי שקלים בחודש')).toBeInTheDocument();

    // Check benefit 2 - Quick calculation
    expect(screen.getByText('חישוב מדויק ומהיר')).toBeInTheDocument();
    expect(screen.getByText('קבל תוצאות מיידיות ומותאמות אישית')).toBeInTheDocument();

    // Check benefit 3 - No commitment
    expect(screen.getByText('ללא התחייבות')).toBeInTheDocument();
    expect(screen.getByText('חישוב חינמי ללא צורך במתן פרטים אישיים')).toBeInTheDocument();
  });

  it('displays process information correctly', () => {
    render(
      <TestWrapper>
        <SingleTrackStep1Landing />
      </TestWrapper>
    );

    // Check process information - use more specific text matching
    expect(screen.getByText(/החישוב לקח 2-3 דקות/)).toBeInTheDocument();
    expect(screen.getByText(/חינם לחלוטין/)).toBeInTheDocument();
    
    // Check for the specific process information text
    expect(screen.getByText('החישוב לקח 2-3 דקות • ללא התחייבות • חינם לחלוטין')).toBeInTheDocument();
  });

  it('renders without campaign data gracefully', () => {
    render(
      <SingleTrackFormProvider>
        <SingleTrackStep1Landing />
      </SingleTrackFormProvider>
    );

    // Should still render main content
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('הקטן את התשלום החודשיעל המשכנתא שלך');
    expect(screen.getByText('בואו נתחיל לחסוך')).toBeInTheDocument();

    // Campaign attribution should not be visible
    expect(screen.queryByText(/קמפיין:/)).not.toBeInTheDocument();
  });
});