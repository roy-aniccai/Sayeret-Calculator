import React from 'react';
import { Input } from '../ui/Input';
import { Tooltip } from '../ui/Tooltip';

interface InputWithTooltipProps {
  label: string;
  tooltip: string;
  name: string;
  inputMode?: string;
  type?: string;
  suffix?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  icon?: React.ReactNode;
  helperText?: string;
  autoAdvance?: boolean;
  maxLength?: number;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

/**
 * Standardized InputWithTooltip component using enhanced Tooltip system
 * Provides consistent styling and behavior across all step components
 */
export const InputWithTooltip: React.FC<InputWithTooltipProps> = ({ 
  label, 
  tooltip, 
  className = '',
  ...inputProps 
}) => (
  <div className={className}>
    <div className="flex items-center gap-2 mb-2">
      <label className="block text-lg font-semibold text-gray-900">
        {label}
      </label>
      <Tooltip 
        content={tooltip}
        position="auto"
        fontSize="base"
        allowWrap={true}
        maxWidth={280}
      >
        <i className="fa-solid fa-info-circle text-blue-400 hover:text-blue-600 cursor-help text-sm"></i>
      </Tooltip>
    </div>
    <Input {...inputProps} label="" />
  </div>
);