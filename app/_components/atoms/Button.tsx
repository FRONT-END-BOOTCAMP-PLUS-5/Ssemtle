'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant =
  | 'submit'
  | 'correct'
  | 'incorrect'
  | 'next'
  | 'primary'
  | 'secondary'
  | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  icon?: ReactNode;
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  submit:
    'bg-gradient-to-r from-violet-500 to-violet-600 text-white shadow-[0px_4px_15px_0px_rgba(139,92,246,0.30)]',
  correct: 'bg-green-500 text-white shadow-lg',
  incorrect: 'bg-red-500 text-white shadow-lg',
  next: 'bg-blue-500 text-white shadow-lg',
  primary:
    'bg-[var(--button-variant-primary-bg)] text-[var(--button-variant-primary-color)]',
  secondary:
    'bg-[var(--button-variant-secondary-bg)] text-[var(--button-variant-secondary-color)]',
  outline:
    'bg-[var(--button-variant-outline-bg)] text-[var(--button-variant-outline-color)] border-[var(--button-variant-outline-border)]',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  loading = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center rounded-xl font-bold transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {loading && (
        <svg
          className="mr-2 -ml-1 h-4 w-4 animate-spin text-current"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {icon && !loading && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
}
