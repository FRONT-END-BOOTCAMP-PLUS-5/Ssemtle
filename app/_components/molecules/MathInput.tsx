'use client';

import { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { asciiToLatex } from '@/libs/asciiToLatex';

interface MathInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  onSubmit?: () => void;
  onHelp?: () => void;
  onBlur?: () => void;
  submitDisabled?: boolean;
  submitLoading?: boolean;
  submitText?: string;
  submitVariant?: 'submit' | 'correct' | 'incorrect' | 'next';
}

export default function MathInput({
  value,
  onChange,
  placeholder = '수식을 입력하세요',
  disabled = false,
  className = '',
  onSubmit,
  onHelp,
  onBlur,
  submitDisabled = false,
  submitLoading = false,
  submitText = '제출',
  submitVariant = 'submit',
}: MathInputProps) {
  const renderRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!renderRef.current) return;

    try {
      if (value.trim()) {
        const latex = asciiToLatex(value);
        katex.render(latex, renderRef.current, {
          throwOnError: false,
          output: 'htmlAndMathml',
          trust: false,
          displayMode: false,
          strict: false,
        });
      } else {
        renderRef.current.innerHTML = `<span class="text-gray-400 italic">${placeholder}</span>`;
      }
    } catch {
      renderRef.current.innerHTML = `<span class="text-red-500 text-sm">구문 오류: 올바른 수식을 입력해주세요</span>`;
    }
  }, [value, placeholder]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow common keyboard shortcuts for math input
    if (e.key === 'Enter') {
      e.preventDefault();
      if (onSubmit) {
        onSubmit();
      }
    }
  };

  const handleInputFocus = () => {
    // Focus event handled - no additional action needed for readonly input
  };

  const handleInputBlur = () => {
    if (onBlur) {
      onBlur();
    }
  };

  const getSubmitButtonStyles = () => {
    const baseStyles =
      'px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';

    switch (submitVariant) {
      case 'correct':
        return `${baseStyles} bg-green-500 text-white`;
      case 'incorrect':
        return `${baseStyles} bg-red-500 text-white`;
      case 'next':
        return `${baseStyles} bg-blue-500 text-white`;
      case 'submit':
      default:
        return `${baseStyles} bg-gradient-to-r from-violet-500 to-violet-600 text-white shadow-[0px_4px_15px_0px_rgba(139,92,246,0.30)]`;
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Input row with buttons */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1" data-clickable-zone>
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder={placeholder}
            disabled={disabled}
            readOnly
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-mono text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-100 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
          />
          {value && (
            <button
              onClick={() => onChange('')}
              disabled={disabled}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              ×
            </button>
          )}
        </div>

        {/* Help button */}
        {onHelp && (
          <button
            onClick={onHelp}
            disabled={disabled}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="도움말"
          >
            ?
          </button>
        )}

        {/* Submit button */}
        {onSubmit && (
          <button
            onClick={onSubmit}
            disabled={disabled || submitDisabled}
            className={getSubmitButtonStyles()}
          >
            {submitLoading && (
              <svg
                className="mr-1 -ml-1 inline h-3 w-3 animate-spin text-current"
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
            {submitText}
          </button>
        )}
      </div>

      {/* Math preview */}
      <div className="min-h-12 rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
        <div
          ref={renderRef}
          className="text-lg leading-relaxed"
          style={{ minHeight: '1.5rem' }}
        />
      </div>
    </div>
  );
}
