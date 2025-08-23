'use client';

import { useState } from 'react';
import { IoChevronDown, IoChevronUp } from 'react-icons/io5';

interface TransformedSolve {
  id: number;
  question: string;
  answer: string;
  userInput: string | null;
  isCorrect: boolean;
  createdAt: string;
  unitId: number;
  category: string;
  isAttempted: boolean;
}

interface ExamResult {
  category: string;
  unitId: number;
  solves: TransformedSolve[];
  examCode: string;
  totalQuestions: number;
  attemptedQuestions: number;
  correctAnswers: number;
  accuracy: number;
}

interface ExamResultCardProps {
  examResult: ExamResult;
}

export default function ExamResultCard({ examResult }: ExamResultCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    examCode,
    correctAnswers,
    totalQuestions,
    attemptedQuestions,
    accuracy,
    solves,
  } = examResult;
  const incorrectAnswers = attemptedQuestions - correctAnswers;
  const unattemptedQuestions = totalQuestions - attemptedQuestions;
  const examDate = solves[0]
    ? new Date(solves[0].createdAt).toLocaleString('ko-KR')
    : '';

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm desktop:w-[30vw]">
      {/* Header with exam info */}
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            단원평가 {examCode}
          </h3>
          <span
            className={`text-sm font-medium ${
              accuracy >= 80
                ? 'text-green-600'
                : accuracy >= 60
                  ? 'text-yellow-600'
                  : 'text-red-600'
            }`}
          >
            {accuracy}%
          </span>
        </div>

        <div className="mb-3 text-sm text-gray-500">{examDate}</div>

        {/* Score summary */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex flex-wrap gap-3">
            <span className="text-green-600">정답: {correctAnswers}개</span>
            <span className="text-red-600">오답: {incorrectAnswers}개</span>
            {unattemptedQuestions > 0 && (
              <span className="text-gray-500">
                미응시: {unattemptedQuestions}개
              </span>
            )}
          </div>
          <span className="font-medium">
            {attemptedQuestions}/{totalQuestions} (응시함)
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200">
          <div
            className={`h-full rounded-full ${
              accuracy >= 80
                ? 'bg-green-500'
                : accuracy >= 60
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
            }`}
            style={{ width: `${accuracy}%` }}
          />
        </div>
      </div>

      {/* Expand/Collapse button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
      >
        <span>문제별 상세 결과</span>
        {isExpanded ? (
          <IoChevronUp className="h-4 w-4" />
        ) : (
          <IoChevronDown className="h-4 w-4" />
        )}
      </button>

      {/* Detailed results */}
      {isExpanded && (
        <div className="mt-4 space-y-3">
          {solves.map((solve, index) => (
            <div
              key={solve.id}
              className={`rounded-lg border p-3 ${
                !solve.isAttempted
                  ? 'border-gray-200 bg-gray-50' // Unattempted questions
                  : solve.isCorrect
                    ? 'border-green-200 bg-green-50' // Correct answers
                    : 'border-red-200 bg-red-50' // Incorrect answers
              }`}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  문제 {index + 1}
                </span>
                <span
                  className={`text-xs font-medium ${
                    !solve.isAttempted
                      ? 'text-gray-500'
                      : solve.isCorrect
                        ? 'text-green-600'
                        : 'text-red-600'
                  }`}
                >
                  {!solve.isAttempted
                    ? '미응시'
                    : solve.isCorrect
                      ? '정답'
                      : '오답'}
                </span>
              </div>

              <div className="mb-2 text-sm text-gray-800">{solve.question}</div>

              <div className="space-y-1 text-xs text-gray-600">
                {solve.isAttempted && solve.answer && (
                  <div>정답: {solve.answer}</div>
                )}
                <div
                  className={`${
                    !solve.isAttempted
                      ? 'text-gray-500'
                      : solve.isCorrect
                        ? 'text-green-600'
                        : 'text-red-600'
                  }`}
                >
                  입력한 답: {solve.userInput || '(미응시)'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
