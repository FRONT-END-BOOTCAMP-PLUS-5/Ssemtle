'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { ButtonVariant } from '../atoms/Button';
import HelpModal from './HelpModal';
import MathInput from './MathInput';

export type SubmitState = 'initial' | 'correct' | 'incorrect' | 'next';

interface AnswerSectionProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  onNext: () => void;
  onBlur?: () => void;
  submitState: SubmitState;
  wasAnswerCorrect?: boolean;
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
  onBlur,
  submitState,
  wasAnswerCorrect,
  loading = false,
  disabled = false,
  placeholder = '답을 입력해 주세요',
}: AnswerSectionProps) {
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const config = submitStateConfig[submitState];

  // Override variant for next button based on answer correctness
  const buttonVariant =
    submitState === 'next' && wasAnswerCorrect !== undefined
      ? wasAnswerCorrect
        ? 'correct'
        : 'incorrect'
      : config.variant;

  // Map ButtonVariant to MathInput variant
  const mathInputVariant: 'submit' | 'correct' | 'incorrect' | 'next' =
    buttonVariant === 'submit'
      ? 'submit'
      : buttonVariant === 'correct'
        ? 'correct'
        : buttonVariant === 'incorrect'
          ? 'incorrect'
          : buttonVariant === 'next'
            ? 'next'
            : 'submit';

  const isDisabled =
    disabled || loading || (submitState === 'initial' && !value.trim());

  const handleButtonClick = () => {
    if (submitState === 'next') {
      onNext();
    } else if (submitState === 'initial' && onSubmit) {
      onSubmit();
    }
  };

  return (
    <>
      {/* Help Modal - Rendered via portal to avoid positioning issues */}
      {typeof window !== 'undefined' &&
        isHelpModalOpen &&
        createPortal(
          <HelpModal
            isOpen={isHelpModalOpen}
            onClose={() => setIsHelpModalOpen(false)}
          />,
          document.body
        )}

      <div className="mx-auto w-full">
        <div className="space-y-4">
          {/* Math Input with integrated buttons */}
          <MathInput
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled || loading}
            onSubmit={onSubmit ? handleButtonClick : undefined}
            onHelp={() => setIsHelpModalOpen(true)}
            onBlur={onBlur}
            submitDisabled={isDisabled}
            submitLoading={loading}
            submitText={config.text}
            submitVariant={mathInputVariant}
          />
        </div>
      </div>
    </>
  );
}
