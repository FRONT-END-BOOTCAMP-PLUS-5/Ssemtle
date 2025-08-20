'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useInfiniteGets } from '@/hooks/useInfiniteGets';
import { useGets } from '@/hooks/useGets';
import ErrorNoteCard from './ErrorNoteCard';
import VirtualKeyboard from './VirtualKeyboard';
import ContextualHelpSection from './ContextualHelpSection';

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

interface ErrorNoteInterfaceProps {
  className?: string;
}

interface SolveItem {
  id: number;
  question: string;
  answer: string;
  helpText: string;
  userInput: string;
  isCorrect: boolean;
  createdAt: Date;
  unitId: number;
  userId: string;
  category: string;
}

interface UnitVideoResponse {
  data: {
    id: number;
    vidUrl: string;
  };
}

export default function ErrorNoteInterface({}: ErrorNoteInterfaceProps) {
  const { data: session, status } = useSession();

  const [focusedProblemId, setFocusedProblemId] = useState<string | null>(null);
  const [userInputs, setUserInputs] = useState<Map<string, string>>(new Map());
  const [submissionStates, setSubmissionStates] = useState<
    Map<string, 'initial' | 'correct' | 'incorrect'>
  >(new Map());
  const [isVirtualKeyboardVisible, setIsVirtualKeyboardVisible] =
    useState(false);
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Use infinite scrolling for wrong problems
  const {
    data: wrongSolves,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isError,
  } = useInfiniteGets<SolveItem>(
    ['wrong-solves'],
    '/solves/mode/wrong',
    !!session?.user?.id,
    {
      only: 'wrong',
      limit: '20',
    }
  );

  // Get the focused problem's unit ID for video loading
  const focusedProblem = focusedProblemId
    ? wrongSolves.find((solve) => solve.id.toString() === focusedProblemId)
    : null;

  // Fetch video URL for the focused problem's unit
  const { data: videoData } = useGets<UnitVideoResponse>(
    ['unitVideo', focusedProblem?.unitId],
    `/unitvidurl/${focusedProblem?.unitId}`,
    !!focusedProblem?.unitId
  );

  // Transform API data to match our interface
  const wrongProblems: ErrorNoteProblem[] = wrongSolves.map((solve) => ({
    id: solve.id.toString(),
    question: solve.question || 'No question available',
    userAnswer: solve.userInput || '',
    correctAnswer: solve.answer || '',
    helpText: solve.helpText || 'No help text available',
    instruction: undefined, // Not available in the API response
    unitName: solve.category, // Using category as unit name for now
    videoUrl:
      focusedProblemId === solve.id.toString() && videoData?.data?.vidUrl
        ? videoData.data.vidUrl
        : undefined,
  }));

  // Intersection observer for infinite scroll - using the better pattern
  const handleIntersection = useRef(
    (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          observer.unobserve(entry.target);
          fetchNextPage();
        }
      });
    }
  );

  // Update the handler closure with current values
  handleIntersection.current = (
    entries: IntersectionObserverEntry[],
    observer: IntersectionObserver
  ) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        observer.unobserve(entry.target);
        fetchNextPage();
      }
    });
  };

  useEffect(() => {
    if (!loaderRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => handleIntersection.current(entries, observer),
      {
        root: null,
        rootMargin: '20px',
        threshold: 0,
      }
    );

    observer.observe(loaderRef.current);

    return () => observer.disconnect();
  }, [wrongProblems.length]);

  // Re-observe when fetch completes
  useEffect(() => {
    if (!isFetchingNextPage && hasNextPage && loaderRef.current) {
      const observer = new IntersectionObserver(
        (entries) => handleIntersection.current(entries, observer),
        {
          root: null,
          rootMargin: '20px',
          threshold: 0,
        }
      );
      observer.observe(loaderRef.current);

      return () => observer.disconnect();
    }
  }, [isFetchingNextPage, hasNextPage]);

  const handleCardFocus = (problemId: string) => {
    // Cancel any pending blur timeout
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }

    setFocusedProblemId(problemId);
    setIsVirtualKeyboardVisible(true);

    // Focus the actual input element within this card
    setTimeout(() => {
      const cardElement = document.querySelector(
        `[data-problem-card="${problemId}"]`
      );
      const inputElement = cardElement?.querySelector(
        'input[type="text"]'
      ) as HTMLInputElement;
      if (inputElement) {
        inputElement.focus();
      }
    }, 100);
  };

  const handleCardBlur = () => {
    // Use ref to track timeout and prevent flickering
    blurTimeoutRef.current = setTimeout(() => {
      // Check if focus moved to virtual keyboard or another input within the same card
      const activeElement = document.activeElement;
      if (
        activeElement &&
        (activeElement.closest('[data-virtual-keyboard]') ||
          activeElement.closest('[data-clickable-zone]'))
      ) {
        return;
      }

      // Reset everything to initial state
      setFocusedProblemId(null);
      setIsVirtualKeyboardVisible(false);
      blurTimeoutRef.current = null;
    }, 200);
  };

  // Enhanced blur handler that also listens to document-level focus changes
  useEffect(() => {
    const handleDocumentFocusChange = () => {
      // Small delay to let focus settle
      setTimeout(() => {
        const activeElement = document.activeElement;

        // If focus is not on any input or virtual keyboard, reset state
        if (
          !activeElement ||
          (!activeElement.closest('input[type="text"]') &&
            !activeElement.closest('[data-virtual-keyboard]') &&
            !activeElement.closest('[data-clickable-zone]'))
        ) {
          setFocusedProblemId(null);
          setIsVirtualKeyboardVisible(false);
          if (blurTimeoutRef.current) {
            clearTimeout(blurTimeoutRef.current);
            blurTimeoutRef.current = null;
          }
        }
      }, 150);
    };

    // Listen for focus changes on the document
    document.addEventListener('focusin', handleDocumentFocusChange);
    document.addEventListener('click', handleDocumentFocusChange);

    return () => {
      document.removeEventListener('focusin', handleDocumentFocusChange);
      document.removeEventListener('click', handleDocumentFocusChange);
    };
  }, []);

  const handleInputChange = (problemId: string, value: string) => {
    setUserInputs((prev) => new Map(prev).set(problemId, value));
  };

  const handleNumberClick = (number: string) => {
    if (!focusedProblemId) return;
    const currentValue = userInputs.get(focusedProblemId) || '';
    setUserInputs((prev) =>
      new Map(prev).set(focusedProblemId, currentValue + number)
    );
  };

  const handleOperatorClick = (operator: string) => {
    if (!focusedProblemId) return;
    const currentValue = userInputs.get(focusedProblemId) || '';
    setUserInputs((prev) =>
      new Map(prev).set(focusedProblemId, currentValue + operator)
    );
  };

  const handleClear = () => {
    if (!focusedProblemId) return;
    setUserInputs((prev) => new Map(prev).set(focusedProblemId, ''));
  };

  const handleSubmissionResult = (problemId: string, isCorrect: boolean) => {
    setSubmissionStates((prev) =>
      new Map(prev).set(problemId, isCorrect ? 'correct' : 'incorrect')
    );
  };

  // Cleanup blur timeout on unmount
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  // Check authentication and loading state
  if (status === 'loading' || isLoading) {
    return (
      <div className="mx-auto flex items-center justify-center bg-[var(--color-background)]">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-violet-500"></div>
          <p className="text-gray-600">오답노트를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!session?.user?.id) {
    return (
      <div className="mx-auto flex items-center justify-center bg-[var(--color-background)]">
        <div className="text-center">
          <p className="mb-4 text-gray-600">로그인이 필요합니다</p>
        </div>
      </div>
    );
  }

  if (!isLoading && wrongProblems.length === 0) {
    return (
      <div className="mx-auto flex items-center justify-center bg-[var(--color-background)]">
        <div className="text-center">
          <p className="mb-4 text-gray-600">오답 문제가 없습니다!</p>
          <p className="text-sm text-gray-500">
            모든 문제를 정확히 풀었습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full">
      <div className="mx-auto pt-6 tablet:px-32">
        {/* Mobile Layout: Help Section above Cards */}
        <div className="tablet:hidden">
          {/* Header */}
          <div className="mb-6 px-4 text-center">
            <h1 className="text-2xl font-bold text-gray-800">오답노트</h1>
            <p className="mt-2 text-gray-600">틀린 문제들을 다시 풀어보세요</p>
          </div>

          {/* Contextual Help Section - Draggable on mobile */}
          <div className="mb-6 px-4">
            <ContextualHelpSection
              focusZone={focusedProblemId ? 'answer' : 'none'}
              currentProblem={
                focusedProblemId
                  ? wrongProblems.find((p) => p.id === focusedProblemId)
                  : undefined
              }
              isDraggable={true}
            />
          </div>

          {/* Error Note Cards */}
          <div className="space-y-6 px-4">
            {wrongProblems.map((problem) => (
              <ErrorNoteCard
                key={problem.id}
                problem={problem}
                onFocus={handleCardFocus}
                onBlur={handleCardBlur}
                onInputChange={handleInputChange}
                userInput={userInputs.get(problem.id) || ''}
                submissionState={submissionStates.get(problem.id) || 'initial'}
                onSubmissionResult={handleSubmissionResult}
              />
            ))}

            {/* Loading indicator for infinite scroll */}
            {isFetchingNextPage && (
              <div className="flex justify-center py-4">
                <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-violet-500"></div>
              </div>
            )}

            {/* Intersection observer target for infinite scrolling */}
            {hasNextPage && <div ref={loaderRef} className="h-4 w-full" />}

            {/* End of results indicator */}
            {!hasNextPage && wrongProblems.length > 0 && (
              <div className="flex justify-center py-6">
                <div className="text-sm text-gray-500">
                  모든 오답노트를 불러왔습니다
                </div>
              </div>
            )}

            {/* Error state */}
            {isError && (
              <div className="flex justify-center py-12">
                <div className="text-sm text-red-600">
                  데이터를 불러오는데 실패했습니다
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tablet+ Layout: Side-by-side layout */}
        <div className="mx-auto hidden w-full gap-12 tablet:flex">
          {/* Main Content - Scrollable Cards */}
          <div className="max-h-full flex-1 overflow-y-auto pr-4">
            <div className="space-y-6">
              {/* Header */}
              <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-gray-800">오답노트</h1>
                <p className="mt-2 text-gray-600">
                  틀린 문제들을 다시 풀어보세요
                </p>
              </div>

              {/* Error Note Cards */}
              {wrongProblems.map((problem) => (
                <ErrorNoteCard
                  key={problem.id}
                  problem={problem}
                  onFocus={handleCardFocus}
                  onBlur={handleCardBlur}
                  onInputChange={handleInputChange}
                  userInput={userInputs.get(problem.id) || ''}
                  submissionState={
                    submissionStates.get(problem.id) || 'initial'
                  }
                  onSubmissionResult={handleSubmissionResult}
                />
              ))}

              {/* Loading indicator for infinite scroll */}
              {isFetchingNextPage && (
                <div className="flex justify-center py-4">
                  <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-violet-500"></div>
                </div>
              )}

              {/* Intersection observer target for infinite scrolling */}
              {hasNextPage && <div ref={loaderRef} className="h-4 w-full" />}

              {/* End of results indicator */}
              {!hasNextPage && wrongProblems.length > 0 && (
                <div className="flex justify-center py-6">
                  <div className="text-sm text-gray-500">
                    모든 오답노트를 불러왔습니다
                  </div>
                </div>
              )}

              {/* Error state */}
              {isError && (
                <div className="flex justify-center py-12">
                  <div className="text-sm text-red-600">
                    데이터를 불러오는데 실패했습니다
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contextual Help Section - Fixed on tablet+ */}
          <div className="w-80 flex-shrink-0">
            <div className="sticky top-6">
              <ContextualHelpSection
                focusZone={focusedProblemId ? 'answer' : 'none'}
                currentProblem={
                  focusedProblemId
                    ? wrongProblems.find((p) => p.id === focusedProblemId)
                    : undefined
                }
                isDraggable={false}
              />
            </div>
          </div>
        </div>

        {/* Virtual Keyboard */}
        <VirtualKeyboard
          isVisible={isVirtualKeyboardVisible}
          onNumberClick={handleNumberClick}
          onOperatorClick={handleOperatorClick}
          onClear={handleClear}
          disabled={false}
        />
      </div>
    </div>
  );
}
