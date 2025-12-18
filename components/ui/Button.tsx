import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  // Updated: py-4 -> py-5, text-lg -> text-2xl, rounded-xl -> rounded-2xl
  const baseStyles = "font-bold py-5 rounded-2xl text-2xl shadow-lg transition-transform transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800 shadow-none",
    success: "bg-green-600 hover:bg-green-700 text-white",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};