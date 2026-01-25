import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SingleTrackStep5Contact } from './SingleTrackStep5Contact';
import { SingleTrackFormProvider } from '../../context/SingleTrackFormContext';
import { submitData } from '../../utils/api';

// Mock the API
jest.mock('../../utils/api', () => ({
  submitData: jest.fn(() => Promise.resolve()),
  trackEvent: jest.fn(() => Promise.resolve())
}));

// Mock the navigation context utility
jest.mock('../../utils/navigationContext', () => ({
  generateContextualBackText: jest.fn(() => 'חזור לשלב קודם')
}));

const mockSubmitData = submitData as jest.MockedFunction<typeof submitData>;

const renderWithProvider = (initialData = {}) => {
  return render(
    <SingleTrackFormProvider>
      <SingleTrackStep5Contact />
    </SingleTrackFormProvider>
  );
};

describe('SingleTrackStep5Contact', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    test('renders contact form with required fields', () => {
      renderWithProvider();
      
      expect(screen.getByText('נשלח לך את התוצאות')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('ישראל ישראלי')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('050-1234567')).toBeInTheDocument();
      expect(screen.getByText('בואו נראה!')).toBeInTheDocument();
    });

    test('renders marketing message for phone number', () => {
      renderWithProvider();
      
      // The text is processed through ensureRTLDirection which adds RTL markers
      expect(screen.getByText(/מספר הטלפון ישמש אותנו לשלוח אליך את הדוח המלא בוואטסאפ/)).toBeInTheDocument();
    });

    test('renders privacy assurance section', () => {
      renderWithProvider();
      
      expect(screen.getByText('פרטיות מובטחת')).toBeInTheDocument();
      expect(screen.getByText('מידע מוצפן ומאובטח')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    test('shows error when name is empty', async () => {
      renderWithProvider();
      
      const submitButton = screen.getByText('בואו נראה!');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('נא להזין שם')).toBeInTheDocument();
      });
      
      expect(mockSubmitData).not.toHaveBeenCalled();
    });

    test('shows error when phone is empty', async () => {
      renderWithProvider();
      
      const nameInput = screen.getByPlaceholderText('ישראל ישראלי');
      fireEvent.change(nameInput, { target: { value: 'ישראל ישראלי' } });
      
      const submitButton = screen.getByText('בואו נראה!');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('נא להזין מספר טלפון')).toBeInTheDocument();
      });
      
      expect(mockSubmitData).not.toHaveBeenCalled();
    });

    test('accepts valid phone and submits form', async () => {
      renderWithProvider();
      
      const nameInput = screen.getByPlaceholderText('ישראל ישראלי');
      const phoneInput = screen.getByPlaceholderText('050-1234567');
      
      fireEvent.change(nameInput, { target: { value: 'ישראל ישראלי' } });
      fireEvent.change(phoneInput, { target: { value: '0501234567' } });
      
      const submitButton = screen.getByText('בואו נראה!');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockSubmitData).toHaveBeenCalled();
      });
    });
  });
});