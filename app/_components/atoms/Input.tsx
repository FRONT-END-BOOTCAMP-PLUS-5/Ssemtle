'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

export type InputVariant =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'outline'
  | 'disabled';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: InputVariant;
  error?: string;
  label?: string;
}

const variantClasses: Record<InputVariant, string> = {
  primary:
    'bg-[var(--input-variant-primary-background)] text-[var(--input-variant-primary-color)] border-[var(--input-variant-primary-border)] placeholder:text-[var(--input-variant-primary-placeholder)] focus:border-[var(--input-variant-primary-focus-border)] focus:shadow-[var(--input-variant-primary-focus-box-shadow)]',
  secondary:
    'bg-[var(--input-variant-secondary-background)] text-[var(--input-variant-secondary-color)] border-[var(--input-variant-secondary-border)] placeholder:text-[var(--input-variant-secondary-placeholder)] focus:border-[var(--input-variant-secondary-focus-border)] focus:shadow-[var(--input-variant-secondary-focus-box-shadow)]',
  danger:
    'bg-[var(--input-variant-danger-background)] text-[var(--input-variant-danger-color)] border-[var(--input-variant-danger-border)] placeholder:text-[var(--input-variant-danger-placeholder)] focus:border-[var(--input-variant-danger-focus-border)] focus:shadow-[var(--input-variant-danger-focus-box-shadow)]',
  outline:
    'bg-[var(--input-variant-outline-background)] text-[var(--input-variant-outline-color)] border-[var(--input-variant-outline-border)] placeholder:text-[var(--input-variant-outline-placeholder)] focus:border-[var(--input-variant-outline-focus-border)] focus:shadow-[var(--input-variant-outline-focus-box-shadow)] rounded-[var(--input-variant-outline-border-radius)]',
  disabled:
    'bg-[var(--input-variant-disabled-background)] text-[var(--input-variant-disabled-color)] border-[var(--input-variant-disabled-border)] placeholder:text-[var(--input-variant-disabled-placeholder)] cursor-not-allowed',
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { variant = 'primary', error, label, className = '', disabled, ...props },
    ref
  ) => {
    const inputVariant = disabled ? 'disabled' : variant;
    const baseClasses =
      'w-full px-3 py-2 rounded-xl transition-all duration-200 focus:outline-none';
    const classes = `${baseClasses} ${variantClasses[inputVariant]} ${className}`;

    return (
      <div className="w-full">
        {label && (
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <input ref={ref} className={classes} disabled={disabled} {...props} />
        {error && (
          <p className="mt-1 text-sm text-[var(--color-error)]">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
