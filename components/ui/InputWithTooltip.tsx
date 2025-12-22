import React from 'react';
import { Input } from './Input';
import { Tooltip } from './Tooltip';

/**
 * InputWithTooltip Component
 * 
 * An enhanced input component with an integrated tooltip system that provides
 * intelligent positioning, improved readability, and full accessibility support.
 * 
 * Enhanced Features:
 * - Intelligent positioning with viewport boundary detection (auto-adjusts to prevent cutoff)
 * - Improved typography with configurable font sizes for better readability
 * - Text wrapping for long tooltip content
 * - Full accessibility compliance with ARIA attributes and keyboard navigation
 * - Backward compatible with existing usage
 * 
 * @example
 * ```tsx
 * <InputWithTooltip
 *   label="Property Value"
 *   tooltip="Enter the current estimated value of your property"
 *   name="propertyValue"
 *   value={value}
 *   onChange={handleChange}
 *   tooltipPosition="auto" // Optional: 'top' | 'bottom' | 'left' | 'right' | 'auto'
 *   tooltipFontSize="base" // Optional: 'sm' | 'base' | 'lg'
 *   tooltipMaxWidth={280}  // Optional: custom max width in pixels
 * />
 * ```
 * 
 * Requirements Validated:
 * - 2.1: Tooltips display completely within page boundaries
 * - 2.2: Increased font size for better readability
 * - 2.3: Text wrapping for long content
 * - 2.4: No viewport edge cutoff
 * - 2.5: Proper contrast and accessibility compliance
 */
interface InputWithTooltipProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  tooltip: string;
  name: string;
  inputMode?: string;
  suffix?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  icon?: React.ReactNode;
  helperText?: string;
  autoAdvance?: boolean;
  maxLength?: number;
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  tooltipMaxWidth?: number;
  tooltipFontSize?: 'sm' | 'base' | 'lg';
}

export const InputWithTooltip: React.FC<InputWithTooltipProps> = ({
  label,
  tooltip,
  tooltipPosition = 'auto',
  tooltipMaxWidth = 280, // Optimized for compact layout
  tooltipFontSize = 'base',
  ...inputProps
}) => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <label className="block text-lg font-semibold text-gray-900">
          {label}
        </label>
        <Tooltip
          content={tooltip}
          position={tooltipPosition}
          maxWidth={tooltipMaxWidth}
          fontSize={tooltipFontSize}
          allowWrap={true}
        >
          <i className="fa-solid fa-info-circle text-blue-400 hover:text-blue-600 cursor-help text-sm" />
        </Tooltip>
      </div>
      <Input {...inputProps} label="" />
    </div>
  );
};