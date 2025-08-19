'use client';

import { useState } from 'react';
import ProblemDisplay from '../molecules/ProblemDisplay';
import AnswerSection, { SubmitState } from '../molecules/AnswerSection';
import NumberPad from '../molecules/NumberPad';
import HelpSection from '../molecules/HelpSection';

interface Problem {
  id: string;
  question: string;
  answer: string;
  helpText: string;
  instruction?: string;
}

interface PracticeInterfaceProps {
  userName: string;
  unitName: string;
  currentProblem: Problem | null;
  videoUrl?: string;
  loading?: boolean;
  onSubmitAnswer: (
    userInput: string,
    problem: Problem
  ) => Promise<{ isCorrect: boolean }>;
  onGenerateNext: () => void;
}

export default function PracticeInterface({
  userName,
  unitName,
  currentProblem,
  videoUrl,
  loading = false,
  onSubmitAnswer,
  onGenerateNext,
}: PracticeInterfaceProps) {
  const [userInput, setUserInput] = useState('');
  const [submitState, setSubmitState] = useState<SubmitState>('initial');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wasAnswerCorrect, setWasAnswerCorrect] = useState<boolean | undefined>(
    undefined
  );

  const handleInputChange = (value: string) => {
    setUserInput(value);
    if (submitState !== 'initial') {
      setSubmitState('initial');
    }
  };

  const handleNumberClick = (number: string) => {
    if (submitState === 'initial') {
      setUserInput((prev) => prev + number);
    }
  };

  const handleOperatorClick = (operator: string) => {
    if (submitState === 'initial') {
      setUserInput((prev) => prev + operator);
    }
  };

  const handleClear = () => {
    setUserInput('');
    if (submitState !== 'initial') {
      setSubmitState('initial');
    }
  };

  const handleSubmit = async () => {
    if (!currentProblem || !userInput.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const result = await onSubmitAnswer(userInput.trim(), currentProblem);
      setWasAnswerCorrect(result.isCorrect);
      setSubmitState(result.isCorrect ? 'correct' : 'incorrect');

      // Auto-transition to next state after 1.5 seconds
      setTimeout(() => {
        setSubmitState('next');
      }, 1500);
    } catch (error) {
      console.error('Submit error:', error);
      // Reset to initial state on error
      setSubmitState('initial');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    setUserInput('');
    setSubmitState('initial');
    setWasAnswerCorrect(undefined);
    onGenerateNext();
  };

  if (!currentProblem) {
    return (
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-3xl bg-white p-8 text-center shadow-lg">
          {loading ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-violet-500"></div>
              <p className="text-gray-600">문제를 생성하고 있습니다...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600">문제를 불러올 수 없습니다.</p>
              <button
                onClick={onGenerateNext}
                className="rounded-lg bg-violet-500 px-4 py-2 text-white transition-colors hover:bg-violet-600"
              >
                다시 시도
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full flex-col space-y-6 tablet:flex-row tablet:justify-end tablet:gap-12">
      <div className="flex w-full flex-col space-y-6 tablet:w-auto">
        {/* Problem Display */}
        <ProblemDisplay
          title={`${userName} - ${unitName}`}
          equation={currentProblem.question}
        />

        {/* Answer Input */}
        <AnswerSection
          value={userInput}
          onChange={handleInputChange}
          onSubmit={handleSubmit}
          onNext={handleNext}
          submitState={submitState}
          wasAnswerCorrect={wasAnswerCorrect}
          loading={isSubmitting}
          disabled={loading}
        />

        {/* Number Pad */}
        <NumberPad
          onNumberClick={handleNumberClick}
          onOperatorClick={handleOperatorClick}
          onClear={handleClear}
          disabled={loading || isSubmitting || submitState !== 'initial'}
        />
      </div>
      <div>
        <HelpSection
          helpText={currentProblem.helpText}
          videoUrl={videoUrl}
          unitName={unitName}
          submitState={submitState}
        />
      </div>
      {/* Help Section */}
    </div>
  );
}
