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
}

export default function MathInput({
  value,
  onChange,
  placeholder = '수식을 입력하세요',
  disabled = false,
  className = '',
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
      // Could trigger submit if needed
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Raw input field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
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
