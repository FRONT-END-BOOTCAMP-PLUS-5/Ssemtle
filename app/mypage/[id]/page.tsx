'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGets } from '@/hooks/useGets';
import { GetStudentUnitPerformanceResponseDTO } from '@/backend/analysis/dtos/GetStudentUnitPerformanceDTO';
import { GetUserInfoResponseDTO } from '@/backend/auth/dtos/UserDto';
import CalendarComponent from '../components/CalenderComponent';
import TestCard from '../../_components/cards/TestCard';
import PerformanceChart from '../components/PerformanceChart';
import { SolveListItemDto } from '@/backend/solves/dtos/SolveDto';
import AccountSettingsCard from '../components/AccountSettingsCard';
import { useSession } from 'next-auth/react';

// ---------- 달력(월별) API 응답 타입 ----------
type CalendarDay = {
  date: string; // 'YYYY-MM-DD'
  total: number;
  correct: number;
  accuracy: number; // 0~1
  solves: SolveListItemDto[]; // 당일 풀이 리스트
};

type CalendarResponse = {
  days: CalendarDay[];
};

// ---------- 유틸 ----------
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

  // 1) 유저 정보 (납작 구조)
  const { data: userData } = useGets<GetUserInfoResponseDTO>(
    ['user-info', userId],
    `/users/${userId}`,
    !!userId
  );

  //  납작 구조 기반 파생 값
  const username = userData?.userId; // 분석/캘린더 API에 사용할 외부 식별자
  const displayName = userData?.name ?? '사용자'; // 화면표시용 이름

  // 2) 현재 보고 있는 달 상태 (초기: 오늘)
  const [month, setMonth] = useState<string>(() => ym(new Date()));

  // 3) 레이더 차트 데이터 (학생 단원 성과)
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

  // 4) 월별 캘린더 데이터
  const { data: calendarResp } = useGets<CalendarResponse>(
    ['solvesCalendar', username, month],
    username ? `/solves/calendar/user/${username}?month=${month}` : '',
    !!username
  );

  // 5) 캘린더 바인딩 맵 (맞은/전체, 연속 출석)
  const { resultsMap, attendanceMap } = useMemo(() => {
    const map: Record<string, { correct: number; total: number }> = {};
    const days = calendarResp?.days ?? [];

    for (const d of days) {
      map[d.date] = { correct: d.correct, total: d.total };
    }

    // 풀이 있는 날들만 기준으로 연속 출석
    const activeDays = days
      .filter((d) => d.total > 0)
      .map((d) => d.date)
      .sort();
    const att: Record<string, number> = {};
    let streak = 0;
    let prev: string | null = null;

    const isNextDay = (a: string, b: string): boolean => {
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

  // 6) 날짜 선택 상태 (모달/패널 공통)
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSolves, setSelectedSolves] = useState<SolveListItemDto[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 날짜 클릭 → 모바일: 모달 / 데스크톱: 우측 패널
  const handleDayClick = (d: Date) => {
    const key = ymd(d);
    const day = calendarResp?.days.find((x) => x.date === key);
    setSelectedDate(key);
    setSelectedSolves(day?.solves ?? []);
    if (!isDesktop) setIsModalOpen(true);
  };

  // 7) 달 변경 콜백
  const handleMonthChange = (newMonth: string) => {
    setMonth(newMonth);
  };

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

  // 모달/패널 리스트: 카테고리 그룹핑
  const solvesByCategory = useMemo<Record<string, SolveListItemDto[]>>(() => {
    const map: Record<string, SolveListItemDto[]> = {};
    for (const s of selectedSolves) {
      const cat = s.category ?? '전체';
      (map[cat] ??= []).push(s);
    }
    Object.values(map).forEach((arr) =>
      arr.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    );
    return map;
  }, [selectedSolves]);

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
          className="mx-auto mt-4 flex w-full max-w-6xl justify-center rounded-2xl bg-white p-4 shadow-sm outline-none focus:outline-none"
          onMouseDown={(e) => e.preventDefault()}
        >
          <PerformanceChart data={radarData} />
        </div>

        {/* 캘린더 + (데스크톱) 우측 패널 */}

        <div className="mt-6 flex justify-center">
          <div className="grid grid-cols-1 md:grid-cols-[450px_450px]">
            {/* 캘린더 */}
            <div className="flex shrink-0 justify-center">
              <CalendarComponent
                onChange={handleDayClick}
                onMonthChange={handleMonthChange}
                attendanceMap={attendanceMap ?? {}}
                resultsMap={resultsMap ?? {}}
              />
            </div>

            {/* 데스크톱 우측 패널: 항상 보이게 */}
            <aside className="hidden w-[480px] shrink-0 md:block">
              <div className="sticky top-16">
                <div className="h-[360px] overflow-y-auto rounded-2xl bg-white p-4 shadow-sm">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {selectedDate ?? '날짜를 선택하세요'}
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

                  {selectedDate &&
                    Object.keys(solvesByCategory).length === 0 && (
                      <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
                        해당 날짜에는 풀이 기록이 없습니다.
                      </div>
                    )}

                  {selectedDate &&
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

                  {!selectedDate && (
                    <div className="text-sm text-gray-500">
                      캘린더에서 날짜를 선택하면 이곳에 카드가 표시됩니다.
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
              className="rounded-lg bg-indigo-600 px-4 py-2 text-white shadow hover:brightness-110 active:scale-[.99]"
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

      {/* 모바일 모달: 데스크톱에선 사용 안 함 */}
      {!isDesktop && isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative mx-auto w-full max-w-lg">
            <div className="flex max-h-[min(88vh,720px)] flex-col overflow-hidden rounded-2xl bg-white shadow-lg outline outline-gray-200">
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
