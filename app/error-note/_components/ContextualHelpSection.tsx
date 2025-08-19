'use client';

import { useState } from 'react';

type FocusZone = 'none' | 'problem' | 'answer';

interface ErrorNoteProblem {
  id: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  helpText: string;
  instruction?: string;
}

interface ContextualHelpSectionProps {
  focusZone: FocusZone;
  currentProblem?: ErrorNoteProblem;
}

export default function ContextualHelpSection({
  focusZone,
  currentProblem,
}: ContextualHelpSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const getHelpContent = () => {
    if (!currentProblem || focusZone === 'none') {
      return {
        title: '오답노트',
        content: '문제나 답안 영역을 클릭하면 관련 도움말이 표시됩니다.',
        showContent: false,
      };
    }

    switch (focusZone) {
      case 'problem':
        return {
          title: '문제 분석',
          content: `문제: ${currentProblem.question}\n\n이 문제는 ${currentProblem.instruction || '수학 문제'}입니다.\n\n정답: ${currentProblem.correctAnswer}\n당신의 답: ${currentProblem.userAnswer}`,
          showContent: true,
        };
      case 'answer':
        return {
          title: '풀이 도움말',
          content:
            currentProblem.helpText || '이 문제에 대한 자세한 설명이 없습니다.',
          showContent: true,
        };
      default:
        return {
          title: '오답노트',
          content: '문제나 답안 영역을 클릭하면 관련 도움말이 표시됩니다.',
          showContent: false,
        };
    }
  };

  const helpContent = getHelpContent();

  return (
    <div className="mx-auto w-full tablet:min-w-sm">
      {/* Help Content Section */}
      <div className="mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full rounded-xl bg-gray-50 p-4 text-left transition-colors hover:bg-gray-100"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800">
              {helpContent.title}
            </h3>
            <span
              className={`text-gray-600 transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`}
            >
              ▼
            </span>
          </div>
        </button>

        {isExpanded && (
          <div className="mt-2 rounded-xl border border-gray-200 bg-white p-4 transition-all duration-300 ease-in-out">
            <div className="transition-opacity duration-200 ease-in-out">
              {helpContent.showContent ? (
                <div className="animate-in fade-in space-y-3 duration-200">
                  <p className="leading-relaxed whitespace-pre-wrap text-gray-700">
                    {helpContent.content}
                  </p>

                  {currentProblem && focusZone === 'problem' && (
                    <div className="animate-in slide-in-from-left mt-4 rounded-lg border-l-4 border-red-400 bg-red-50 p-3 transition-all duration-200">
                      <p className="text-sm text-red-800">
                        <strong>오답:</strong> {currentProblem.userAnswer}
                      </p>
                      <p className="text-sm text-green-800">
                        <strong>정답:</strong> {currentProblem.correctAnswer}
                      </p>
                    </div>
                  )}

                  {currentProblem && focusZone === 'answer' && (
                    <div className="animate-in slide-in-from-left mt-4 rounded-lg border-l-4 border-blue-400 bg-blue-50 p-3 transition-all duration-200">
                      <p className="text-sm text-blue-800">
                        <strong>힌트:</strong> 가상 키보드를 사용하여 정답을
                        다시 입력해보세요.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="animate-in fade-in leading-relaxed text-gray-500 italic duration-200">
                  {helpContent.content}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
