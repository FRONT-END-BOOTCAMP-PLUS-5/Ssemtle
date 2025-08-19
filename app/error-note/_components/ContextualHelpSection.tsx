'use client';

import { useState, useRef, useEffect } from 'react';

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
  isDraggable?: boolean;
}

export default function ContextualHelpSection({
  focusZone,
  currentProblem,
  isDraggable = false,
}: ContextualHelpSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLButtonElement>(null);

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

  // Draggable functionality for mobile
  useEffect(() => {
    if (!isDraggable || !dragHandleRef.current) return;

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    };

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({
        x: touch.clientX - position.x,
        y: touch.clientY - position.y,
      });
    };

    const dragHandle = dragHandleRef.current;
    dragHandle.addEventListener('mousedown', handleMouseDown);
    dragHandle.addEventListener('touchstart', handleTouchStart);

    return () => {
      dragHandle.removeEventListener('mousedown', handleMouseDown);
      dragHandle.removeEventListener('touchstart', handleTouchStart);
    };
  }, [isDraggable, position.x, position.y]);

  // Constrain position to viewport boundaries
  const constrainToViewport = (x: number, y: number) => {
    if (!elementRef.current) return { x, y };

    const element = elementRef.current;
    const rect = element.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calculate boundaries (with small padding)
    const padding = 16;
    const minX = -rect.width + padding;
    const maxX = viewportWidth - padding;
    const minY = padding;
    const maxY = viewportHeight - rect.height - padding;

    return {
      x: Math.max(minX, Math.min(maxX, x)),
      y: Math.max(minY, Math.min(maxY, y)),
    };
  };

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
      // Ensure final position is within viewport
      setPosition((prev) => constrainToViewport(prev.x, prev.y));
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
  }, [isDragging, dragStart.x, dragStart.y]);

  // Handle viewport resize to keep element in bounds
  useEffect(() => {
    if (!isDraggable) return;

    const handleResize = () => {
      setPosition((prev) => constrainToViewport(prev.x, prev.y));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isDraggable]);

  return (
    <div
      ref={elementRef}
      className={`mx-auto w-full tablet:min-w-sm ${
        isDraggable ? 'fixed top-0 left-0 max-w-sm' : ''
      }`}
      style={
        isDraggable
          ? {
              transform: `translate(${position.x}px, ${position.y}px)`,
              zIndex: isDragging ? 1000 : 50,
              transition: isDragging ? 'none' : 'transform 0.2s ease-out',
              width: isDraggable ? 'calc(100vw - 2rem)' : 'auto',
              maxWidth: isDraggable ? '400px' : 'auto',
            }
          : {}
      }
    >
      {/* Help Content Section */}
      <div className="mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-full rounded-xl bg-gray-50 p-4 text-left transition-colors hover:bg-gray-100 ${
            isDraggable ? 'cursor-move' : ''
          } ${isDragging ? 'bg-gray-100 shadow-2xl' : ''}`}
          ref={isDraggable ? dragHandleRef : undefined}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isDraggable && (
                <div className="flex flex-col space-y-1 opacity-50">
                  <div className="h-1 w-4 rounded bg-gray-400"></div>
                  <div className="h-1 w-4 rounded bg-gray-400"></div>
                  <div className="h-1 w-4 rounded bg-gray-400"></div>
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
    </div>
  );
}
