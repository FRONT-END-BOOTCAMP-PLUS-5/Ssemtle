'use client';

import { useCallback } from 'react';
import ProblemDisplay from '@/app/_components/molecules/ProblemDisplay';
import AnswerSection from '@/app/_components/molecules/AnswerSection';
import { usePuts } from '@/hooks/usePuts';

interface ErrorNoteProblem {
  id: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  helpText: string;
  instruction?: string;
  unitName?: string;
}

type SubmissionState = 'initial' | 'correct' | 'incorrect';

interface ErrorNoteCardProps {
  problem: ErrorNoteProblem;
  onFocus: (problemId: string) => void;
  onBlur: () => void;
  onInputChange: (problemId: string, value: string) => void;
  userInput: string;
  submissionState?: SubmissionState;
  onSubmissionResult: (problemId: string, isCorrect: boolean) => void;
}

export default function ErrorNoteCard({
  problem,
  onFocus,
  onBlur,
  onInputChange,
  userInput,
  submissionState = 'initial',
  onSubmissionResult,
}: ErrorNoteCardProps) {
  // PUT hook for submitting corrections
  const submitCorrection = usePuts<
    { userInput: string },
    { success: boolean; isCorrect?: boolean }
  >({
    onSuccess: (result) => {
      // Determine if the answer was correct based on the response
      const isCorrect = result.isCorrect ?? true; // Assume correct if not specified
      onSubmissionResult(problem.id, isCorrect);
    },
    onError: (error) => {
      console.error('Error submitting correction:', error);
      onSubmissionResult(problem.id, false);
    },
  });

  const handleSubmitCorrection = useCallback(() => {
    if (!userInput.trim()) return;

    submitCorrection.mutate({
      putData: { userInput: userInput.trim() },
      path: `/solves/${problem.id}`,
    });
  }, [problem.id, userInput, submitCorrection]);

  const handleInputChange = (value: string) => {
    onInputChange(problem.id, value);
  };

  const handleCardFocus = () => {
    onFocus(problem.id);
  };

  // Dynamic border classes based on submission state
  const getBorderClasses = () => {
    switch (submissionState) {
      case 'correct':
        return 'border-2 border-green-500 bg-green-50';
      case 'incorrect':
        return 'border-2 border-red-500 bg-red-50';
      default:
        return 'border border-gray-200 bg-white';
    }
  };

  // Dynamic problem info styling
  const getProblemInfoClasses = () => {
    switch (submissionState) {
      case 'correct':
        return 'bg-green-50 border border-green-200';
      case 'incorrect':
        return 'bg-red-50 border border-red-200';
      default:
        return 'bg-gray-50';
    }
  };

  return (
    <div className="mb-6 w-full" data-problem-card={problem.id}>
      <div
        className={`rounded-3xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl ${getBorderClasses()}`}
      >
        {/* Problem Display - Clickable Zone */}
        <div
          data-clickable-zone
          onClick={handleCardFocus}
          onBlur={onBlur}
          className="mb-4 cursor-pointer transition-all hover:scale-[1.01]"
        >
          <ProblemDisplay
            title={
              problem.unitName ? `오답노트 - ${problem.unitName}` : '오답노트'
            }
            equation={problem.question}
          />
        </div>

        {/* Answer Input - Clickable Zone */}
        <div
          data-clickable-zone
          onClick={handleCardFocus}
          onBlur={onBlur}
          className="mb-4 cursor-pointer transition-all hover:scale-[1.01]"
        >
          <div data-problem-id={problem.id}>
            <AnswerSection
              value={userInput}
              onChange={handleInputChange}
              onSubmit={handleSubmitCorrection}
              onNext={() => {}} // No next functionality in cards
              submitState={
                submissionState === 'correct'
                  ? 'correct'
                  : submissionState === 'incorrect'
                    ? 'incorrect'
                    : 'initial'
              }
              loading={submitCorrection.isPending}
              disabled={
                submitCorrection.isPending || submissionState === 'correct'
              }
              placeholder={
                submissionState === 'correct'
                  ? '정답입니다!'
                  : '정답을 다시 입력해보세요'
              }
            />
          </div>
        </div>

        {/* Problem Info */}
        <div
          className={`rounded-xl p-4 transition-all duration-300 ${getProblemInfoClasses()}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              지난 답안:
            </span>
            <span className="font-mono text-sm text-red-600">
              {problem.userAnswer || '없음'}
            </span>
          </div>
          {submissionState === 'correct' && (
            <div className="mt-2 border-t border-green-200 pt-2">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-green-600">✓</span>
                <span className="text-sm font-medium text-green-700">
                  정답을 맞혔습니다!
                </span>
              </div>
            </div>
          )}
          {submissionState === 'incorrect' && (
            <div className="mt-2 border-t border-red-200 pt-2">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-red-600">✗</span>
                <span className="text-sm font-medium text-red-700">
                  다시 시도해보세요
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
