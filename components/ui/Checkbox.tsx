import React from 'react';

interface CheckboxProps {
    id?: string;
    label: string;
    name?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    description?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
    id,
    label,
    name,
    checked,
    onChange,
    disabled = false,
    description
}) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.checked);
    };

    return (
        <label 
            htmlFor={id}
            className={`flex items-start gap-3 p-1 cursor-pointer select-none group ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            <div className="relative flex items-center mt-0.5">
                <input
                    id={id}
                    type="checkbox"
                    name={name}
                    checked={checked}
                    onChange={handleChange}
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
            <div className="flex-1">
                <span className={`text-base block ${checked ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                    {label}
                </span>
                {description && (
                    <span className="text-sm text-gray-500 mt-1 block">
                        {description}
                    </span>
                )}
            </div>
        </label>
    );
};
