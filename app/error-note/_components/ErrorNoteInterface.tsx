'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useInfiniteGets } from '@/hooks/useInfiniteGets';
import { useGets } from '@/hooks/useGets';
import { useKeyboardDetection } from '@/app/_hooks/useKeyboardDetection';
import { useIsTablet } from '@/hooks/useMediaQuery';

import ErrorNoteCard from '@/app/error-note/_components/ErrorNoteCard';
import VirtualKeyboard from '@/app/error-note/_components/VirtualKeyboard';
import ContextualHelpSection from '@/app/error-note/_components/ContextualHelpSection';

type SubmissionState = 'initial' | 'correct' | 'incorrect';

export interface FilterParams {
  filterDate?: string;
  startDate?: string;
  endDate?: string;
  category?: string;
  show?: string;
  unitId?: number;
}

export interface ErrorNoteConfig {
  // API configuration
  getEndpoint: (params: FilterParams & { effectiveUserId?: string }) => string;
  buildQueryParams: (
    filters: FilterParams & { effectiveUserId?: string; showAll?: boolean }
  ) => Record<string, string>;

  // Permissions & editing
  canEdit: boolean;
  targetUserId?: string;

  // UI customization
  title: string;
  showAllOption?: boolean;
  showReadOnlyIndicators?: boolean;
  readOnlyMessage?: string;
}

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

interface SolveItem {
  id: number;
  question: string;
  answer: string;
  helpText: string;
  userInput: string;
  isCorrect: boolean; // ✅ 이미 존재
  createdAt: string | Date;
  unitId: number;
  userId: string;
  category: string;
}

interface UnitVideoResponse {
  data: { id: number; vidUrl: string };
}

interface ErrorNoteInterfaceProps {
  config?: ErrorNoteConfig;
}

// Default configuration for own error notes (original behavior)
const createDefaultConfig = (): ErrorNoteConfig => ({
  getEndpoint: ({ show }) =>
    show === 'all' ? '/solves/list' : '/solves/mode/wrong',
  buildQueryParams: ({ filterDate, startDate, endDate, category, showAll }) => {
    const base: Record<string, string> = { limit: '20' };
    if (!showAll) base.only = 'wrong';
    if (filterDate) {
      base.start = filterDate;
      base.end = filterDate;
    } else {
      if (startDate) base.start = startDate;
      if (endDate) base.end = endDate;
    }
    if (category) base.category = category;
    return base;
  },
  canEdit: true,
  title: '내가 푼 문제들',
  showAllOption: true,
  showReadOnlyIndicators: false,
});

export default function ErrorNoteInterface({
  config,
}: ErrorNoteInterfaceProps) {
  useKeyboardDetection();

  const isTablet = useIsTablet();
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();

  // Use provided config or create default
  const finalConfig = config || createDefaultConfig();

  // ✅ 쿼리
  const filterDate = searchParams.get('date'); // YYYY-MM-DD
  const startDate = searchParams.get('start'); // YYYY-MM-DD
  const endDate = searchParams.get('end'); // YYYY-MM-DD
  const category = searchParams.get('category');
  const show = searchParams.get('show'); // 'all' 이면 전부
  const unitIdStr = searchParams.get('unitId');
  const unitId = unitIdStr ? Number(unitIdStr) : undefined;

  const showAll = show === 'all' && finalConfig.showAllOption; // ✅

  // KST YYYY-MM-DD
  const toKstYmd = (dLike: string | number | Date) =>
    new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date(dLike));

  // 상태
  const [focusedProblemId, setFocusedProblemId] = useState<string | null>(null);
  const [userInputs, setUserInputs] = useState<Map<string, string>>(new Map());
  const [submissionStates, setSubmissionStates] = useState<
    Map<string, SubmissionState>
  >(new Map());
  const [isVirtualKeyboardVisible, setIsVirtualKeyboardVisible] =
    useState(false);
  const [helpSectionExpanded, setHelpSectionExpanded] = useState(false);
  const [desktopHelpExpanded, setDesktopHelpExpanded] = useState(false);

  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null); // ✅ 타입 안전
  const loaderRef = useRef<HTMLDivElement>(null);

  // ✅ API 파라미터 & 엔드포인트 선택 (using config)
  const filters = useMemo(
    () => ({
      filterDate,
      startDate,
      endDate,
      category,
      show,
      unitId,
      showAll,
    }),
    [filterDate, startDate, endDate, category, show, unitId, showAll]
  );

  const qs = useMemo(() => {
    return finalConfig.buildQueryParams({
      ...filters,
      effectiveUserId: finalConfig.targetUserId,
    });
  }, [finalConfig, filters]);

  const endpoint = finalConfig.getEndpoint({
    ...filters,
    effectiveUserId: finalConfig.targetUserId,
  }); // ✅

  // ✅ 데이터 요청 (무한스크롤)
  const {
    data: solves,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isError,
  } = useInfiniteGets<SolveItem>(
    [
      'error-note',
      showAll ? 'all' : 'wrong',
      filterDate,
      startDate,
      endDate,
      category,
    ],
    endpoint,
    !!session?.user?.id,
    qs
  );

  // ✅ 날짜+카테고리 클라이언트 보강 필터 (서버가 지원 못할 때 대비)
  const normalize = (s: string | null | undefined) =>
    (s ?? '').trim().toLowerCase();
  const categoryNorm = useMemo(() => normalize(category), [category]);

  const filteredSolves = useMemo(() => {
    if (!solves.length) return [];
    return solves.filter((s) => {
      const ymd = toKstYmd(s.createdAt);
      const okDate =
        (filterDate && ymd === filterDate) ||
        (!filterDate &&
          startDate &&
          endDate &&
          ymd >= startDate &&
          ymd <= endDate) ||
        (!filterDate && startDate && !endDate && ymd >= startDate) ||
        (!filterDate && !startDate && endDate && ymd <= endDate) ||
        (!filterDate && !startDate && !endDate); // 조건 없을 때는 통과

      const okCat = !categoryNorm || normalize(s.category) === categoryNorm;
      return okDate && okCat;
    });
  }, [solves, filterDate, startDate, endDate, categoryNorm]);

  // 포커스된 문제(동영상)
  const focusedProblem = focusedProblemId
    ? filteredSolves.find((s) => s.id.toString() === focusedProblemId)
    : null;

  const { data: videoData, isLoading: isVideoLoading } =
    useGets<UnitVideoResponse>(
      ['unitVideo', focusedProblem?.unitId],
      `/unitvidurl/${focusedProblem?.unitId}`,
      !!focusedProblem?.unitId
    );

  // Preserve focus when video data loads and causes re-render
  useEffect(() => {
    if (videoData && focusedProblemId) {
      // Clear any pending blur timeout since we're actively managing focus
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
        blurTimeoutRef.current = null;
      }

      // Use requestAnimationFrame for better synchronization with React render cycle
      requestAnimationFrame(() => {
        setTimeout(() => {
          const el = document.querySelector(
            `[data-problem-card="${focusedProblemId}"]`
          );
          const input = el?.querySelector(
            'input[type="text"]'
          ) as HTMLInputElement | null;
          if (input && document.activeElement !== input) {
            input.focus();
          }
        }, 100); // Reduced delay since requestAnimationFrame ensures DOM is ready
      });
    }
  }, [videoData, focusedProblemId]);

  // 렌더용 매핑 - 비디오 로딩 레이스 컨디션 방지를 위해 memoized
  const displayProblems: ErrorNoteProblem[] = useMemo(() => {
    return filteredSolves.map((solve) => ({
      id: solve.id.toString(),
      question: solve.question || 'No question available',
      userAnswer: solve.userInput || '',
      correctAnswer: solve.answer || '',
      helpText: solve.helpText || 'No help text available',
      instruction: undefined,
      unitName: solve.category,
      videoUrl:
        focusedProblemId === solve.id.toString() &&
        !isVideoLoading &&
        videoData?.data?.vidUrl
          ? videoData.data.vidUrl
          : undefined,
    }));
  }, [
    filteredSolves,
    focusedProblemId,
    videoData?.data?.vidUrl,
    isVideoLoading,
  ]);

  // Enhanced focus management for desktop help content synchronization
  useEffect(() => {
    if (focusedProblemId && !isVideoLoading && videoData?.data?.vidUrl) {
      // Ensure help components get updated displayProblems after video loads
      // Brief delay to ensure state propagation
    }
  }, [
    focusedProblemId,
    isVideoLoading,
    videoData?.data?.vidUrl,
    displayProblems.length,
  ]);

  // 무한 스크롤 옵저버
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
  handleIntersection.current = (entries, observer) => {
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
      { root: null, rootMargin: '20px', threshold: 0 }
    );
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [displayProblems.length]);

  useEffect(() => {
    if (!isFetchingNextPage && hasNextPage && loaderRef.current) {
      const observer = new IntersectionObserver(
        (entries) => handleIntersection.current(entries, observer),
        { root: null, rootMargin: '20px', threshold: 0 }
      );
      observer.observe(loaderRef.current);
      return () => observer.disconnect();
    }
  }, [isFetchingNextPage, hasNextPage]);

  // 카드 포커스/블러 - enhanced for desktop synchronization
  const handleCardFocus = (problemId: string) => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }

    const relevantHelpExpanded = isTablet
      ? desktopHelpExpanded
      : helpSectionExpanded;
    setFocusedProblemId(problemId);
    setIsVirtualKeyboardVisible(!relevantHelpExpanded);

    // Use requestAnimationFrame for more reliable timing
    requestAnimationFrame(() => {
      setTimeout(() => {
        const el = document.querySelector(`[data-problem-card="${problemId}"]`);
        const input = el?.querySelector(
          'input[type="text"]'
        ) as HTMLInputElement | null;
        if (input) {
          input.focus();
          // Auto-scroll focused card into view above keyboard area (mobile only)
          if (!isTablet) {
            el?.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
              inline: 'nearest',
            });
          }
        }
      }, 100); // Shorter delay since we're using requestAnimationFrame
    });
  };
  const handleCardBlur = () => {
    // Shorter timeout since we have global click handler as backup
    blurTimeoutRef.current = setTimeout(() => {
      const active = document.activeElement;

      // Only blur if focus moved completely away from any relevant elements
      if (
        !active ||
        (!active.closest('[data-virtual-keyboard]') &&
          !active.closest('[data-clickable-zone]'))
      ) {
        setFocusedProblemId(null);
        setIsVirtualKeyboardVisible(false);
        blurTimeoutRef.current = null;
      }
    }, 100); // Reduced timeout since global click handler handles most cases
  };

  // Mobile help section expansion handler
  const handleHelpExpansionChange = (isExpanded: boolean) => {
    setHelpSectionExpanded(isExpanded);
    if (focusedProblemId) {
      setIsVirtualKeyboardVisible(!isExpanded);
    }
  };

  // Desktop help section expansion handler
  const handleDesktopHelpExpansionChange = (isExpanded: boolean) => {
    setDesktopHelpExpanded(isExpanded);

    // Update keyboard visibility for desktop when there's a focused problem
    if (focusedProblemId) {
      setIsVirtualKeyboardVisible(!isExpanded);
    }
  };

  // 입력/제출 상태
  const handleInputChange = (problemId: string, value: string) => {
    setUserInputs((prev) => new Map(prev).set(problemId, value));

    // 사용자가 입력을 변경하면 submission state를 초기화하여 다시 시도할 수 있게 함
    const currentState = submissionStates.get(problemId);
    if (currentState === 'incorrect') {
      setSubmissionStates((prev) => new Map(prev).set(problemId, 'initial'));
    }
  };
  const handleNumberClick = (n: string) => {
    if (!focusedProblemId) return;
    const cur = userInputs.get(focusedProblemId) || '';
    setUserInputs((p) => new Map(p).set(focusedProblemId, cur + n));

    // 가상 키보드로 입력할 때도 submission state를 리셋
    const currentState = submissionStates.get(focusedProblemId);
    if (currentState === 'incorrect') {
      setSubmissionStates((prev) =>
        new Map(prev).set(focusedProblemId, 'initial')
      );
    }
  };
  const handleOperatorClick = (op: string) => {
    if (!focusedProblemId) return;
    const cur = userInputs.get(focusedProblemId) || '';
    setUserInputs((p) => new Map(p).set(focusedProblemId, cur + op));

    // 가상 키보드로 입력할 때도 submission state를 리셋
    const currentState = submissionStates.get(focusedProblemId);
    if (currentState === 'incorrect') {
      setSubmissionStates((prev) =>
        new Map(prev).set(focusedProblemId, 'initial')
      );
    }
  };
  const handleClear = () => {
    if (!focusedProblemId) return;
    setUserInputs((p) => new Map(p).set(focusedProblemId, ''));

    // 입력 필드를 클리어할 때도 submission state를 리셋
    const currentState = submissionStates.get(focusedProblemId);
    if (currentState === 'incorrect') {
      setSubmissionStates((prev) =>
        new Map(prev).set(focusedProblemId, 'initial')
      );
    }
  };
  const handleSubmissionResult = (problemId: string, isCorrect: boolean) => {
    setSubmissionStates((prev) =>
      new Map(prev).set(problemId, isCorrect ? 'correct' : 'incorrect')
    );

    // 틀린 답안인 경우 입력 필드를 클리어하여 새로운 시도를 유도
    if (!isCorrect) {
      setUserInputs((prev) => new Map(prev).set(problemId, ''));
    }
  };

  // Global click handler to detect clicks outside keyboard/input areas
  useEffect(() => {
    const handleGlobalClick = (event: MouseEvent) => {
      if (!isVirtualKeyboardVisible) return;

      const target = event.target as Element;
      const isOnKeyboard = target.closest('[data-virtual-keyboard]');
      const isOnClickableZone = target.closest('[data-clickable-zone]');
      const isOnModal = target.closest('[data-modal]');

      if (!isOnKeyboard && !isOnClickableZone && !isOnModal) {
        setFocusedProblemId(null);
        setIsVirtualKeyboardVisible(false);
        if (blurTimeoutRef.current) {
          clearTimeout(blurTimeoutRef.current);
          blurTimeoutRef.current = null;
        }
      }
    };

    document.addEventListener('click', handleGlobalClick, true);
    return () => {
      document.removeEventListener('click', handleGlobalClick, true);
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    };
  }, [isVirtualKeyboardVisible]);

  // 상태 렌더
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
  if (!isLoading && displayProblems.length === 0) {
    return (
      <div className="mx-auto flex items-center justify-center bg-[var(--color-background)]">
        <div className="text-center">
          <p className="mb-2 text-gray-600">표시할 문제가 없습니다.</p>
        </div>
      </div>
    );
  }

  // 렌더
  return (
    <div className="mx-auto w-full">
      <div className="mx-auto pt-6 tablet:px-16 desktop:px-24">
        {/* Read-only message for MyPage */}
        {finalConfig.showReadOnlyIndicators && finalConfig.readOnlyMessage && (
          <div className="mx-4 mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 tablet:mx-0">
            {finalConfig.readOnlyMessage}
          </div>
        )}

        {/* Mobile - Only render on mobile screens */}
        {!isTablet && (
          <div>
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold text-gray-800">
                {finalConfig.title}
              </h1>
              {showAll && finalConfig.showAllOption && (
                <p className="mt-2 text-sm text-gray-500">
                  맞은 문제는 흐리게 표시됩니다
                </p>
              )}
            </div>

            <div className="mb-6 px-4">
              <ContextualHelpSection
                focusZone={focusedProblemId ? 'answer' : 'none'}
                currentProblem={(() => {
                  const problem = focusedProblemId
                    ? displayProblems.find((p) => p.id === focusedProblemId)
                    : undefined;
                  // Mobile component rendering
                  return problem;
                })()}
                isDraggable
                onExpansionChange={handleHelpExpansionChange}
                componentId="mobile"
              />
            </div>

            <div
              className="space-y-6 px-4 transition-all duration-100"
              style={{
                paddingBottom: isVirtualKeyboardVisible ? '250px' : '0px',
              }}
            >
              {filteredSolves.map((solve) => {
                const problem = displayProblems.find(
                  (p) => p.id === solve.id.toString()
                )!;
                return (
                  <div key={problem.id} className="relative">
                    {finalConfig.showReadOnlyIndicators &&
                      !finalConfig.canEdit && (
                        <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-amber-300/60" />
                      )}
                    <div
                      className={
                        finalConfig.canEdit ? '' : 'pointer-events-none'
                      }
                    >
                      <ErrorNoteCard
                        problem={problem}
                        onFocus={handleCardFocus}
                        onBlur={handleCardBlur}
                        onInputChange={handleInputChange}
                        userInput={userInputs.get(problem.id) || ''}
                        submissionState={
                          submissionStates.get(problem.id) || 'initial'
                        }
                        onSubmissionResult={handleSubmissionResult}
                        isCorrect={solve.isCorrect}
                        isFocused={focusedProblemId === problem.id}
                        readOnly={!finalConfig.canEdit}
                      />
                    </div>
                  </div>
                );
              })}

              {isFetchingNextPage && (
                <div className="flex justify-center py-4">
                  <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-violet-500"></div>
                </div>
              )}
              {hasNextPage && <div ref={loaderRef} className="h-4 w-full" />}
              {isError && (
                <div className="flex justify-center py-12">
                  <div className="text-sm text-red-600">
                    데이터를 불러오는데 실패했습니다
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tablet+ - Only render on tablet+ screens */}
        {isTablet && (
          <div className="mx-auto flex w-full gap-12">
            <div className="max-h-full flex-1 overflow-y-auto pr-4">
              <div
                className="space-y-6 transition-all duration-100"
                style={{
                  paddingBottom: isVirtualKeyboardVisible ? '250px' : '0px',
                }}
              >
                <div className="mb-6 text-center">
                  <h1 className="text-2xl font-bold text-gray-800">
                    {finalConfig.title}
                  </h1>
                  {showAll && finalConfig.showAllOption && (
                    <p className="mt-2 text-sm text-gray-500">
                      맞은 문제는 흐리게 표시됩니다
                    </p>
                  )}
                </div>

                {filteredSolves.map((solve) => {
                  const problem = displayProblems.find(
                    (p) => p.id === solve.id.toString()
                  )!;
                  return (
                    <div key={problem.id} className="relative">
                      {finalConfig.showReadOnlyIndicators &&
                        !finalConfig.canEdit && (
                          <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-amber-300/60" />
                        )}
                      <div
                        className={
                          finalConfig.canEdit ? '' : 'pointer-events-none'
                        }
                      >
                        <ErrorNoteCard
                          problem={problem}
                          onFocus={handleCardFocus}
                          onBlur={handleCardBlur}
                          onInputChange={handleInputChange}
                          userInput={userInputs.get(problem.id) || ''}
                          submissionState={
                            submissionStates.get(problem.id) || 'initial'
                          }
                          onSubmissionResult={handleSubmissionResult}
                          isCorrect={solve.isCorrect}
                          isFocused={focusedProblemId === problem.id}
                          readOnly={!finalConfig.canEdit}
                        />
                      </div>
                    </div>
                  );
                })}

                {isFetchingNextPage && (
                  <div className="flex justify-center py-4">
                    <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-violet-500"></div>
                  </div>
                )}
                {hasNextPage && <div ref={loaderRef} className="h-4 w-full" />}
                {isError && (
                  <div className="flex justify-center py-12">
                    <div className="text-sm text-red-600">
                      데이터를 불러오는데 실패했습니다
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="w-80 flex-shrink-0">
              <div className="sticky top-6">
                <ContextualHelpSection
                  focusZone={focusedProblemId ? 'answer' : 'none'}
                  currentProblem={(() => {
                    const problem = focusedProblemId
                      ? displayProblems.find((p) => p.id === focusedProblemId)
                      : undefined;
                    // Desktop component rendering
                    return problem;
                  })()}
                  isDraggable={false}
                  onExpansionChange={handleDesktopHelpExpansionChange}
                  componentId="desktop"
                />
              </div>
            </div>
          </div>
        )}

        <VirtualKeyboard
          isVisible={isVirtualKeyboardVisible && finalConfig.canEdit}
          onNumberClick={handleNumberClick}
          onOperatorClick={handleOperatorClick}
          onClear={handleClear}
          disabled={!finalConfig.canEdit}
        />
      </div>
    </div>
  );
}
