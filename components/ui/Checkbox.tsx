import React from 'react';

interface CheckboxProps {
    label: string;
    name: string;
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({
    label,
    name,
    checked,
    onChange,
    disabled = false,
}) => {
    return (
        <label className={`flex items-start gap-3 p-1 cursor-pointer select-none group ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <div className="relative flex items-center mt-0.5">
                <input
                    type="checkbox"
                    name={name}
                    checked={checked}
                    onChange={onChange}
                    disabled={disabled}
                    className="peer sr-only"
                />
                <div className={`
          w-5 h-5 border-2 rounded transition-all duration-200 flex items-center justify-center
          peer-focus:ring-2 peer-focus:ring-offset-2 peer-focus:ring-blue-500
          ${checked
                        ? 'bg-blue-600 border-blue-600'
                        : 'bg-white border-gray-300 group-hover:border-blue-400'}
        `}>
                    {checked && (
                        <i className="fa-solid fa-check text-white text-xs"></i>
                    )}
                </div>
            </div>
            <span className={`text-base ${checked ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                {label}
            </span>
        </label>
    );
};
