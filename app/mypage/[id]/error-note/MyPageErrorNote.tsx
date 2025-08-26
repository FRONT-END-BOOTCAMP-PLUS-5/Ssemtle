'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useInfiniteGets } from '@/hooks/useInfiniteGets';
import { useGets } from '@/hooks/useGets';

import ErrorNoteCard from '@/app/error-note/_components/ErrorNoteCard';
import VirtualKeyboard from '@/app/error-note/_components/VirtualKeyboard';
import ContextualHelpSection from '@/app/error-note/_components/ContextualHelpSection';

interface SolveListItemDto {
  id: number;
  question: string;
  answer: string;
  helpText: string;
  userInput: string;
  isCorrect: boolean;
  createdAt: string | Date;
  unitId: number;
  userId: string;
  category: string;
}

interface UnitVideoResponse {
  data: { id: number; vidUrl: string };
}

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

function toKstYmd(dLike: string | number | Date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(dLike));
}

// YYYY-MM-DD → KST 하루 → UTC Z
function ymdToUtcZ(ymd: string, asEnd: boolean) {
  const [y, m, d] = ymd.split('-').map(Number);
  const h = asEnd ? 23 : 0,
    min = asEnd ? 59 : 0,
    s = asEnd ? 59 : 0,
    ms = asEnd ? 999 : 0;
  const utcMs =
    Date.UTC(y, (m ?? 1) - 1, d ?? 1, h, min, s, ms) - 9 * 60 * 60 * 1000;
  return new Date(utcMs).toISOString();
}

export default function MyPageErrorNote() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const params = useParams();

  // ✅ 우선순위: 쿼리 userId > 경로 [id] (세션으로 덮지 않음)
  const queryUserId = searchParams.get('userId') || undefined;
  const pathUserId = (params?.id as string | undefined) || undefined;

  const effectiveUserId = useMemo(() => {
    const raw = queryUserId ?? pathUserId ?? '';
    return raw ? decodeURIComponent(raw).trim() : '';
  }, [queryUserId, pathUserId]);

  // 편집 가능(내 페이지면 true). 데이터 조회는 위 effectiveUserId 기준.
  const sessionUserId = session?.user?.userId;
  const canEdit =
    !!sessionUserId &&
    (!!effectiveUserId ? effectiveUserId === sessionUserId : true);

  // 필터
  const filterDate = searchParams.get('date'); // YYYY-MM-DD
  const startDate = searchParams.get('start'); // YYYY-MM-DD or ISO
  const endDate = searchParams.get('end'); // YYYY-MM-DD or ISO
  const category = searchParams.get('category') || undefined;
  const unitIdStr = searchParams.get('unitId');
  const unitId = unitIdStr ? Number(unitIdStr) : null;

  // 상태
  const [focusedProblemId, setFocusedProblemId] = useState<string | null>(null);
  const [userInputs, setUserInputs] = useState<Map<string, string>>(new Map());
  const [submissionStates, setSubmissionStates] = useState<
    Map<string, SubmissionState>
  >(new Map());
  const [isVirtualKeyboardVisible, setIsVirtualKeyboardVisible] =
    useState(false);

  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loaderRef = useRef<HTMLDivElement>(null);

  // 서버 요청 쿼리 (DTO: userId, from, to, only, limit)
  const qs = useMemo(() => {
    const base: Record<string, string> = {
      userId: effectiveUserId, // ← 반드시 포함
      only: 'wrong',
      limit: '20',
      sortDirection: 'newest',
    };
    if (filterDate) {
      base.from = ymdToUtcZ(filterDate, false);
      base.to = ymdToUtcZ(filterDate, true);
    } else {
      if (startDate)
        base.from = /^\d{4}-\d{2}-\d{2}$/.test(startDate)
          ? ymdToUtcZ(startDate, false)
          : startDate;
      if (endDate)
        base.to = /^\d{4}-\d{2}-\d{2}$/.test(endDate)
          ? ymdToUtcZ(endDate, true)
          : endDate;
    }
    if (category) base.category = category;
    if (unitId != null && !Number.isNaN(unitId)) base.unitId = String(unitId);
    return base;
  }, [effectiveUserId, filterDate, startDate, endDate, category, unitId]);

  // 엔드포인트는 '/solves/list' (훅이 /api를 붙임)
  const endpoint = useMemo(
    () => (effectiveUserId ? '/solves/list' : ''),
    [effectiveUserId]
  );

  // 무한 로드
  const {
    data: wrongSolves,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isError,
  } = useInfiniteGets<SolveListItemDto>(
    [
      'mypage-wrong-solves',
      effectiveUserId,
      filterDate,
      startDate,
      endDate,
      category,
      unitId,
    ],
    endpoint,
    !!effectiveUserId,
    qs
  );

  // 클라 보정 필터
  const filteredSolves = useMemo(() => {
    let list = wrongSolves;
    if (filterDate || startDate || endDate) {
      list = list.filter((s) => {
        const ymd = toKstYmd(s.createdAt);
        if (filterDate) return ymd === filterDate;
        if (startDate && endDate) return ymd >= startDate && ymd <= endDate;
        if (startDate) return ymd >= startDate;
        if (endDate) return ymd <= endDate;
        return true;
      });
    }
    if (unitId != null && !Number.isNaN(unitId)) {
      list = list.filter((s) => s.unitId === unitId);
    } else if (category) {
      list = list.filter((s) => s.category === category);
    }
    return list;
  }, [wrongSolves, filterDate, startDate, endDate, unitId, category]);

  const focusedProblem = focusedProblemId
    ? filteredSolves.find((s) => s.id.toString() === focusedProblemId)
    : null;

  const { data: videoData } = useGets<UnitVideoResponse>(
    ['unitVideo', focusedProblem?.unitId],
    `/unitvidurl/${focusedProblem?.unitId}`,
    !!focusedProblem?.unitId
  );

  const displayProblems: ErrorNoteProblem[] = filteredSolves.map((s) => ({
    id: s.id.toString(),
    question: s.question || 'No question available',
    userAnswer: s.userInput || '',
    correctAnswer: s.answer || '',
    helpText: s.helpText || 'No help text available',
    unitName: s.category,
    instruction: undefined,
    videoUrl:
      focusedProblemId === s.id.toString() && videoData?.data?.vidUrl
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

  // 입력(읽기전용 가드)
  const handleCardFocus = (problemId: string) => {
    if (!canEdit) return;
    if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    setFocusedProblemId(problemId);
    setIsVirtualKeyboardVisible(true);
    setTimeout(() => {
      const el = document.querySelector(
        `[data-problem-card="${problemId}"] input[type="text"]`
      ) as HTMLInputElement | null;
      el?.focus();
    }, 100);
  };
  const handleCardBlur = () => {
    if (!canEdit) return;
    blurTimeoutRef.current = setTimeout(() => {
      const active = document.activeElement;
      if (
        active &&
        (active.closest('[data-virtual-keyboard]') ||
          active.closest('[data-clickable-zone]'))
      )
        return;
      setFocusedProblemId(null);
      setIsVirtualKeyboardVisible(false);
      blurTimeoutRef.current = null;
    }, 200);
  };
  const handleInputChange = (id: string, v: string) => {
    if (!canEdit) return;
    setUserInputs((prev) => new Map(prev).set(id, v));
  };
  const handleNumberClick = (n: string) => {
    if (!canEdit || !focusedProblemId) return;
    const cur = userInputs.get(focusedProblemId) || '';
    setUserInputs((p) => new Map(p).set(focusedProblemId, cur + n));
  };
  const handleOperatorClick = (op: string) => {
    if (!canEdit || !focusedProblemId) return;
    const cur = userInputs.get(focusedProblemId) || '';
    setUserInputs((p) => new Map(p).set(focusedProblemId, cur + op));
  };
  const handleClear = () => {
    if (!canEdit || !focusedProblemId) return;
    setUserInputs((p) => new Map(p).set(focusedProblemId, ''));
  };
  const handleSubmissionResult = (id: string, ok: boolean) =>
    setSubmissionStates((prev) =>
      new Map(prev).set(id, ok ? 'correct' : 'incorrect')
    );

  useEffect(
    () => () => {
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    },
    []
  );

  // 상태 분기
  if (status === 'loading' || isLoading) {
    return (
      <div className="mx-auto flex items-center justify-center bg-[var(--color-background)]">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-violet-500" />
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
  if (!isLoading && filteredSolves.length === 0) {
    return (
      <div className="mx-auto flex items-center justify-center bg-[var(--color-background)]">
        <div className="text-center">
          <p className="mb-2 text-gray-600">오답 문제가 없습니다!</p>
          {(filterDate || startDate || endDate || category || unitIdStr) && (
            <p className="text-sm text-gray-500">
              선택한 조건(날짜/카테고리)에 해당하는 오답이 없습니다.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full">
      <div className="mx-auto pt-6 tablet:px-32">
        {!canEdit && (
          <div className="mx-4 mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 tablet:mx-0">
            이 페이지는 <b>읽기 전용</b>입니다. 내 문제가 아니므로 정답 수정이
            비활성화됩니다.
          </div>
        )}

        {/* Mobile */}
        <div className="tablet:hidden">
          <div className="mb-6 px-4 text-center">
            <h1 className="text-2xl font-bold text-gray-800">오답노트</h1>
            <p className="mt-2 text-gray-600">
              선택한 조건의 오답만 표시됩니다
            </p>
          </div>

          <div className="mb-6 px-4">
            <ContextualHelpSection
              focusZone={focusedProblemId && canEdit ? 'answer' : 'none'}
              currentProblem={
                focusedProblemId
                  ? displayProblems.find((p) => p.id === focusedProblemId)
                  : undefined
              }
              isDraggable={true}
            />
          </div>

          <div className="space-y-6 px-4">
            {displayProblems.map((p) => (
              <div key={p.id} className="relative">
                {!canEdit && (
                  <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-amber-300/60" />
                )}
                <div className={canEdit ? '' : 'pointer-events-none'}>
                  <ErrorNoteCard
                    problem={p}
                    onFocus={handleCardFocus}
                    onBlur={handleCardBlur}
                    onInputChange={handleInputChange}
                    userInput={userInputs.get(p.id) || ''}
                    submissionState={submissionStates.get(p.id) || 'initial'}
                    onSubmissionResult={handleSubmissionResult}
                    readOnly={!canEdit}
                  />
                </div>
              </div>
            ))}

            {isFetchingNextPage && (
              <div className="flex justify-center py-4">
                <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-violet-500" />
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
                <p className="mt-2 text-gray-600">
                  선택한 조건의 오답만 표시됩니다
                </p>
              </div>

              {displayProblems.map((p) => (
                <div key={p.id} className="relative">
                  {!canEdit && (
                    <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-amber-300/60" />
                  )}
                  <div className={canEdit ? '' : 'pointer-events-none'}>
                    <ErrorNoteCard
                      problem={p}
                      onFocus={handleCardFocus}
                      onBlur={handleCardBlur}
                      onInputChange={handleInputChange}
                      userInput={userInputs.get(p.id) || ''}
                      submissionState={submissionStates.get(p.id) || 'initial'}
                      onSubmissionResult={handleSubmissionResult}
                      readOnly={!canEdit}
                    />
                  </div>
                </div>
              ))}

              {isFetchingNextPage && (
                <div className="flex justify-center py-4">
                  <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-violet-500" />
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
                focusZone={focusedProblemId && canEdit ? 'answer' : 'none'}
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
          isVisible={isVirtualKeyboardVisible && canEdit}
          onNumberClick={handleNumberClick}
          onOperatorClick={handleOperatorClick}
          onClear={handleClear}
          disabled={!canEdit}
        />
      </div>
    </div>
  );
}
