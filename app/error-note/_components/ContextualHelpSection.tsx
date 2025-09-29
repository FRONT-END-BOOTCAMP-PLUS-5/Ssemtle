'use client';

import { useRef } from 'react';
import { useDragAndDrop } from '../../../hooks/useDragAndDrop';
import { usePositioning } from '../../../hooks/usePositioning';
import {
  useHelpContent,
  FocusZone,
  ErrorNoteProblem,
} from '../../../hooks/useHelpContent';
import HelpContentDisplay from './HelpContentDisplay';
import VideoSection from './VideoSection';
import DragHandle from './DragHandle';

interface ContextualHelpSectionProps {
  focusZone: FocusZone;
  currentProblem?: ErrorNoteProblem;
  isDraggable?: boolean;
  onExpansionChange?: (isExpanded: boolean) => void;
}

export default function ContextualHelpSection({
  focusZone,
  currentProblem,
  isDraggable = false,
  onExpansionChange,
}: ContextualHelpSectionProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  // Use positioning hook first to get functions
  const { constrainToViewport, autoAdjustPosition } = usePositioning({
    isDraggable,
    position: { x: 0, y: 0 },
    setPosition: () => {},
    elementRef,
  });

  // Use drag and drop hook with positioning functions
  const {
    isDragging,
    isDragModeEnabled,
    position,
    isExpanded,
    dragHandleRef,
    setPosition,
    disableDragMode,
    handleClick,
  } = useDragAndDrop({
    isDraggable,
    onExpansionChange,
    constrainToViewport,
    autoAdjustPosition,
  });

  // Update positioning hook with actual position and setPosition
  usePositioning({
    isDraggable,
    position,
    setPosition,
    elementRef,
  });

  // Use help content hook
  const helpContent = useHelpContent({
    focusZone,
    currentProblem,
    isExpanded,
  });

  return (
    <>
      {/* CSS for wiggle animation */}
      <style jsx>{`
        @keyframes wiggle {
          0%,
          100% {
            transform: translate(${position.x}px, ${position.y}px) rotate(0deg)
              scale(1);
          }
          12.5% {
            transform: translate(${position.x}px, ${position.y}px) rotate(-1deg)
              scale(1.02);
          }
          25% {
            transform: translate(${position.x}px, ${position.y}px) rotate(1deg)
              scale(1);
          }
          37.5% {
            transform: translate(${position.x}px, ${position.y}px) rotate(-1deg)
              scale(1.02);
          }
          50% {
            transform: translate(${position.x}px, ${position.y}px) rotate(1deg)
              scale(1);
          }
          62.5% {
            transform: translate(${position.x}px, ${position.y}px) rotate(-1deg)
              scale(1.02);
          }
          75% {
            transform: translate(${position.x}px, ${position.y}px) rotate(1deg)
              scale(1);
          }
          87.5% {
            transform: translate(${position.x}px, ${position.y}px) rotate(-1deg)
              scale(1.02);
          }
        }
        .wiggle-animation {
          animation: wiggle 2s ease-in-out infinite;
        }
      `}</style>

      <div
        ref={elementRef}
        className={`mx-auto w-full tablet:min-w-sm ${
          isDraggable ? 'fixed top-12 left-0 max-w-sm' : ''
        } ${isDragModeEnabled && !isDragging ? 'wiggle-animation' : ''} ${
          isDragModeEnabled
            ? 'ring-opacity-50 rounded-xl ring-2 ring-blue-300'
            : ''
        }`}
        style={
          isDraggable
            ? {
                transform:
                  isDragModeEnabled && !isDragging
                    ? 'none' // Let CSS animation handle transform when wiggling
                    : `translate(${position.x}px, ${position.y}px)`,
                zIndex: isDragging ? 1000 : isDragModeEnabled ? 100 : 50,
                transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                width: isDraggable ? 'calc(100vw - 2rem)' : 'auto',
                maxWidth: isDraggable ? '400px' : 'auto',
                opacity: isDragging ? 0.8 : 1,
              }
            : {}
        }
        onClick={disableDragMode}
      >
        {/* Help Content Section */}
        <div className="mb-4">
          <DragHandle
            ref={isDraggable ? dragHandleRef : undefined}
            title={helpContent.title}
            isDraggable={isDraggable}
            isDragModeEnabled={isDragModeEnabled}
            isDragging={isDragging}
            isExpanded={isExpanded}
            onClick={handleClick}
          />

          {isExpanded && (
            <div className="mt-2 rounded-xl border border-gray-200 bg-white p-4 transition-all duration-300 ease-in-out">
              <HelpContentDisplay
                content={helpContent.content}
                showContent={helpContent.showContent}
                focusZone={focusZone}
                currentProblem={currentProblem}
              />
            </div>
          )}
        </div>

        {/* Video Section */}
        {helpContent.videoUrl && helpContent.showContent && isExpanded && (
          <VideoSection
            videoUrl={helpContent.videoUrl}
            currentProblem={currentProblem}
          />
        )}
      </div>
    </>
  );
}
