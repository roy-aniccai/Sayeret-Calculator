import React from 'react';
import { render, screen } from '@testing-library/react';
import { CompactStepLayout } from './CompactStepLayout';

describe('CompactStepLayout', () => {
  it('renders step name as header', () => {
    render(
      <CompactStepLayout stepName="Test Step">
        <div>Test content</div>
      </CompactStepLayout>
    );
    
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Test Step');
  });

  it('renders children content', () => {
    render(
      <CompactStepLayout stepName="Test Step">
        <div data-testid="test-content">Test content</div>
      </CompactStepLayout>
    );
    
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  it('renders primary CTA when provided', () => {
    const primaryCTA = <button data-testid="primary-cta">Primary Action</button>;
    
    render(
      <CompactStepLayout stepName="Test Step" primaryCTA={primaryCTA}>
        <div>Test content</div>
      </CompactStepLayout>
    );
    
    expect(screen.getByTestId('primary-cta')).toBeInTheDocument();
  });

  it('renders back button when onBack is provided', () => {
    const mockOnBack = jest.fn();
    
    render(
      <CompactStepLayout stepName="Test Step" onBack={mockOnBack}>
        <div>Test content</div>
      </CompactStepLayout>
    );
    
    expect(screen.getByText('חזור אחורה')).toBeInTheDocument();
  });

  it('applies consistent spacing classes', () => {
    const { container } = render(
      <CompactStepLayout stepName="Test Step">
        <div>Test content</div>
      </CompactStepLayout>
    );
    
    // Check for animate-fade-in-up class
    expect(container.firstChild).toHaveClass('animate-fade-in-up');
    
    // Check for space-y-4 class on content container
    const contentContainer = container.querySelector('.space-y-4');
    expect(contentContainer).toBeInTheDocument();
  });
});