'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useInfiniteGets } from '@/hooks/useInfiniteGets';
import { useGets } from '@/hooks/useGets';

// 기존 컴포넌트 재사용
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
  isCorrect: boolean;
  createdAt: string | Date; // ← API가 string일 수도 있으니 유연하게
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

export default function MyPageErrorNote() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();

  // 쿼리 파라미터 (단일 날짜 or 범위)
  const filterDate = searchParams.get('date'); // YYYY-MM-DD
  const startDate = searchParams.get('start'); // YYYY-MM-DD
  const endDate = searchParams.get('end'); // YYYY-MM-DD

  // 한국시간 기준 YYYY-MM-DD
  const toKstYmd = (dLike: string | number | Date) =>
    new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date(dLike));

  // 상태들
  const [focusedProblemId, setFocusedProblemId] = useState<string | null>(null);
  const [userInputs, setUserInputs] = useState<Map<string, string>>(new Map());
  const [submissionStates, setSubmissionStates] = useState<
    Map<string, SubmissionState>
  >(new Map());
  const [isVirtualKeyboardVisible, setIsVirtualKeyboardVisible] =
    useState(false);

  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loaderRef = useRef<HTMLDivElement>(null);

  const qs = useMemo(() => {
    // 기본 쿼리
    const base = { only: 'wrong', limit: '20' } as Record<string, string>;

    if (filterDate) {
      // 1일 필터: 서버가 단일 date를 받으면 base.date = filterDate
      // 범위만 받는다면:
      base.start = filterDate;
      base.end = filterDate;
    } else {
      if (startDate) base.start = startDate;
      if (endDate) base.end = endDate;
    }
    return base;
  }, [filterDate, startDate, endDate]);

  // 무한스크롤로 오답 목록 로드 (기존 훅 그대로)
  const {
    data: wrongSolves,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isError,
  } = useInfiniteGets<SolveItem>(
    ['wrong-solves', filterDate, startDate, endDate], // 키에 날짜 조건 포함
    '/solves/mode/wrong',
    !!session?.user?.id,
    qs
  );

  // 날짜 필터
  const filteredSolves = useMemo(() => {
    if (!filterDate && !startDate && !endDate) return wrongSolves;
    return wrongSolves.filter((s) => {
      const ymd = toKstYmd(s.createdAt);
      if (filterDate) return ymd === filterDate;
      if (startDate && endDate) return ymd >= startDate && ymd <= endDate;
      if (startDate) return ymd >= startDate;
      if (endDate) return ymd <= endDate;
      return true;
    });
  }, [wrongSolves, filterDate, startDate, endDate]);

  // 포커스된 문제 (동영상 로딩용)
  const focusedProblem = focusedProblemId
    ? filteredSolves.find((s) => s.id.toString() === focusedProblemId)
    : null;

  // 유닛 동영상 URL 가져오기
  const { data: videoData } = useGets<UnitVideoResponse>(
    ['unitVideo', focusedProblem?.unitId],
    `/unitvidurl/${focusedProblem?.unitId}`,
    !!focusedProblem?.unitId
  );

  // 렌더용 데이터로 매핑
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
      const cardElement = document.querySelector(
        `[data-problem-card="${problemId}"]`
      );
      const inputElement = cardElement?.querySelector(
        'input[type="text"]'
      ) as HTMLInputElement | null;
      inputElement?.focus();
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
  const handleNumberClick = (num: string) => {
    if (!focusedProblemId) return;
    const cur = userInputs.get(focusedProblemId) || '';
    setUserInputs((p) => new Map(p).set(focusedProblemId, cur + num));
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

  // 언마운트 클린업
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    };
  }, []);

  // 로딩/인증/빈 상태
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
          <p className="mb-2 text-gray-600">오답 문제가 없습니다!</p>
          {(filterDate || startDate || endDate) && (
            <p className="text-sm text-gray-500">
              선택한 날짜 조건에 해당하는 오답이 없습니다.
            </p>
          )}
        </div>
      </div>
    );
  }

  // 렌더
  return (
    <div className="mx-auto w-full">
      <div className="mx-auto pt-6 tablet:px-32">
        {/* Mobile: 헬프 먼저 */}
        <div className="tablet:hidden">
          <div className="mb-6 px-4 text-center">
            <h1 className="text-2xl font-bold text-gray-800">오답노트</h1>
          </div>

          <div className="mb-6 px-4">
            <ContextualHelpSection
              focusZone={focusedProblemId ? 'answer' : 'none'}
              currentProblem={
                focusedProblemId
                  ? displayProblems.find((p) => p.id === focusedProblemId)
                  : undefined
              }
              isDraggable={true}
            />
          </div>

          <div className="space-y-6 px-4">
            {displayProblems.map((problem) => (
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
                <h1 className="text-2xl font-bold text-gray-800">오답노트</h1>
              </div>

              {displayProblems.map((problem) => (
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
