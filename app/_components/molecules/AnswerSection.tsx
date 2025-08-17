'use client';

import Button, { ButtonVariant } from '../atoms/Button';
import Input from '../atoms/Input';

export type SubmitState = 'initial' | 'correct' | 'incorrect' | 'next';

interface AnswerSectionProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onNext: () => void;
  onClear: () => void;
  submitState: SubmitState;
  loading?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

const submitStateConfig: Record<
  SubmitState,
  {
    text: string;
    variant: ButtonVariant;
    icon?: string;
  }
> = {
  initial: {
    text: '제출',
    variant: 'submit',
  },
  correct: {
    text: '정답!',
    variant: 'correct',
    icon: '✓',
  },
  incorrect: {
    text: '오답!',
    variant: 'incorrect',
    icon: '✗',
  },
  next: {
    text: '다음',
    variant: 'next',
    icon: '→',
  },
};

export default function AnswerSection({
  value,
  onChange,
  onSubmit,
  onNext,
  onClear,
  submitState,
  loading = false,
  disabled = false,
  placeholder = '답을 입력해 주세요',
}: AnswerSectionProps) {
  const config = submitStateConfig[submitState];
  const isDisabled =
    disabled || loading || (submitState === 'initial' && !value.trim());

  const handleButtonClick = () => {
    if (submitState === 'next') {
      onNext();
    } else if (submitState === 'initial') {
      onSubmit();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isDisabled) {
      handleButtonClick();
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="flex items-center gap-2">
        {/* Input Container */}
        <div className="relative flex-1">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            variant="outline"
            disabled={disabled || loading}
            className="border-2 border-zinc-200 text-center"
          />

          {/* Clear Button */}
          {value && (
            <button
              onClick={onClear}
              className="absolute top-1/2 right-2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-gray-200 text-sm text-black transition-colors hover:bg-gray-300"
              disabled={disabled || loading}
            >
              ×
            </button>
          )}
        </div>

        {/* Submit/Next Button */}
        <Button
          variant={config.variant}
          onClick={handleButtonClick}
          disabled={isDisabled}
          loading={loading}
          icon={config.icon}
          className="min-w-[80px]"
        >
          {config.text}
        </Button>
      </div>
    </div>
  );
}
