import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SingleTrackStep3Payments } from './SingleTrackStep3Payments';
import { SingleTrackFormProvider } from '../../context/SingleTrackFormContext';

// Mock the calculator utilities
jest.mock('../../utils/calculator', () => ({
  calculateRefinancedPayment: jest.fn(() => ({
    breakdown: {
      weightedRate: 0.035
    }
  }))
}));

jest.mock('../../utils/mortgageParams', () => ({
  currentMortgageParams: {
    regulations: {
      maxLoanTermYears: 30,
      minMonthlyPayment: 1000
    }
  },
  calculateMonthlyPayment: jest.fn((amount, rate, term) => {
    // Simple mock calculation
    return Math.round(amount * (rate / 12) / (1 - Math.pow(1 + rate / 12, -term * 12)));
  })
}));

// Mock the API module
jest.mock('../../utils/api', () => ({
  trackEvent: jest.fn()
}));

const renderWithProvider = (initialFormData = {}) => {
  const defaultFormData = {
    step: 3,
    mortgageBalance: 1200000,
    otherLoansBalance: 0,
    mortgagePayment: 6500,
    otherLoansPayment: 0,
    targetTotalPayment: 6500,
    propertyValue: 2500000,
    leadName: '',
    leadPhone: '',
    age: null,
    oneTimePaymentAmount: 0,
    campaignId: undefined,
    utmParams: {},
    landingPageViewed: false,
    ...initialFormData
  };

  return render(
    <SingleTrackFormProvider initialFormData={defaultFormData}>
      <SingleTrackStep3Payments />
    </SingleTrackFormProvider>
  );
};

describe('SingleTrackStep3Payments', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('renders the step title and description', () => {
    renderWithProvider();
    
    expect(screen.getByText('כמה אתה משלם היום?')).toBeInTheDocument();
  });

  it('displays mortgage payment input field', () => {
    renderWithProvider();
    
    expect(screen.getByText('החזר משכנתא חודשי נוכחי')).toBeInTheDocument();
    expect(screen.getByDisplayValue('6,500')).toBeInTheDocument();
  });

  it('displays other loans payment input when user has other loans', () => {
    renderWithProvider({ hasOtherLoans: true });
    
    expect(screen.getByText('החזר הלוואות אחרות חודשי')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('0')).toBeInTheDocument();
  });

  it('hides other loans payment and total when user has no other loans', () => {
    renderWithProvider({ hasOtherLoans: false });
    
    expect(screen.queryByText('החזר הלוואות אחרות חודשי')).not.toBeInTheDocument();
    expect(screen.queryByText('סך החזר חודשי נוכחי:')).not.toBeInTheDocument();
  });

  it('shows current total payment calculation when user has other loans', () => {
    renderWithProvider({
      hasOtherLoans: true,
      mortgagePayment: 6500,
      otherLoansPayment: 1500
    });
    
    expect(screen.getByText('סך החזר חודשי נוכחי:')).toBeInTheDocument();
    // The component will show the calculated total (6500 + 1500 = 8000)
    // Look for the specific element with blue styling (the main total display)
    expect(screen.getByText((content, element) => {
      return content.includes('8,000') && 
             element?.textContent?.includes('₪') && 
             element?.className?.includes('text-blue-600');
    })).toBeInTheDocument();
  });

  it('displays estimated savings calculation', () => {
    renderWithProvider();
    
    expect(screen.getByText('הערכת חיסכון ראשונית')).toBeInTheDocument();
    expect(screen.getByText('חיסכון משוער בחודש')).toBeInTheDocument();
  });

  it('shows estimated savings when potential savings exist', () => {
    renderWithProvider({
      mortgagePayment: 6500,
      otherLoansPayment: 0
    });
    
    expect(screen.getByText('הערכת חיסכון ראשונית')).toBeInTheDocument();
    // The component shows estimated savings based on calculations
    expect(screen.getByText(/חיסכון משוער בחודש/)).toBeInTheDocument();
  });

  it('shows estimated new payment when potential savings exist', () => {
    renderWithProvider({
      mortgagePayment: 6500,
      otherLoansPayment: 0
    });
    
    expect(screen.getByText('החזר משוער חדש:')).toBeInTheDocument();
    // The component shows the estimated new payment - look for specific green-styled amount
    expect(screen.getByText((content, element) => {
      return content.includes('5,389') && 
             element?.textContent?.includes('₪') && 
             element?.className?.includes('text-green-700');
    })).toBeInTheDocument();
  });

  it('updates mortgage payment when input changes', async () => {
    renderWithProvider();
    
    const mortgageInput = screen.getByPlaceholderText('6,500');
    fireEvent.change(mortgageInput, { target: { value: '7,000' } });
    
    await waitFor(() => {
      expect(mortgageInput).toHaveValue('7,000');
    });
  });

  it('updates other loans payment when input changes', async () => {
    renderWithProvider();
    
    const otherLoansInput = screen.getByPlaceholderText('0');
    fireEvent.change(otherLoansInput, { target: { value: '1,500' } });
    
    await waitFor(() => {
      expect(otherLoansInput).toHaveValue('1,500');
    });
  });

  it('updates form data when inputs change', async () => {
    renderWithProvider();
    
    const mortgageInput = screen.getByPlaceholderText('6,500');
    fireEvent.change(mortgageInput, { target: { value: '7,000' } });
    
    await waitFor(() => {
      expect(mortgageInput).toHaveValue('7,000');
    });

    const otherLoansInput = screen.getByPlaceholderText('0');
    fireEvent.change(otherLoansInput, { target: { value: '1,500' } });
    
    await waitFor(() => {
      expect(otherLoansInput).toHaveValue('1,500');
    });
  });

  it('shows validation error when mortgage payment is empty', async () => {
    renderWithProvider();
    
    const mortgageInput = screen.getByPlaceholderText('6,500');
    fireEvent.change(mortgageInput, { target: { value: '' } });
    
    const nextButton = screen.getByText('המשך לחישוב מדויק');
    fireEvent.click(nextButton);
    
    await waitFor(() => {
      expect(screen.getByText('נא להזין החזר משכנתא')).toBeInTheDocument();
    });
  });

  it('displays the correct CTA message based on savings potential', () => {
    // Test case with savings potential
    const formDataWithSavings = {
      mortgageBalance: 800000,
      otherLoansBalance: 100000,
      mortgagePayment: 5000,
      otherLoansPayment: 1000
    };

    renderWithProvider(formDataWithSavings);
    expect(screen.getByText('מעולה! יש פוטנציאל לחיסכון')).toBeInTheDocument();
  });

  it('displays alternative message when no significant savings potential', () => {
    // Test case with minimal savings potential
    const formDataWithoutSavings = {
      mortgageBalance: 100000,
      otherLoansBalance: 0,
      mortgagePayment: 1000,
      otherLoansPayment: 0
    };

    renderWithProvider(formDataWithoutSavings);
    expect(screen.getByText('בואו נבדוק את האפשרויות שלך')).toBeInTheDocument();
  });

  it('displays continue button', () => {
    renderWithProvider();
    
    expect(screen.getByText('המשך לחישוב מדויק')).toBeInTheDocument();
  });

  it('uses blue theme styling for single-track', () => {
    renderWithProvider();
    
    // Check for blue-themed elements
    const icons = screen.getAllByRole('generic', { hidden: true });
    const blueIcons = icons.filter(icon => 
      icon.className && icon.className.includes('text-blue-600')
    );
    expect(blueIcons.length).toBeGreaterThan(0);
  });

  it('shows estimated savings display', () => {
    renderWithProvider({
      mortgagePayment: 6500,
      otherLoansPayment: 0
    });
    
    // Should show estimated savings section
    expect(screen.getByText('הערכת חיסכון ראשונית')).toBeInTheDocument();
    expect(screen.getByText('חיסכון משוער בחודש')).toBeInTheDocument();
  });
});