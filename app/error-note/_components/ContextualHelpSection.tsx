'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

type FocusZone = 'none' | 'problem' | 'answer';

interface ErrorNoteProblem {
  id: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  helpText: string;
  instruction?: string;
  unitName?: string;
  videoUrl?: string;
}

interface ContextualHelpSectionProps {
  focusZone: FocusZone;
  currentProblem?: ErrorNoteProblem;
  isDraggable?: boolean;
}

export default function ContextualHelpSection({
  focusZone,
  currentProblem,
  isDraggable = false,
}: ContextualHelpSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isDragModeEnabled, setIsDragModeEnabled] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLButtonElement>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dragModeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef(false);

  const getHelpContent = () => {
    if (!currentProblem || focusZone === 'none') {
      return {
        title: '오답노트',
        content: '문제나 답안 영역을 클릭하면 관련 도움말이 표시됩니다.',
        videoUrl: undefined,
        showContent: false,
      };
    }

    switch (focusZone) {
      case 'problem':
        return {
          title: '문제 분석',
          content: `문제: ${currentProblem.question}\n\n이 문제는 ${currentProblem.instruction || '수학 문제'}입니다.\n\n정답: ${currentProblem.correctAnswer}\n당신의 답: ${currentProblem.userAnswer}`,
          videoUrl: currentProblem.videoUrl,
          showContent: true,
        };
      case 'answer':
        return {
          title: '풀이 도움말',
          content:
            currentProblem.helpText || '이 문제에 대한 자세한 설명이 없습니다.',
          videoUrl: currentProblem.videoUrl,
          showContent: true,
        };
      default:
        return {
          title: '오답노트',
          content: '문제나 답안 영역을 클릭하면 관련 도움말이 표시됩니다.',
          videoUrl: undefined,
          showContent: false,
        };
    }
  };

  const helpContent = getHelpContent();

  // Long press detection and drag mode management
  const handleLongPress = useCallback(() => {
    if (!isDraggable) return;
    setIsDragModeEnabled(true);
    isLongPressRef.current = true;
  }, [isDraggable]);

  const disableDragMode = useCallback(() => {
    setIsDragModeEnabled(false);
    if (dragModeTimeoutRef.current) {
      clearTimeout(dragModeTimeoutRef.current);
      dragModeTimeoutRef.current = null;
    }
  }, []);

  const handleClick = useCallback(() => {
    if (!isLongPressRef.current) {
      setIsExpanded(!isExpanded);
    }
    isLongPressRef.current = false;
  }, [isExpanded]);

  // Gesture detection and draggable functionality
  useEffect(() => {
    if (!isDraggable || !dragHandleRef.current) return;

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      isLongPressRef.current = false;

      // Start long press timer
      longPressTimerRef.current = setTimeout(() => {
        handleLongPress();
      }, 500); // 500ms for long press

      // Only start dragging if drag mode is enabled
      if (isDragModeEnabled) {
        setIsDragging(true);
        setDragStart({
          x: e.clientX - position.x,
          y: e.clientY - position.y,
        });
      }
    };

    const handleMouseUp = () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }

      if (!isLongPressRef.current && !isDragging) {
        handleClick();
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      isLongPressRef.current = false;

      // Start long press timer
      longPressTimerRef.current = setTimeout(() => {
        handleLongPress();
      }, 500); // 500ms for long press

      // Only start dragging if drag mode is enabled
      if (isDragModeEnabled) {
        setIsDragging(true);
        setDragStart({
          x: touch.clientX - position.x,
          y: touch.clientY - position.y,
        });
      }
    };

    const handleTouchEnd = () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }

      if (!isLongPressRef.current && !isDragging) {
        handleClick();
      }
    };

    const dragHandle = dragHandleRef.current;
    dragHandle.addEventListener('mousedown', handleMouseDown);
    dragHandle.addEventListener('mouseup', handleMouseUp);
    dragHandle.addEventListener('touchstart', handleTouchStart);
    dragHandle.addEventListener('touchend', handleTouchEnd);

    return () => {
      dragHandle.removeEventListener('mousedown', handleMouseDown);
      dragHandle.removeEventListener('mouseup', handleMouseUp);
      dragHandle.removeEventListener('touchstart', handleTouchStart);
      dragHandle.removeEventListener('touchend', handleTouchEnd);

      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, [
    isDraggable,
    position.x,
    position.y,
    isDragModeEnabled,
    isDragging,
    handleLongPress,
    handleClick,
  ]);

  // Constrain position to viewport boundaries
  const constrainToViewport = useCallback((x: number, y: number) => {
    if (!elementRef.current) return { x, y };

    const element = elementRef.current;
    const rect = element.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calculate boundaries (with small padding)
    const padding = 16;
    const minX = padding - rect.width + 100; // Allow partial visibility
    const maxX = viewportWidth - padding - 100; // Allow partial visibility
    const minY = padding;
    const maxY = viewportHeight - rect.height - padding;

    return {
      x: Math.max(minX, Math.min(maxX, x)),
      y: Math.max(minY, Math.min(maxY, y)),
    };
  }, []);

  // Auto-adjust position to ensure component is fully visible
  const autoAdjustPosition = useCallback(() => {
    if (!elementRef.current || !isDraggable) return;

    const element = elementRef.current;
    const rect = element.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const padding = 16;

    let newX = position.x;
    let newY = position.y;
    let needsAdjustment = false;

    // Check if component is fully visible
    if (rect.left < padding) {
      newX = padding;
      needsAdjustment = true;
    } else if (rect.right > viewportWidth - padding) {
      newX = viewportWidth - rect.width - padding;
      needsAdjustment = true;
    }

    if (rect.top < padding) {
      newY = padding;
      needsAdjustment = true;
    } else if (rect.bottom > viewportHeight - padding) {
      newY = viewportHeight - rect.height - padding;
      needsAdjustment = true;
    }

    if (needsAdjustment) {
      setPosition({ x: newX, y: newY });
    }
  }, [position.x, position.y, isDraggable]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newPosition = constrainToViewport(
        e.clientX - dragStart.x,
        e.clientY - dragStart.y
      );
      setPosition(newPosition);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const newPosition = constrainToViewport(
        touch.clientX - dragStart.x,
        touch.clientY - dragStart.y
      );
      setPosition(newPosition);
    };

    const handleEnd = () => {
      setIsDragging(false);

      // Auto-adjust position after dragging ends
      setTimeout(() => {
        autoAdjustPosition();
      }, 100);

      // Start 1-second timeout to disable drag mode after drag ends
      if (dragModeTimeoutRef.current) {
        clearTimeout(dragModeTimeoutRef.current);
      }
      dragModeTimeoutRef.current = setTimeout(() => {
        setIsDragModeEnabled(false);
      }, 1000);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [
    isDragging,
    dragStart.x,
    dragStart.y,
    constrainToViewport,
    autoAdjustPosition,
  ]);

  // Handle viewport resize to keep element in bounds
  useEffect(() => {
    if (!isDraggable) return;

    const handleResize = () => {
      autoAdjustPosition();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isDraggable, autoAdjustPosition]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
      if (dragModeTimeoutRef.current) {
        clearTimeout(dragModeTimeoutRef.current);
      }
    };
  }, []);

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
          isDraggable ? 'fixed top-0 left-0 max-w-sm' : ''
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
          <button
            className={`w-full rounded-xl bg-gray-50 p-4 text-left transition-all duration-200 ${
              isDraggable && isDragModeEnabled
                ? 'cursor-grab shadow-lg'
                : isDraggable
                  ? 'cursor-pointer hover:bg-gray-100'
                  : 'cursor-pointer hover:bg-gray-100'
            } ${
              isDragging
                ? 'scale-105 cursor-grabbing bg-gray-200 shadow-2xl'
                : isDragModeEnabled
                  ? 'bg-gray-100 shadow-md'
                  : ''
            }`}
            ref={isDraggable ? dragHandleRef : undefined}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {isDraggable && (
                  <div
                    className={`flex flex-col space-y-1 transition-all duration-200 ${
                      isDragModeEnabled ? 'scale-110 opacity-70' : 'opacity-50'
                    }`}
                  >
                    <div
                      className={`h-1 w-4 rounded transition-colors ${
                        isDragModeEnabled ? 'bg-blue-500' : 'bg-gray-400'
                      }`}
                    ></div>
                    <div
                      className={`h-1 w-4 rounded transition-colors ${
                        isDragModeEnabled ? 'bg-blue-500' : 'bg-gray-400'
                      }`}
                    ></div>
                    <div
                      className={`h-1 w-4 rounded transition-colors ${
                        isDragModeEnabled ? 'bg-blue-500' : 'bg-gray-400'
                      }`}
                    ></div>
                  </div>
                )}
                <h3 className="text-lg font-bold text-gray-800">
                  {helpContent.title}
                </h3>
              </div>
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

        {/* Video Section */}
        {helpContent.videoUrl && helpContent.showContent && isExpanded && (
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
                  src={`https://www.youtube-nocookie.com/embed/${helpContent.videoUrl}`}
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  style={{ border: 0 }}
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
