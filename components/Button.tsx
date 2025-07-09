import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  disabled?: boolean;
  variant?: 'default' | 'destructive';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  disabled = false,
  className = '',
  variant = 'default',
  ...props
}) => {
  const baseStyles = 'px-4 py-2 rounded-md text-white disabled:bg-gray-400 disabled:cursor-not-allowed';
  const variantStyles = {
    default: 'bg-blue-600 hover:bg-blue-700',
    destructive: 'bg-red-600 hover:bg-red-700',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};