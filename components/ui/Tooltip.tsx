import React, { useState, useRef, useEffect, useCallback } from 'react';

export interface TooltipPosition {
  x: number;
  y: number;
  adjustedPosition: 'top' | 'bottom' | 'left' | 'right';
  withinBounds: boolean;
}

export interface TooltipConfig {
  text: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  maxWidth: number;
  fontSize: 'sm' | 'base' | 'lg';
  allowWrap: boolean;
}

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  maxWidth?: number;
  fontSize?: 'sm' | 'base' | 'lg';
  allowWrap?: boolean;
  disabled?: boolean;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = 'auto',
  maxWidth = 300,
  fontSize = 'base',
  allowWrap = true,
  disabled = false,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>({
    x: 0,
    y: 0,
    adjustedPosition: 'top',
    withinBounds: true
  });
  
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const tooltipId = useRef(`tooltip-${Math.random().toString(36).substr(2, 9)}`).current;

  // Calculate optimal tooltip position with viewport boundary detection
  const calculatePosition = useCallback((): TooltipPosition => {
    if (!triggerRef.current || !tooltipRef.current) {
      return { x: 0, y: 0, adjustedPosition: 'top', withinBounds: false };
    }

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    const spacing = 8; // Gap between trigger and tooltip
    const margin = 16; // Minimum margin from viewport edges

    // Calculate positions for each direction
    const positions = {
      top: {
        x: triggerRect.left + (triggerRect.width - tooltipRect.width) / 2,
        y: triggerRect.top - tooltipRect.height - spacing
      },
      bottom: {
        x: triggerRect.left + (triggerRect.width - tooltipRect.width) / 2,
        y: triggerRect.bottom + spacing
      },
      left: {
        x: triggerRect.left - tooltipRect.width - spacing,
        y: triggerRect.top + (triggerRect.height - tooltipRect.height) / 2
      },
      right: {
        x: triggerRect.right + spacing,
        y: triggerRect.top + (triggerRect.height - tooltipRect.height) / 2
      }
    };

    // Check which positions fit within viewport bounds
    const fitsInViewport = (pos: { x: number; y: number }) => {
      return pos.x >= margin && 
             pos.x + tooltipRect.width <= viewport.width - margin &&
             pos.y >= margin && 
             pos.y + tooltipRect.height <= viewport.height - margin;
    };

    let bestPosition: 'top' | 'bottom' | 'left' | 'right';
    let finalPos: { x: number; y: number };

    if (position === 'auto') {
      // Try positions in order of preference: top, bottom, right, left
      const preferenceOrder: ('top' | 'bottom' | 'left' | 'right')[] = ['top', 'bottom', 'right', 'left'];
      
      bestPosition = preferenceOrder.find(pos => fitsInViewport(positions[pos])) || 'top';
      finalPos = positions[bestPosition];
    } else {
      bestPosition = position as 'top' | 'bottom' | 'left' | 'right';
      finalPos = positions[bestPosition];
    }

    // If the preferred position doesn't fit, adjust coordinates to stay within bounds
    let withinBounds = fitsInViewport(finalPos);
    
    if (!withinBounds) {
      // Adjust horizontal position
      if (finalPos.x < margin) {
        finalPos.x = margin;
      } else if (finalPos.x + tooltipRect.width > viewport.width - margin) {
        finalPos.x = viewport.width - tooltipRect.width - margin;
      }

      // Adjust vertical position
      if (finalPos.y < margin) {
        finalPos.y = margin;
      } else if (finalPos.y + tooltipRect.height > viewport.height - margin) {
        finalPos.y = viewport.height - tooltipRect.height - margin;
      }

      // Check if adjustments made it fit
      withinBounds = fitsInViewport(finalPos);
    }

    return {
      x: finalPos.x,
      y: finalPos.y,
      adjustedPosition: bestPosition,
      withinBounds
    };
  }, [position]);

  // Update tooltip position when it becomes visible
  useEffect(() => {
    if (isVisible && !disabled) {
      // Small delay to ensure tooltip is rendered before calculating position
      const timer = setTimeout(() => {
        const newPosition = calculatePosition();
        setTooltipPosition(newPosition);
      }, 10);

      return () => clearTimeout(timer);
    }
  }, [isVisible, disabled, calculatePosition]);

  // Handle window resize to recalculate position
  useEffect(() => {
    if (!isVisible) return;

    const handleResize = () => {
      const newPosition = calculatePosition();
      setTooltipPosition(newPosition);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isVisible, calculatePosition]);

  const handleMouseEnter = () => {
    if (!disabled) {
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  const handleFocus = () => {
    if (!disabled) {
      setIsVisible(true);
    }
  };

  const handleBlur = () => {
    setIsVisible(false);
  };

  // Font size classes with proper line height and spacing
  const fontSizeClasses = {
    sm: 'text-sm leading-relaxed',
    base: 'text-base leading-relaxed',
    lg: 'text-lg leading-relaxed'
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={(e) => {
          // Show tooltip on Enter or Space key
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsVisible(!isVisible);
          }
          // Hide tooltip on Escape key
          if (e.key === 'Escape') {
            setIsVisible(false);
          }
        }}
        className="cursor-help focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded"
        tabIndex={0}
        role="button"
        aria-describedby={isVisible ? tooltipId : undefined}
        aria-label={`Show tooltip: ${content}`}
        aria-expanded={isVisible}
      >
        {children}
      </div>

      {isVisible && !disabled && (
        <div
          ref={tooltipRef}
          id={tooltipId}
          role="tooltip"
          className={`fixed z-50 px-4 py-3 bg-gray-900 text-white rounded-lg shadow-lg transition-opacity duration-200 ${
            fontSizeClasses[fontSize]
          } ${allowWrap ? 'break-words' : 'whitespace-nowrap'} border border-gray-700`}
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            maxWidth: allowWrap ? maxWidth : 'none',
            opacity: tooltipPosition.withinBounds ? 1 : 0.9,
            // Ensure high contrast ratio (WCAG AA compliant)
            backgroundColor: '#1f2937', // gray-800 for better contrast
            color: '#ffffff',
            // Ensure minimum font size for readability
            fontSize: fontSize === 'sm' ? '14px' : fontSize === 'base' ? '16px' : '18px'
          }}
          aria-hidden={!isVisible}
          aria-live="polite"
        >
          {content}
          
          {/* Arrow pointing to trigger element */}
          <div
            className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${
              tooltipPosition.adjustedPosition === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' :
              tooltipPosition.adjustedPosition === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' :
              tooltipPosition.adjustedPosition === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2' :
              'left-[-4px] top-1/2 -translate-y-1/2'
            }`}
          />
        </div>
      )}
    </div>
  );
};