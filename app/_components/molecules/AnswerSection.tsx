'use client';

import Button, { ButtonVariant } from '../atoms/Button';
import MathInput from './MathInput';

export type SubmitState = 'initial' | 'correct' | 'incorrect' | 'next';

interface AnswerSectionProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onNext: () => void;
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

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="space-y-4">
        {/* Math Input */}
        <MathInput
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled || loading}
        />

        {/* Submit/Next Button */}
        <div className="flex justify-center">
          <Button
            variant={config.variant}
            onClick={handleButtonClick}
            disabled={isDisabled}
            loading={loading}
            icon={config.icon}
            className="min-w-[120px]"
          >
            {config.text}
          </Button>
        </div>
      </div>
    </div>
  );
}
