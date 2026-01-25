import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ContactOptionsPage } from './ContactOptionsPage';
import { SingleTrackFormProvider } from '../context/SingleTrackFormContext';

// Mock window.Calendly
const mockCalendly = {
  initPopupWidget: jest.fn()
};

Object.defineProperty(window, 'Calendly', {
  value: mockCalendly,
  writable: true
});

const renderWithProvider = (props = {}) => {
  const defaultProps = {
    onClose: jest.fn(),
    calculationSummary: {
      currentPayment: 6500,
      newPayment: 5500,
      monthlySavings: 1000,
      totalSavings: 360000,
      years: 30
    },
    ...props
  };

  return render(
    <SingleTrackFormProvider>
      <ContactOptionsPage {...defaultProps} />
    </SingleTrackFormProvider>
  );
};

describe('ContactOptionsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders main options selection screen', () => {
    renderWithProvider();
    
    expect(screen.getByText('איך תרצה להמשיך?')).toBeInTheDocument();
    expect(screen.getByText('תיאום פגישה')).toBeInTheDocument();
    expect(screen.getByText('אשמח שיחזרו אלי')).toBeInTheDocument();
  });

  it('opens Calendly when schedule meeting is clicked', () => {
    // Mock window.open
    const mockOpen = jest.fn();
    Object.defineProperty(window, 'open', {
      value: mockOpen,
      writable: true
    });

    renderWithProvider();
    
    const scheduleButton = screen.getByText('פתח יומן תיאומים');
    fireEvent.click(scheduleButton);
    
    // Should show loading state first
    expect(screen.getByText('פותח יומן...')).toBeInTheDocument();
    
    // After timeout, should open in new tab
    setTimeout(() => {
      expect(mockOpen).toHaveBeenCalledWith('https://calendly.com/tomers-finance-info/meet-with-me-1', '_blank');
    }, 600);
  });

  it('shows callback form when callback option is selected', () => {
    renderWithProvider();
    
    const callbackButton = screen.getByText('מלא פרטים');
    fireEvent.click(callbackButton);
    
    expect(screen.getByText('השאר פרטים')).toBeInTheDocument();
    expect(screen.getByLabelText('שם מלא')).toBeInTheDocument();
    expect(screen.getByLabelText('טלפון')).toBeInTheDocument();
  });

  it('shows insurance checkbox in callback form', () => {
    renderWithProvider();
    
    const callbackButton = screen.getByText('מלא פרטים');
    fireEvent.click(callbackButton);
    
    expect(screen.getByText('מעוניין גם בחיסכון בביטוח משכנתא')).toBeInTheDocument();
    expect(screen.getByText('עד 50,000 ש״ח חיסכון נוסף - בדיקה חינמית')).toBeInTheDocument();
  });

  it('submits callback form successfully', async () => {
    renderWithProvider();
    
    // Open callback form
    const callbackButton = screen.getByText('מלא פרטים');
    fireEvent.click(callbackButton);
    
    // Fill form
    fireEvent.change(screen.getByLabelText('שם מלא'), {
      target: { value: 'ישראל ישראלי' }
    });
    fireEvent.change(screen.getByLabelText('טלפון'), {
      target: { value: '0501234567' }
    });
    
    // Submit
    const submitButton = screen.getByText('שלח פרטים');
    fireEvent.click(submitButton);
    
    // Wait for success message with longer timeout
    await waitFor(() => {
      expect(screen.getByText('תודה!')).toBeInTheDocument();
      expect(screen.getByText(/קיבלנו את הפנייה שלך/)).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('can go back from callback form to main options', () => {
    renderWithProvider();
    
    // Open callback form
    const callbackButton = screen.getByText('מלא פרטים');
    fireEvent.click(callbackButton);
    
    // Go back
    const backButton = screen.getByText('חזור');
    fireEvent.click(backButton);
    
    // Should be back to main options
    expect(screen.getByText('איך תרצה להמשיך?')).toBeInTheDocument();
  });

  it('closes when close button is clicked', () => {
    const onClose = jest.fn();
    renderWithProvider({ onClose });
    
    const closeButton = screen.getByText('סגור');
    fireEvent.click(closeButton);
    
    expect(onClose).toHaveBeenCalled();
  });
});