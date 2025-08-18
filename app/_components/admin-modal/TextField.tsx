'use client';

import { ChangeEvent } from 'react';

interface TextFieldProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

export default function TextField({
  id,
  name,
  value,
  onChange,
  placeholder,
  disabled,
  error,
}: TextFieldProps) {
  return (
    <div className="flex w-full flex-col items-start justify-start gap-2">
      <div className="inline-flex h-12 w-full items-center justify-start gap-2 overflow-hidden rounded-lg bg-gray-50 px-3 py-2.5 outline outline-1 outline-offset-[-1px] outline-gray-300">
        <input
          id={id}
          name={name}
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full bg-transparent text-xs leading-snug font-medium text-gray-600 placeholder-gray-400 focus:outline-none"
          disabled={disabled}
          aria-invalid={!!error}
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
