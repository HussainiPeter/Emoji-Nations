import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  active?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '', 
  active = false,
  ...props 
}) => {
  const baseStyles = "font-bold transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center";
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm rounded-lg",
    md: "px-6 py-3 rounded-xl",
    lg: "px-8 py-4 text-lg rounded-2xl"
  };

  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-500/30",
    secondary: "bg-amber-400 text-amber-900 hover:bg-amber-500 shadow-md shadow-amber-500/30",
    danger: "bg-rose-500 text-white hover:bg-rose-600 shadow-md shadow-rose-500/30",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100 shadow-none border border-transparent",
    outline: active 
      ? "bg-indigo-50 text-indigo-700 border-2 border-indigo-500 shadow-sm" 
      : "bg-white text-gray-500 border-2 border-gray-200 hover:border-gray-300 shadow-sm"
  };

  return (
    <button 
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};