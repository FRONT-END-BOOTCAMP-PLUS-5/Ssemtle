'use client';

import { useState } from 'react';
import { SubmitState } from './AnswerSection';

interface HelpSectionProps {
  helpText: string;
  videoUrl?: string;
  unitName?: string;
  submitState?: SubmitState;
}

export default function HelpSection({
  helpText,
  videoUrl,
  unitName,
  submitState = 'initial',
}: HelpSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="mx-auto w-full tablet:min-w-sm">
      {/* Help Text Section - only show after answer submission */}
      {helpText && submitState !== 'initial' && (
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
              {unitName
                ? `${unitName}에 도움이 되는 링크를 첨부합니다.`
                : '도움이 되는 링크를 첨부합니다.'}
            </p>
          </div>

          <div className="relative flex aspect-video items-center justify-center bg-gray-900">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube-nocookie.com/embed/${videoUrl}`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              style={{ border: 0 }}
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}
