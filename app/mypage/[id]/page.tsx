'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGets } from '@/hooks/useGets';
import { GetStudentUnitPerformanceResponseDTO } from '@/backend/analysis/dtos/GetStudentUnitPerformanceDTO';
import { GetUserInfoResponseDTO } from '@/backend/auth/dtos/UserDto';
import CalendarComponent from '../components/CalenderComponent';
import TestCard from '../../_components/cards/TestCard';
import PerformanceChartBase from '../components/PerformanceChart';
import { SolveListItemDto } from '@/backend/solves/dtos/SolveDto';
import AccountSettingsCard from '../components/AccountSettingsCard';
import { useSession } from 'next-auth/react';

// ---------- 유틸 ----------
type CalendarDay = {
  date: string; // 'YYYY-MM-DD'
  total: number;
  correct: number;
  accuracy: number; // 0~1
  solves: SolveListItemDto[];
};
type CalendarResponse = { days: CalendarDay[] };

function ym(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}
function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// ---------- 커스텀 훅 (컴포넌트 바깥에 선언) ----------
function useHoverCapable() {
  const [ok, setOk] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia?.('(hover: hover) and (pointer: fine)');
    const apply = () => setOk(!!mq?.matches);
    apply();
    mq?.addEventListener?.('change', apply);
    return () => mq?.removeEventListener?.('change', apply);
  }, []);
  return ok;
}
function useDebounced<T>(value: T, delay = 60) {
  const [v, setV] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

// ---------- 페이지 ----------
export default function MyPage() {
  const router = useRouter();
  const { id: userId } = useParams(); // /mypage/[id]
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  // 데스크톱 여부 (md: 768px)
  const [isDesktop, setIsDesktop] = useState<boolean>(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const apply = () => setIsDesktop(mq.matches);
    apply();
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // 유저 정보
  const { data: userData } = useGets<GetUserInfoResponseDTO>(
    ['user-info', userId],
    `/users/${userId}`,
    !!userId
  );
  const username = userData?.userId;
  const displayName = userData?.name ?? '사용자';

  // 현재 달
  const [month, setMonth] = useState<string>(() => ym(new Date()));

  // 성과(레이더/막대) 데이터
  const {
    data: analysisData,
    isLoading,
    isError,
    error,
  } = useGets<GetStudentUnitPerformanceResponseDTO>(
    ['mypage', username],
    username ? `/students/${username}/unit` : '',
    !!username
  );
  const radarData = useMemo(() => {
    const units = analysisData?.units ?? [];
    return units.map((u) => ({
      subject: u.unitName || `Unit ${u.unitId}`,
      value: u.total > 0 ? Math.round((u.correct / u.total) * 100) : 0,
      correct: u.correct,
      total: u.total,
    }));
  }, [analysisData]);

  // 달력 데이터
  const { data: calendarResp } = useGets<CalendarResponse>(
    ['solvesCalendar', username, month],
    username ? `/solves/calendar/user/${username}?month=${month}` : '',
    !!username
  );

  // 캘린더 표시 맵
  const { resultsMap, attendanceMap } = useMemo(() => {
    const map: Record<string, { correct: number; total: number }> = {};
    const days = calendarResp?.days ?? [];
    for (const d of days) map[d.date] = { correct: d.correct, total: d.total };

    const activeDays = days
      .filter((d) => d.total > 0)
      .map((d) => d.date)
      .sort();
    const att: Record<string, number> = {};
    let streak = 0;
    let prev: string | null = null;
    const isNextDay = (a: string, b: string) => {
      const da = new Date(a + 'T00:00:00Z').getTime();
      const db = new Date(b + 'T00:00:00Z').getTime();
      return db - da === 86400000;
    };
    for (const day of activeDays) {
      streak = prev && isNextDay(prev, day) ? streak + 1 : 1;
      att[day] = streak;
      prev = day;
    }
    return { resultsMap: map, attendanceMap: att };
  }, [calendarResp]);

  // 선택/호버 상태
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSolves, setSelectedSolves] = useState<SolveListItemDto[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const hoverCapable = useHoverCapable();
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const debouncedHoverDate = useDebounced(hoverDate, 50);

  const handleDayClick = (d: Date) => {
    const key = ymd(d);
    const day = calendarResp?.days.find((x) => x.date === key);
    setSelectedDate(key);
    setSelectedSolves(day?.solves ?? []);
    if (!isDesktop) setIsModalOpen(true);
  };
  function handleDayHover(d: Date | null) {
    if (!hoverCapable) return;
    setHoverDate(d ? ymd(d) : null);
  }

  const handleMonthChange = (newMonth: string) => setMonth(newMonth);

  // 모달 열릴 때 body 스크롤 잠금
  useEffect(() => {
    if (!isModalOpen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  const closeModal = () => setIsModalOpen(false);

  const goSolvePage = (category: string) => {
    const q = new URLSearchParams();
    if (selectedDate) q.set('date', selectedDate);
    if (category) q.set('category', category);
    router.push(`/solve?${q.toString()}`);
  };

  // 패널 표시용 기준 날짜: 호버 우선, 없으면 선택
  const effectiveDate = debouncedHoverDate ?? selectedDate;

  // 패널 리스트 데이터 (카테고리 그룹핑)
  const solvesByCategory = useMemo<Record<string, SolveListItemDto[]>>(() => {
    const map: Record<string, SolveListItemDto[]> = {};
    const day = calendarResp?.days.find((x) => x.date === effectiveDate);
    const list =
      day?.solves ?? (effectiveDate === selectedDate ? selectedSolves : []);
    for (const s of list) {
      const cat = s.category ?? '전체';
      (map[cat] ??= []).push(s);
    }
    Object.values(map).forEach((arr) =>
      arr.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    );
    return map;
  }, [calendarResp, effectiveDate, selectedSolves, selectedDate]);

  const PerformanceChart = React.memo(PerformanceChartBase);
  const { data: session } = useSession();

  return (
    <main className="min-h-[calc(100vh-64px)] w-full bg-[#f6f7fb]">
      <div className="mx-auto w-full max-w-6xl px-4 py-6">
        {/* 타이틀 */}
        <div className="w-full text-center">
          <h1 className="text-2xl font-semibold sm:text-3xl">
            {displayName}의 마이페이지
          </h1>
        </div>

        {/* 로딩/에러 */}
        {(!username || isLoading) && (
          <div className="mt-4 text-center">불러오는 중…</div>
        )}
        {isError && (
          <div className="mt-4 text-center text-red-600">
            에러: {error?.message}
          </div>
        )}

        {/* 성과 그래프 */}
        <div
          className="mx-auto mt-4 flex w-full max-w-6xl justify-center rounded-2xl bg-white p-4 outline-none focus:outline-none"
          onMouseDown={(e) => e.preventDefault()}
        >
          <PerformanceChart data={radarData} />
        </div>

        {/* 캘린더 + (데스크톱) 우측 패널 */}
        <div className="w/full mx-auto mt-6 flex max-w-6xl justify-center rounded-2xl bg-white p-4 shadow-sm outline-none focus:outline-none">
          <div className="flex w-full flex-row gap-6">
            {/* 캘린더 */}
            <div className="flex min-w-0 flex-1 basis-0 justify-center">
              <CalendarComponent
                onChange={handleDayClick}
                onMonthChange={handleMonthChange}
                attendanceMap={attendanceMap ?? {}}
                resultsMap={resultsMap ?? {}}
                onDayHover={handleDayHover} // 데스크톱 호버 미리보기
              />
            </div>

            {/* 데스크톱 우측 패널 */}
            <aside className="hidden min-w-0 flex-1 basis-0 md:flex">
              <div className="sticky top-16 w-full">
                <div className="h-[360px] overflow-y-auto rounded-2xl bg-white p-4 shadow-sm">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {effectiveDate ?? '날짜를 선택하세요'}
                      {hoverCapable &&
                        debouncedHoverDate &&
                        selectedDate &&
                        debouncedHoverDate !== selectedDate && (
                          <span className="ml-2 text-xs text-indigo-500">
                            (미리보기)
                          </span>
                        )}
                    </div>
                    {selectedDate && (
                      <button
                        onClick={() => setSelectedDate(null)}
                        className="text-xs text-gray-500 hover:underline"
                      >
                        선택 해제
                      </button>
                    )}
                  </div>

                  {effectiveDate &&
                    Object.keys(solvesByCategory).length === 0 && (
                      <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
                        해당 날짜에는 풀이 기록이 없습니다.
                      </div>
                    )}

                  {effectiveDate &&
                    Object.entries(solvesByCategory).map(
                      ([category, solves]) => (
                        <div
                          key={category}
                          role="button"
                          onClick={() => goSolvePage(category)}
                          className="mx-auto mb-3 flex w-full cursor-pointer items-center justify-center transition-transform hover:scale-[1.01]"
                        >
                          <TestCard solves={solves} category={category} />
                        </div>
                      )
                    )}

                  {!effectiveDate && (
                    <div className="text-sm text-gray-500">
                      캘린더에서 날짜를 선택하거나(모바일), 날짜 위로 마우스를
                      올리면(데스크톱) 이곳에 카드가 표시됩니다.
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* 본인 계정일 때만 계정 설정 버튼 */}
        {session?.user.userId === userData?.userId && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setIsAccountOpen(true)}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:brightness-110 active:scale-[.99]"
            >
              아이디/비밀번호 변경
            </button>
          </div>
        )}
      </div>

      {/* 계정 설정 모달 */}
      {isAccountOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsAccountOpen(false)}
          />
          <div className="relative mx-auto w-full max-w-lg">
            <AccountSettingsCard
              internalId={userData?.id ?? ''}
              currentUserId={userData?.userId ?? ''}
              onClose={() => setIsAccountOpen(false)}
            />
          </div>
        </div>
      )}

      {/* 모바일 모달 */}
      {!isDesktop && isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative mx-auto w-full max-w-lg">
            <div className="flex max-h-[min(88vh,720px)] flex-col overflow-hidden rounded-2xl bg-white outline outline-gray-200">
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <div className="text-sm text-gray-500">선택한 날짜</div>
                <button
                  className="rounded-md px-2 py-1 text-sm hover:bg-gray-100"
                  onClick={closeModal}
                >
                  닫기 ✕
                </button>
              </div>

              <div className="px-4 pt-2 text-lg font-semibold">
                {selectedDate ?? '-'}
              </div>

              <div className="flex-1 overflow-y-auto px-4 pt-2 pb-4">
                {Object.keys(solvesByCategory).length === 0 && (
                  <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
                    해당 날짜에는 풀이 기록이 없습니다.
                  </div>
                )}

                {Object.entries(solvesByCategory).map(([category, solves]) => (
                  <div
                    key={category}
                    role="button"
                    onClick={() => goSolvePage(category)}
                    className="mx-auto my-2 flex w-full max-w-md cursor-pointer items-center justify-center transition-transform hover:scale-[1.01]"
                  >
                    <TestCard solves={solves} category={category} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
