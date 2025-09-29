'use client';

import { FocusZone, ErrorNoteProblem } from '../../../hooks/useHelpContent';

interface HelpContentDisplayProps {
  content: string;
  showContent: boolean;
  focusZone: FocusZone;
  currentProblem?: ErrorNoteProblem;
}

export default function HelpContentDisplay({
  content,
  showContent,
  focusZone,
  currentProblem,
}: HelpContentDisplayProps) {
  return (
    <div className="transition-opacity duration-200 ease-in-out">
      {showContent ? (
        <div className="animate-in fade-in space-y-3 duration-200">
          <p className="leading-relaxed whitespace-pre-wrap text-gray-700">
            {content}
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
                <strong>힌트:</strong> 가상 키보드를 사용하여 정답을 다시
                입력해보세요.
              </p>
            </div>
          )}
        </div>
      ) : (
        <p className="animate-in fade-in leading-relaxed whitespace-pre-wrap text-gray-500 italic duration-200">
          {content}
        </p>
      )}
    </div>
  );
}
