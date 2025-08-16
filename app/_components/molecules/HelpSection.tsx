'use client';

import { useState } from 'react';

interface HelpSectionProps {
  helpText: string;
  videoUrl?: string;
  unitName?: string;
}

export default function HelpSection({
  helpText,
  videoUrl,
  unitName,
}: HelpSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mx-auto mt-6 w-full max-w-md">
      {/* Help Text Section */}
      {helpText && (
        <div className="mb-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full rounded-xl bg-gray-50 p-4 text-left transition-colors hover:bg-gray-100"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">해설</h3>
              <span
                className={`text-gray-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              >
                ▼
              </span>
            </div>
          </button>

          {isExpanded && (
            <div className="mt-2 rounded-xl border border-gray-200 bg-white p-4">
              <p className="leading-relaxed whitespace-pre-wrap text-gray-700">
                {helpText}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Video Section */}
      {videoUrl && (
        <div className="overflow-hidden rounded-xl bg-gray-800">
          <div className="bg-gray-700 p-4">
            <p className="text-sm font-medium text-white">
              입자방정식에 도움이 되는 링크를 첨부합니다.
            </p>
          </div>

          <div className="relative flex aspect-video items-center justify-center bg-gray-900">
            {/* Video Player Placeholder */}
            <div className="flex flex-col items-center text-white">
              <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-violet-500">
                <svg
                  className="ml-1 h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <span className="text-sm">
                {unitName ? `${unitName} 강의 영상` : '강의 영상'}
              </span>
              <span className="mt-1 text-xs text-gray-400">13:32</span>
            </div>

            {/* Actual video would be implemented here */}
            {/* For now, this is a placeholder matching the design */}
          </div>
        </div>
      )}

      {/* Progress Indicator */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">도움말</p>
        <div className="mt-2 flex items-center justify-center space-x-2">
          <span className="text-sm text-gray-500">분수 표기법 → 1/3 →¼</span>
        </div>
      </div>
    </div>
  );
}
