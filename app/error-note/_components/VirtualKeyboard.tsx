'use client';

import { ReactNode } from 'react';

interface VirtualKeyboardProps {
  isVisible: boolean;
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
    'flex min-h-8 min-w-8 items-center justify-center rounded-xl text-xl font-bold transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';

  const variantClasses = {
    number: 'bg-gray-100 text-gray-800 hover:bg-gray-200 shadow-sm',
    operator:
      'bg-violet-100 text-primary hover:bg-violet-200 shadow-sm font-semibold',
    clear: 'bg-red-100 text-red-700 hover:bg-red-200 shadow-sm',
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

export default function VirtualKeyboard({
  isVisible,
  onNumberClick,
  onOperatorClick,
  onClear,
  disabled = false,
}: VirtualKeyboardProps) {
  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const advancedOperators = ['√', '^', '(', ')'];
  const variables = ['x', 'y', 'π'];

  return (
    <div
      data-virtual-keyboard
      className={`fixed right-0 bottom-0 left-0 z-50 mx-auto w-full max-w-2xl transform transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{
        left: '50%',
        transform: isVisible
          ? 'translateX(-50%) translateY(0)'
          : 'translateX(-50%) translateY(100%)',
      }}
    >
      <div className="mx-4 mb-4">
        <div className="grid grid-cols-4 gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-2xl">
          {/* Row 1: Numbers 1-3 + Clear */}
          {numbers.slice(0, 3).map((number) => (
            <KeypadButton
              key={number}
              onClick={() => onNumberClick(number)}
              disabled={disabled}
            >
              {number}
            </KeypadButton>
          ))}
          <KeypadButton onClick={onClear} variant="clear" disabled={disabled}>
            C
          </KeypadButton>

          {/* Row 2: Numbers 4-6 + Addition */}
          {numbers.slice(3, 6).map((number) => (
            <KeypadButton
              key={number}
              onClick={() => onNumberClick(number)}
              disabled={disabled}
            >
              {number}
            </KeypadButton>
          ))}
          <KeypadButton
            onClick={() => onOperatorClick('+')}
            variant="operator"
            disabled={disabled}
          >
            +
          </KeypadButton>

          {/* Row 3: Numbers 7-9 + Subtraction */}
          {numbers.slice(6, 9).map((number) => (
            <KeypadButton
              key={number}
              onClick={() => onNumberClick(number)}
              disabled={disabled}
            >
              {number}
            </KeypadButton>
          ))}
          <KeypadButton
            onClick={() => onOperatorClick('-')}
            variant="operator"
            disabled={disabled}
          >
            -
          </KeypadButton>

          {/* Row 4: 0, decimal, multiplication, division */}
          <KeypadButton onClick={() => onNumberClick('0')} disabled={disabled}>
            0
          </KeypadButton>
          <KeypadButton
            onClick={() => onOperatorClick('.')}
            variant="operator"
            disabled={disabled}
          >
            .
          </KeypadButton>
          <KeypadButton
            onClick={() => onOperatorClick('×')}
            variant="operator"
            disabled={disabled}
          >
            ×
          </KeypadButton>
          <KeypadButton
            onClick={() => onOperatorClick('/')}
            variant="operator"
            disabled={disabled}
          >
            /
          </KeypadButton>

          {/* Row 5: Advanced operators */}
          {advancedOperators.map((operator) => (
            <KeypadButton
              key={operator}
              onClick={() => onOperatorClick(operator)}
              variant="operator"
              disabled={disabled}
            >
              {operator}
            </KeypadButton>
          ))}

          {/* Row 6: Variables and constants */}
          {variables.map((variable) => (
            <KeypadButton
              key={variable}
              onClick={() => onOperatorClick(variable)}
              variant="operator"
              disabled={disabled}
            >
              {variable}
            </KeypadButton>
          ))}
          <KeypadButton
            onClick={() => onOperatorClick(',')}
            variant="operator"
            disabled={disabled}
          >
            ,
          </KeypadButton>
        </div>
      </div>
    </div>
  );
}
