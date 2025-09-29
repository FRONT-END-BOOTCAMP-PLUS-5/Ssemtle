'use client';

import { ErrorNoteProblem } from '../../../hooks/useHelpContent';

interface VideoSectionProps {
  videoUrl: string;
  currentProblem?: ErrorNoteProblem;
}

export default function VideoSection({
  videoUrl,
  currentProblem,
}: VideoSectionProps) {
  return (
    <div className="mb-4">
      <div className="overflow-hidden rounded-xl bg-gray-800">
        <div className="bg-gray-700 p-4">
          <p className="text-sm font-medium text-white">
            {currentProblem?.unitName
              ? `${currentProblem.unitName}에 도움이 되는 링크를 첨부합니다.`
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
    </div>
  );
}
