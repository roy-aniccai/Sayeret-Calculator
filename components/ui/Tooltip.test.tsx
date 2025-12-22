import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Tooltip } from './Tooltip';

describe('Tooltip Component', () => {
  it('should render children correctly', () => {
    render(
      <Tooltip content="Test tooltip">
        <button>Hover me</button>
      </Tooltip>
    );
    
    expect(screen.getByText('Hover me')).toBeInTheDocument();
  });

  it('should show tooltip on hover', () => {
    render(
      <Tooltip content="Test tooltip content">
        <button>Hover me</button>
      </Tooltip>
    );
    
    const trigger = screen.getByText('Hover me');
    fireEvent.mouseEnter(trigger);
    
    expect(screen.getByText('Test tooltip content')).toBeInTheDocument();
  });

  it('should hide tooltip on mouse leave', () => {
    render(
      <Tooltip content="Test tooltip content">
        <button>Hover me</button>
      </Tooltip>
    );
    
    const trigger = screen.getByText('Hover me');
    fireEvent.mouseEnter(trigger);
    expect(screen.getByText('Test tooltip content')).toBeInTheDocument();
    
    fireEvent.mouseLeave(trigger);
    expect(screen.queryByText('Test tooltip content')).not.toBeInTheDocument();
  });

  it('should show tooltip on focus and hide on blur', () => {
    render(
      <Tooltip content="Test tooltip content">
        <button>Focus me</button>
      </Tooltip>
    );
    
    const trigger = screen.getByText('Focus me');
    fireEvent.focus(trigger);
    
    expect(screen.getByText('Test tooltip content')).toBeInTheDocument();
    
    fireEvent.blur(trigger);
    expect(screen.queryByText('Test tooltip content')).not.toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(
      <Tooltip content="Accessible tooltip">
        <button>Accessible button</button>
      </Tooltip>
    );
    
    // The accessibility attributes are on the wrapper div, not the child button
    const wrapper = screen.getByRole('button', { name: /show tooltip/i });
    expect(wrapper).toHaveAttribute('tabIndex', '0');
    expect(wrapper).toHaveAttribute('aria-label', 'Show tooltip: Accessible tooltip');
    
    // The child button should still be accessible
    expect(screen.getByText('Accessible button')).toBeInTheDocument();
  });

  it('should not show tooltip when disabled', () => {
    render(
      <Tooltip content="Should not show" disabled>
        <button>Disabled tooltip</button>
      </Tooltip>
    );
    
    const trigger = screen.getByText('Disabled tooltip');
    fireEvent.mouseEnter(trigger);
    
    expect(screen.queryByText('Should not show')).not.toBeInTheDocument();
  });
});