import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { InputWithTooltip } from './InputWithTooltip';

describe('InputWithTooltip Component', () => {
  const defaultProps = {
    label: 'Test Input',
    tooltip: 'This is a test tooltip',
    name: 'testInput',
    value: '',
    onChange: jest.fn()
  };

  it('should render label and input correctly', () => {
    render(<InputWithTooltip {...defaultProps} />);
    
    expect(screen.getByText('Test Input')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should show tooltip when info icon is hovered', () => {
    render(<InputWithTooltip {...defaultProps} />);
    
    const infoIcon = screen.getByRole('button');
    fireEvent.mouseEnter(infoIcon);
    
    expect(screen.getByText('This is a test tooltip')).toBeInTheDocument();
  });

  it('should call onChange when input value changes', () => {
    const mockOnChange = jest.fn();
    render(<InputWithTooltip {...defaultProps} onChange={mockOnChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test value' } });
    
    expect(mockOnChange).toHaveBeenCalled();
  });

  it('should display error message when error prop is provided', () => {
    render(<InputWithTooltip {...defaultProps} error="This is an error" />);
    
    expect(screen.getByText('This is an error')).toBeInTheDocument();
  });

  it('should display helper text when provided', () => {
    render(<InputWithTooltip {...defaultProps} helperText="This is helper text" />);
    
    expect(screen.getByText('This is helper text')).toBeInTheDocument();
  });

  it('should use enhanced tooltip with auto positioning by default', () => {
    render(<InputWithTooltip {...defaultProps} />);
    
    const infoIcon = screen.getByRole('button');
    fireEvent.mouseEnter(infoIcon);
    
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveClass('fixed');
  });

  it('should support custom tooltip positioning', () => {
    render(<InputWithTooltip {...defaultProps} tooltipPosition="top" />);
    
    const infoIcon = screen.getByRole('button');
    expect(infoIcon).toBeInTheDocument();
  });

  it('should support custom tooltip font size', () => {
    render(<InputWithTooltip {...defaultProps} tooltipFontSize="lg" />);
    
    const infoIcon = screen.getByRole('button');
    fireEvent.mouseEnter(infoIcon);
    
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
  });

  it('should support custom tooltip max width', () => {
    render(<InputWithTooltip {...defaultProps} tooltipMaxWidth={400} />);
    
    const infoIcon = screen.getByRole('button');
    fireEvent.mouseEnter(infoIcon);
    
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveStyle({ maxWidth: '400px' });
  });

  it('should have proper accessibility attributes on tooltip trigger', () => {
    render(<InputWithTooltip {...defaultProps} />);
    
    const trigger = screen.getByRole('button');
    expect(trigger).toHaveAttribute('tabIndex', '0');
    expect(trigger).toHaveAttribute('aria-label');
  });
});