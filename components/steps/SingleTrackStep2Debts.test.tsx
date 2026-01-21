import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SingleTrackStep2Debts } from './SingleTrackStep2Debts';
import { SingleTrackFormProvider } from '../../context/SingleTrackFormContext';

// Mock the utils/api module to prevent actual API calls during tests
jest.mock('../../utils/api', () => ({
  trackEvent: jest.fn().mockResolvedValue(undefined),
}));

// Test wrapper component that provides the required context
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SingleTrackFormProvider>
      {children}
    </SingleTrackFormProvider>
  );
};

describe('SingleTrackStep2Debts', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('renders the debt collection step with correct title', () => {
    render(
      <TestWrapper>
        <SingleTrackStep2Debts />
      </TestWrapper>
    );

    expect(screen.getByText('נבדוק את המצב הכספי הנוכחי')).toBeInTheDocument();
    expect(screen.getByText('יתרת משכנתא נוכחית')).toBeInTheDocument();
  });

  it('displays mortgage balance input with default value', () => {
    render(
      <TestWrapper>
        <SingleTrackStep2Debts />
      </TestWrapper>
    );

    const mortgageInput = screen.getByPlaceholderText('1,200,000');
    expect(mortgageInput).toBeInTheDocument();
    expect(mortgageInput).toHaveValue('1,200,000'); // Default value from context
  });

  it('shows other loans section when user selects yes', async () => {
    render(
      <TestWrapper>
        <SingleTrackStep2Debts />
      </TestWrapper>
    );

    // Find the "כן" button for other loans using getByRole
    const yesButtons = screen.getAllByRole('button', { name: 'כן' });
    const otherLoansYesButton = yesButtons[0]; // First "כן" button is for other loans
    
    fireEvent.click(otherLoansYesButton);

    await waitFor(() => {
      expect(screen.getByText('סך כל ההלוואות האחרות')).toBeInTheDocument();
      expect(screen.getByText('נאחד את כל החובות למשכנתא אחת בריבית נמוכה יותר')).toBeInTheDocument();
    });
  });

  it('shows bank overdraft section when user selects yes', async () => {
    render(
      <TestWrapper>
        <SingleTrackStep2Debts />
      </TestWrapper>
    );

    // Find the "כן" button for bank overdraft using getByRole
    const yesButtons = screen.getAllByRole('button', { name: 'כן' });
    const bankOverdraftYesButton = yesButtons[1]; // Second "כן" button is for bank overdraft
    
    fireEvent.click(bankOverdraftYesButton);

    await waitFor(() => {
      expect(screen.getByText('סכום המינוס הממוצע')).toBeInTheDocument();
      expect(screen.getByText('חובות בריבית גבוהה שכדאי לאחד למשכנתא')).toBeInTheDocument();
    });
  });

  it('validates required mortgage balance field', async () => {
    render(
      <TestWrapper>
        <SingleTrackStep2Debts />
      </TestWrapper>
    );

    // Clear the mortgage balance input
    const mortgageInput = screen.getByPlaceholderText('1,200,000');
    fireEvent.change(mortgageInput, { target: { value: '' } });

    // Try to proceed to next step
    const nextButton = screen.getByText('המשך לחישוב');
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getAllByText('נא להזין יתרת משכנתא')).toHaveLength(2); // One in input error, one in summary
    });
  });

  it('updates form data when mortgage balance is changed', async () => {
    render(
      <TestWrapper>
        <SingleTrackStep2Debts />
      </TestWrapper>
    );

    const mortgageInput = screen.getByPlaceholderText('1,200,000');
    fireEvent.change(mortgageInput, { target: { value: '1,500,000' } });

    await waitFor(() => {
      expect(mortgageInput).toHaveValue('1,500,000');
    });
  });

  it('handles other loans amount input correctly', async () => {
    render(
      <TestWrapper>
        <SingleTrackStep2Debts />
      </TestWrapper>
    );

    // Enable other loans section
    const yesButtons = screen.getAllByRole('button', { name: 'כן' });
    const otherLoansYesButton = yesButtons[0];
    fireEvent.click(otherLoansYesButton);

    await waitFor(() => {
      const otherLoansInput = screen.getByPlaceholderText('150,000');
      expect(otherLoansInput).toBeInTheDocument();
      
      fireEvent.change(otherLoansInput, { target: { value: '200,000' } });
      expect(otherLoansInput).toHaveValue('200,000');
    });
  });

  it('handles bank overdraft amount input correctly', async () => {
    render(
      <TestWrapper>
        <SingleTrackStep2Debts />
      </TestWrapper>
    );

    // Enable bank overdraft section
    const yesButtons = screen.getAllByRole('button', { name: 'כן' });
    const bankOverdraftYesButton = yesButtons[1];
    fireEvent.click(bankOverdraftYesButton);

    await waitFor(() => {
      const overdraftInput = screen.getByPlaceholderText('5,000');
      expect(overdraftInput).toBeInTheDocument();
      
      fireEvent.change(overdraftInput, { target: { value: '10,000' } });
      expect(overdraftInput).toHaveValue('10,000');
    });
  });

  it('displays tooltips for input fields', () => {
    render(
      <TestWrapper>
        <SingleTrackStep2Debts />
      </TestWrapper>
    );

    // Check for tooltip icons
    const tooltipIcons = screen.getAllByRole('button', { name: /Show tooltip/i });
    expect(tooltipIcons.length).toBeGreaterThan(0);
  });

  it('uses single-track specific styling and content', () => {
    render(
      <TestWrapper>
        <SingleTrackStep2Debts />
      </TestWrapper>
    );

    // Check for single-track specific content (these texts appear when sections are expanded)
    expect(screen.getByText('המשך לחישוב')).toBeInTheDocument();
    expect(screen.getByText('נבדוק את המצב הכספי הנוכחי')).toBeInTheDocument();
    
    // Check for blue styling (single-track uses blue theme)
    const title = screen.getByText('נבדוק את המצב הכספי הנוכחי');
    expect(title).toHaveClass('text-blue-600');
  });

  it('clears validation errors when user starts typing', async () => {
    render(
      <TestWrapper>
        <SingleTrackStep2Debts />
      </TestWrapper>
    );

    // Clear mortgage balance to trigger validation error
    const mortgageInput = screen.getByPlaceholderText('1,200,000');
    fireEvent.change(mortgageInput, { target: { value: '' } });

    // Try to proceed to trigger validation
    const nextButton = screen.getByText('המשך לחישוב');
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getAllByText('נא להזין יתרת משכנתא')).toHaveLength(2);
    });

    // Start typing to clear error
    fireEvent.change(mortgageInput, { target: { value: '1000000' } });

    await waitFor(() => {
      expect(screen.queryAllByText('נא להזין יתרת משכנתא')).toHaveLength(0);
    });
  });

  it('maintains toggle state when switching between yes/no options', async () => {
    render(
      <TestWrapper>
        <SingleTrackStep2Debts />
      </TestWrapper>
    );

    // Test other loans toggle
    const yesButtons = screen.getAllByRole('button', { name: 'כן' });
    const noButtons = screen.getAllByRole('button', { name: 'לא' });
    const otherLoansYesButton = yesButtons[0];
    const otherLoansNoButton = noButtons[0];

    // Click yes, then no, then yes again
    fireEvent.click(otherLoansYesButton);
    await waitFor(() => {
      expect(screen.getByText('סך כל ההלוואות האחרות')).toBeInTheDocument();
    });

    fireEvent.click(otherLoansNoButton);
    await waitFor(() => {
      expect(screen.queryByText('סך כל ההלוואות האחרות')).not.toBeInTheDocument();
    });

    fireEvent.click(otherLoansYesButton);
    await waitFor(() => {
      expect(screen.getByText('סך כל ההלוואות האחרות')).toBeInTheDocument();
    });
  });
});