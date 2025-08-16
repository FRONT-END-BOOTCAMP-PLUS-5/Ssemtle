'use client';

import { ReactNode } from 'react';

interface NumberPadProps {
  onNumberClick: (number: string) => void;
  onOperatorClick: (operator: string) => void;
  onClear: () => void;
  disabled?: boolean;
}

interface KeypadButtonProps {
  children: ReactNode;
  onClick: () => void;
  variant?: 'number' | 'operator' | 'clear';
  disabled?: boolean;
}

function KeypadButton({
  children,
  onClick,
  variant = 'number',
  disabled = false,
}: KeypadButtonProps) {
  const baseClasses =
    'flex h-12 w-12 items-center justify-center rounded-xl text-xl font-bold transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';

  const variantClasses = {
    number: 'bg-gray-100 text-black hover:bg-gray-200',
    operator: 'bg-violet-100 text-violet-600 hover:bg-violet-200',
    clear: 'bg-red-100 text-red-600 hover:bg-red-200',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default function NumberPad({
  onNumberClick,
  onOperatorClick,
  onClear,
  disabled = false,
}: NumberPadProps) {
  const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const operators = ['+', '-', '×', '÷', '√', '^'];

  return (
    <div className="mx-auto w-full max-w-xs">
      <div className="grid grid-cols-4 gap-3 rounded-2xl bg-white p-4 shadow-lg">
        {/* Numbers 1-9 */}
        {numbers.slice(1).map((number) => (
          <KeypadButton
            key={number}
            onClick={() => onNumberClick(number)}
            disabled={disabled}
          >
            {number}
          </KeypadButton>
        ))}

        {/* Clear button */}
        <KeypadButton onClick={onClear} variant="clear" disabled={disabled}>
          ×
        </KeypadButton>

        {/* Zero */}
        <KeypadButton onClick={() => onNumberClick('0')} disabled={disabled}>
          0
        </KeypadButton>

        {/* Operators */}
        {operators.map((operator) => (
          <KeypadButton
            key={operator}
            onClick={() => onOperatorClick(operator)}
            variant="operator"
            disabled={disabled}
          >
            {operator}
          </KeypadButton>
        ))}
      </div>
    </div>
  );
}
