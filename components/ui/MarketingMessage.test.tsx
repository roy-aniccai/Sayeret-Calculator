import React from 'react';
import { render, screen } from '@testing-library/react';
import { MarketingMessage, MARKETING_MESSAGES } from './MarketingMessage';

describe('MarketingMessage', () => {
  it('renders WhatsApp variant with correct message and icon', () => {
    render(
      <MarketingMessage 
        message={MARKETING_MESSAGES.whatsappReport}
        variant="whatsapp-report"
      />
    );
    
    expect(screen.getByText(MARKETING_MESSAGES.whatsappReport)).toBeInTheDocument();
    const container = screen.getByText(MARKETING_MESSAGES.whatsappReport).closest('div');
    expect(container).toHaveClass('bg-green-50', 'border-green-200');
  });

  it('renders smart bot variant with correct message and icon', () => {
    render(
      <MarketingMessage 
        message={MARKETING_MESSAGES.smartBot}
        variant="smart-bot"
      />
    );
    
    expect(screen.getByText(MARKETING_MESSAGES.smartBot)).toBeInTheDocument();
    const container = screen.getByText(MARKETING_MESSAGES.smartBot).closest('div');
    expect(container).toHaveClass('bg-blue-50', 'border-blue-200');
  });

  it('applies RTL direction for Hebrew text', () => {
    render(
      <MarketingMessage 
        message={MARKETING_MESSAGES.whatsappReport}
        variant="whatsapp-report"
      />
    );
    
    const container = screen.getByText(MARKETING_MESSAGES.whatsappReport).closest('div');
    expect(container).toHaveAttribute('dir', 'rtl');
  });

  it('applies custom className when provided', () => {
    const customClass = 'my-custom-class';
    render(
      <MarketingMessage 
        message="Test message"
        variant="whatsapp-report"
        className={customClass}
      />
    );
    
    const container = screen.getByText('Test message').closest('div');
    expect(container).toHaveClass(customClass);
  });

  it('displays Hebrew text with proper font styling', () => {
    render(
      <MarketingMessage 
        message={MARKETING_MESSAGES.whatsappReport}
        variant="whatsapp-report"
      />
    );
    
    const textElement = screen.getByText(MARKETING_MESSAGES.whatsappReport);
    expect(textElement).toHaveClass('text-gray-700', 'text-sm', 'font-medium', 'leading-relaxed');
  });
});