import { render, fireEvent, screen } from '@testing-library/react';
import { Input } from './Input';

// Mock navigator.userAgent for mobile detection
Object.defineProperty(window.navigator, 'userAgent', {
  writable: true,
  value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
});

// Mock window.innerWidth for mobile detection
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  value: 375
});

describe('Input Component Auto-Advance', () => {
  test('should have auto-advance indicator on mobile when autoAdvance is enabled', () => {
    render(
      <Input 
        autoAdvance={true}
        inputMode="tel"
        maxLength={10}
        placeholder="Phone number"
      />
    );
    
    // Should show mobile auto-advance indicator
    expect(screen.getByText('יעבור אוטומטית לשדה הבא')).toBeInTheDocument();
  });

  test('should not show auto-advance indicator when autoAdvance is disabled', () => {
    render(
      <Input 
        autoAdvance={false}
        inputMode="tel"
        maxLength={10}
        placeholder="Phone number"
      />
    );
    
    // Should not show mobile auto-advance indicator
    expect(screen.queryByText('יעבור אוטומטית לשדה הבא')).not.toBeInTheDocument();
  });

  test('should include maxLength attribute when provided', () => {
    render(
      <Input 
        autoAdvance={true}
        maxLength={10}
        data-testid="test-input"
      />
    );
    
    const input = screen.getByTestId('test-input');
    expect(input).toHaveAttribute('maxLength', '10');
  });
});