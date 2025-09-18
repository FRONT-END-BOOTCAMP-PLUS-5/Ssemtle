'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useInfiniteGets } from '@/hooks/useInfiniteGets';
import { useGets } from '@/hooks/useGets';

import ErrorNoteCard from '@/app/error-note/_components/ErrorNoteCard';
import VirtualKeyboard from '@/app/error-note/_components/VirtualKeyboard';
import ContextualHelpSection from '@/app/error-note/_components/ContextualHelpSection';

type SubmissionState = 'initial' | 'correct' | 'incorrect';

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

export default function ErrorNoteInterface() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();

  // ✅ 쿼리
  const filterDate = searchParams.get('date'); // YYYY-MM-DD
  const startDate = searchParams.get('start'); // YYYY-MM-DD
  const endDate = searchParams.get('end'); // YYYY-MM-DD
  const category = searchParams.get('category');
  const show = searchParams.get('show'); // 'all' 이면 전부

  const showAll = show === 'all'; // ✅

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

  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null); // ✅ 타입 안전
  const loaderRef = useRef<HTMLDivElement>(null);

  // ✅ API 파라미터 & 엔드포인트 선택
  const qs = useMemo(() => {
    const base: Record<string, string> = { limit: '20' };
    if (!showAll) base.only = 'wrong'; // 기존 동작
    if (filterDate) {
      base.start = filterDate;
      base.end = filterDate;
    } else {
      if (startDate) base.start = startDate;
      if (endDate) base.end = endDate;
    }
    if (category) base.category = category;
    return base;
  }, [showAll, filterDate, startDate, endDate, category]);

  const endpoint = showAll ? '/solves/list' : '/solves/mode/wrong'; // ✅

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

  const { data: videoData } = useGets<UnitVideoResponse>(
    ['unitVideo', focusedProblem?.unitId],
    `/unitvidurl/${focusedProblem?.unitId}`,
    !!focusedProblem?.unitId
  );

  // Preserve focus when video data loads and causes re-render
  useEffect(() => {
    if (videoData && focusedProblemId) {
      // Small delay to ensure DOM is updated after re-render
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
      }, 10);
    }
  }, [videoData, focusedProblemId]);

  // 렌더용 매핑
  const displayProblems: ErrorNoteProblem[] = filteredSolves.map((solve) => ({
    id: solve.id.toString(),
    question: solve.question || 'No question available',
    userAnswer: solve.userInput || '',
    correctAnswer: solve.answer || '',
    helpText: solve.helpText || 'No help text available',
    instruction: undefined,
    unitName: solve.category,
    videoUrl:
      focusedProblemId === solve.id.toString() && videoData?.data?.vidUrl
        ? videoData.data.vidUrl
        : undefined,
  }));

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

  // 카드 포커스/블러
  const handleCardFocus = (problemId: string) => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    setFocusedProblemId(problemId);
    setIsVirtualKeyboardVisible(true);
    setTimeout(() => {
      const el = document.querySelector(`[data-problem-card="${problemId}"]`);
      const input = el?.querySelector(
        'input[type="text"]'
      ) as HTMLInputElement | null;
      input?.focus();
    }, 100);
  };
  const handleCardBlur = () => {
    blurTimeoutRef.current = setTimeout(() => {
      const active = document.activeElement;
      if (
        active &&
        (active.closest('[data-virtual-keyboard]') ||
          active.closest('[data-clickable-zone]'))
      ) {
        return;
      }
      setFocusedProblemId(null);
      setIsVirtualKeyboardVisible(false);
      blurTimeoutRef.current = null;
    }, 200);
  };

  // 입력/제출 상태
  const handleInputChange = (problemId: string, value: string) => {
    setUserInputs((prev) => new Map(prev).set(problemId, value));
  };
  const handleNumberClick = (n: string) => {
    if (!focusedProblemId) return;
    const cur = userInputs.get(focusedProblemId) || '';
    setUserInputs((p) => new Map(p).set(focusedProblemId, cur + n));
  };
  const handleOperatorClick = (op: string) => {
    if (!focusedProblemId) return;
    const cur = userInputs.get(focusedProblemId) || '';
    setUserInputs((p) => new Map(p).set(focusedProblemId, cur + op));
  };
  const handleClear = () => {
    if (!focusedProblemId) return;
    setUserInputs((p) => new Map(p).set(focusedProblemId, ''));
  };
  const handleSubmissionResult = (problemId: string, isCorrect: boolean) => {
    setSubmissionStates((prev) =>
      new Map(prev).set(problemId, isCorrect ? 'correct' : 'incorrect')
    );
  };

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    };
  }, []);

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
        {/* Mobile */}
        <div className="tablet:hidden">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-gray-800">내가 푼 문제들</h1>
            {showAll && (
              <p className="mt-2 text-sm text-gray-500">
                맞은 문제는 흐리게 표시됩니다
              </p>
            )}
          </div>

          <div className="mb-6 px-4">
            <ContextualHelpSection
              focusZone={focusedProblemId ? 'answer' : 'none'}
              currentProblem={
                focusedProblemId
                  ? displayProblems.find((p) => p.id === focusedProblemId)
                  : undefined
              }
              isDraggable
            />
          </div>

          <div className="space-y-6 px-4">
            {filteredSolves.map((solve) => {
              const problem = displayProblems.find(
                (p) => p.id === solve.id.toString()
              )!;
              return (
                <div key={problem.id}>
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
                  />
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

        {/* Tablet+ */}
        <div className="mx-auto hidden w-full gap-12 tablet:flex">
          <div className="max-h-full flex-1 overflow-y-auto pr-4">
            <div className="space-y-6">
              <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-gray-800">
                  내가 푼 문제들
                </h1>
                {showAll && (
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
                  <div key={problem.id}>
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
                    />
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
                currentProblem={
                  focusedProblemId
                    ? displayProblems.find((p) => p.id === focusedProblemId)
                    : undefined
                }
                isDraggable={false}
              />
            </div>
          </div>
        </div>

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
