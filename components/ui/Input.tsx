import React, { useRef, useCallback } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  suffix?: string;
  error?: string;
  helperText?: string;
  hideSpinner?: boolean;
  autoAdvance?: boolean; // Enable automatic field navigation on mobile
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  icon, 
  suffix, 
  error, 
  helperText,
  hideSpinner = true, 
  autoAdvance = false,
  className = '', 
  onChange,
  maxLength,
  ...props 
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Determine padding: If icon/suffix exists on the left, add extra padding-left (pl-16)
  // Otherwise keep balanced padding (px-6)
  const hasIcon = icon || suffix;
  const paddingClass = hasIcon ? 'pl-16 pr-6' : 'px-6';

  // Check if device is mobile
  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           window.innerWidth <= 768;
  };

  // Stable onChange handler to prevent unnecessary re-renders
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e);
    }

    // Auto-advance to next field on mobile when conditions are met
    if (autoAdvance && isMobile()) {
      const value = e.target.value;
      let shouldAdvance = false;

      // For phone numbers (tel input mode)
      if (props.inputMode === 'tel' && maxLength) {
        // Remove non-digits to check actual length
        const digitsOnly = value.replace(/\D/g, '');
        shouldAdvance = digitsOnly.length >= maxLength;
      }
      // For numeric inputs with maxLength
      else if (maxLength && value.length >= maxLength) {
        shouldAdvance = true;
      }
      // For numeric inputs without maxLength - advance when user enters a reasonable amount
      else if (props.inputMode === 'numeric' && !maxLength) {
        // Remove commas and check if it's a reasonable number (4+ digits)
        const numericValue = value.replace(/[^\d]/g, '');
        shouldAdvance = numericValue.length >= 4;
      }

      if (shouldAdvance) {
        // Find all input elements in the form
        const form = e.target.form;
        if (form) {
          const inputs = Array.from(form.querySelectorAll('input:not([disabled]):not([readonly])'));
          const currentIndex = inputs.indexOf(e.target);
          
          // Move to next input if available
          if (currentIndex >= 0 && currentIndex < inputs.length - 1) {
            const nextInput = inputs[currentIndex + 1] as HTMLInputElement;
            // Small delay to ensure smooth transition
            setTimeout(() => {
              nextInput.focus();
              nextInput.select();
            }, 150);
          }
        }
      }
    }
  }, [onChange, autoAdvance, maxLength, props.inputMode]);

  return (
    <div className="mb-6">
      {label && <label className="block text-xl font-bold text-gray-800 mb-3">{label}</label>}
      <div className="relative">
        {/* Suffix/Icon: Positioned on the LEFT (left-6) for RTL alignment */}
        {suffix && <span className="absolute top-6 left-6 text-gray-500 font-bold text-xl pointer-events-none">{suffix}</span>}
        {icon && <span className="absolute top-6 left-6 text-gray-500 text-xl mt-0.5 pointer-events-none">{icon}</span>}
        
        {/* Auto-advance indicator for mobile */}
        {autoAdvance && isMobile() && (
          <span className="absolute top-2 right-2 text-xs text-blue-500 pointer-events-none opacity-60">
            <i className="fa-solid fa-arrow-down"></i>
          </span>
        )}
        
        <input
          ref={inputRef}
          className={`w-full border-2 rounded-xl py-5 ${paddingClass} text-2xl font-medium outline-none focus:ring-4 transition-all ${
            error 
            ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'
          } ${hideSpinner ? 'no-spinner' : ''} ${className}`}
          onChange={handleChange}
          maxLength={maxLength}
          {...props}
        />
      </div>
      {error && <p className="text-lg text-red-600 mt-2 font-medium">{error}</p>}
      {helperText && !error && <p className="text-sm text-gray-500 mt-2">{helperText}</p>}
      {autoAdvance && isMobile() && !error && !helperText && (
        <p className="text-xs text-blue-500 mt-1 opacity-70">
          <i className="fa-solid fa-mobile-screen-button mr-1"></i>
          יעבור אוטומטית לשדה הבא
        </p>
      )}
    </div>
  );
};