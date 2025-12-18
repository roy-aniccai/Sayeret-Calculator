import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  suffix?: string;
  error?: string;
  hideSpinner?: boolean;
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  icon, 
  suffix, 
  error, 
  hideSpinner = true, 
  className = '', 
  ...props 
}) => {
  // Determine padding: If icon/suffix exists on the left, add extra padding-left (pl-16)
  // Otherwise keep balanced padding (px-6)
  const hasIcon = icon || suffix;
  const paddingClass = hasIcon ? 'pl-16 pr-6' : 'px-6';

  return (
    <div className="mb-6">
      {label && <label className="block text-xl font-bold text-gray-800 mb-3">{label}</label>}
      <div className="relative">
        {/* Suffix/Icon: Positioned on the LEFT (left-6) for RTL alignment */}
        {suffix && <span className="absolute top-6 left-6 text-gray-500 font-bold text-xl pointer-events-none">{suffix}</span>}
        {icon && <span className="absolute top-6 left-6 text-gray-500 text-xl mt-0.5 pointer-events-none">{icon}</span>}
        
        <input
          className={`w-full border-2 rounded-xl py-5 ${paddingClass} text-2xl font-medium outline-none focus:ring-4 transition-all ${
            error 
            ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'
          } ${hideSpinner ? 'no-spinner' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-lg text-red-600 mt-2 font-medium">{error}</p>}
    </div>
  );
};