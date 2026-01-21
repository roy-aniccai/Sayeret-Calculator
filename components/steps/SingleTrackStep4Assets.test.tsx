import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SingleTrackStep4Assets } from './SingleTrackStep4Assets';
import { SingleTrackFormProvider } from '../../context/SingleTrackFormContext';

// Mock the helpers module
jest.mock('../../utils/helpers', () => ({
  formatNumberWithCommas: (num: number) => num.toLocaleString(),
  parseFormattedNumber: (str: string) => parseInt(str.replace(/,/g, '')) || 0,
}));

// Mock the api module to prevent actual tracking calls
jest.mock('../../utils/api', () => ({
  trackEvent: jest.fn(),
}));

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode; initialData?: any }> = ({ 
  children, 
  initialData = {} 
}) => (
  <SingleTrackFormProvider>
    {children}
  </SingleTrackFormProvider>
);

describe('SingleTrackStep4Assets', () => {
  beforeEach(() => {
    // Clear console.log calls from campaign tracking
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the assets step with correct title', () => {
    render(
      <TestWrapper>
        <SingleTrackStep4Assets />
      </TestWrapper>
    );

    expect(screen.getByText('פרטים נוספים')).toBeInTheDocument();
  });

  it('displays property value and age input fields', () => {
    render(
      <TestWrapper>
        <SingleTrackStep4Assets />
      </TestWrapper>
    );

    expect(screen.getByText('שווי נכס מוערך היום')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('2,500,000')).toBeInTheDocument();
    expect(screen.getByText('גיל')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('35')).toBeInTheDocument();
  });

  it('shows validation error when required fields are empty', async () => {
    render(
      <TestWrapper>
        <SingleTrackStep4Assets />
      </TestWrapper>
    );

    // Clear the default property value
    const propertyInput = screen.getByPlaceholderText('2,500,000');
    fireEvent.change(propertyInput, { target: { value: '' } });

    // Try to proceed
    const nextButton = screen.getByText(/המשך לחישוב/);
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getAllByText('נא להזין שווי נכס')).toHaveLength(2); // One in input error, one in summary
      expect(screen.getAllByText('נא להזין גיל')).toHaveLength(2); // One in input error, one in summary
    });
  });

  it('validates age input correctly', async () => {
    render(
      <TestWrapper>
        <SingleTrackStep4Assets />
      </TestWrapper>
    );

    const ageInput = screen.getByPlaceholderText('35');
    const nextButton = screen.getByText(/המשך לחישוב/);

    // Test age too low
    fireEvent.change(ageInput, { target: { value: '17' } });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getAllByText('גיל מינימלי: 18 שנים')).toHaveLength(2);
    });

    // Test age too high
    fireEvent.change(ageInput, { target: { value: '121' } });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getAllByText('גיל מקסימלי: 120 שנים')).toHaveLength(2);
    });

    // Test valid age
    fireEvent.change(ageInput, { target: { value: '35' } });
    
    await waitFor(() => {
      expect(screen.queryByText('גיל מינימלי: 18 שנים')).not.toBeInTheDocument();
      expect(screen.queryByText('גיל מקסימלי: 120 שנים')).not.toBeInTheDocument();
    });
  });

  it('does not display LTV ratio in UI', async () => {
    render(
      <TestWrapper>
        <SingleTrackStep4Assets />
      </TestWrapper>
    );

    // Set property value
    const propertyInput = screen.getByPlaceholderText('2,500,000');
    fireEvent.change(propertyInput, { target: { value: '2000000' } });

    await waitFor(() => {
      // Should NOT show LTV display (removed for simplified UI)
      expect(screen.queryByText(/יחס מימון \(LTV\):/)).not.toBeInTheDocument();
      expect(screen.queryByText(/מצוין! יחס מימון נמוך/)).not.toBeInTheDocument();
    });
  });

  it('clears validation errors when user types', async () => {
    render(
      <TestWrapper>
        <SingleTrackStep4Assets />
      </TestWrapper>
    );

    // Clear the property value to trigger error
    const propertyInput = screen.getByPlaceholderText('2,500,000');
    fireEvent.change(propertyInput, { target: { value: '' } });

    // Try to proceed to show error
    const nextButton = screen.getByText(/המשך לחישוב/);
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getAllByText('נא להזין שווי נכס')).toHaveLength(2);
    });

    // Type in the field to clear error
    fireEvent.change(propertyInput, { target: { value: '2000000' } });

    await waitFor(() => {
      expect(screen.queryByText('נא להזין שווי נכס')).not.toBeInTheDocument();
    });
  });

  it('displays CTA with correct messaging', () => {
    render(
      <TestWrapper>
        <SingleTrackStep4Assets />
      </TestWrapper>
    );

    expect(screen.getByText('כמעט סיימנו!')).toBeInTheDocument();
    expect(screen.getByText('עוד כמה פרטים ונוכל לחשב את החיסכון שלך')).toBeInTheDocument();
    expect(screen.getByText(/המשך לחישוב/)).toBeInTheDocument();
  });

  it('uses single-track styling consistently', () => {
    render(
      <TestWrapper>
        <SingleTrackStep4Assets />
      </TestWrapper>
    );

    // Check for blue color scheme (single-track styling)
    const infoIcons = screen.getAllByRole('button', { name: /tooltip/i });
    expect(infoIcons[0].querySelector('i')).toHaveClass('text-blue-400');

    const nextButton = screen.getByText(/המשך לחישוב/);
    expect(nextButton).toHaveClass('bg-blue-600');
  });

  it('formats numbers correctly in input field', async () => {
    render(
      <TestWrapper>
        <SingleTrackStep4Assets />
      </TestWrapper>
    );

    const propertyInput = screen.getByPlaceholderText('2,500,000');
    
    // Input should show formatted default value
    expect(propertyInput).toHaveValue('2,500,000');
  });

  it('shows helper text for both input fields', () => {
    render(
      <TestWrapper>
        <SingleTrackStep4Assets />
      </TestWrapper>
    );

    expect(screen.getByText('ניתן להעריך לפי מחירי שוק או שמאות קודמת')).toBeInTheDocument();
    expect(screen.getByText('גיל בין 18 ל-120 שנים')).toBeInTheDocument();
  });

  it('displays correct icons for input fields', () => {
    render(
      <TestWrapper>
        <SingleTrackStep4Assets />
      </TestWrapper>
    );

    const buildingIcon = screen.getByPlaceholderText('2,500,000')
      .closest('div')?.querySelector('.fa-building');
    
    expect(buildingIcon).toBeInTheDocument();
    expect(buildingIcon).toHaveClass('text-blue-600');

    const userIcon = screen.getByPlaceholderText('35')
      .closest('div')?.querySelector('.fa-user');
    
    expect(userIcon).toBeInTheDocument();
    expect(userIcon).toHaveClass('text-blue-600');
  });
});