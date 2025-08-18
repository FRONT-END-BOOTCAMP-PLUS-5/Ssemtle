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

  // 1) 유저 정보 (납작 구조)
  const { data: userData } = useGets<GetUserInfoResponseDTO>(
    ['user-info', userId],
    `/users/${userId}`,
    !!userId
  );
  // userData: { id, userId, name, role }

  // ✅ 납작 구조 기반 파생 값
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
  console.log('📅 월별 풀이 캘린더:', calendarResp);
  console.log('username:', username, 'month:', month);
  // 5) 캘린더 바인딩 맵 (맞은/전체, 연속 출석)
  const { resultsMap, attendanceMap } = useMemo(() => {
    const map: Record<string, { correct: number; total: number }> = {};
    const days = calendarResp?.days ?? [];

    for (const d of days) {
      map[d.date] = { correct: d.correct, total: d.total };
    }

    // 🔥 연속 출석: 풀이가 있는 날들만 기준
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

  // 6) 날짜 클릭 → 모달로 그 날짜 solves 표시
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSolves, setSelectedSolves] = useState<SolveListItemDto[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDayClick = (d: Date) => {
    const key = ymd(d);
    const day = calendarResp?.days.find((x) => x.date === key);
    setSelectedDate(key);
    setSelectedSolves(day?.solves ?? []);
    setIsModalOpen(true);
  };

  // 7) 달 변경 콜백
  const handleMonthChange = (newMonth: string) => {
    setMonth(newMonth);
  };

  // 모달 열릴 때 body 스크롤 잠금
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isModalOpen]);

  const closeModal = () => setIsModalOpen(false);

  const goSolvePage = (category: string) => {
    const q = new URLSearchParams();
    if (selectedDate) q.set('date', selectedDate);
    if (category) q.set('category', category);
    router.push(`/solve?${q.toString()}`);
  };

  // 모달 리스트: 카테고리 그룹핑
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

  return (
    <main className="min-h-[calc(100vh-64px)] w-full bg-[#f6f7fb]">
      <div className="mx-auto w-full max-w-xl px-4 py-6">
        <div className="w-full text-center">
          <h1 className="text-2xl font-semibold sm:text-3xl">
            {displayName}의 마이페이지
          </h1>
        </div>

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
          className="mx-auto mt-4 w-full max-w-xl outline-none focus:outline-none"
          onMouseDown={(e) => e.preventDefault()}
        >
          <PerformanceChart data={radarData} />
        </div>

        {/* 캘린더 */}
        <div className="mt-6 flex justify-center">
          <CalendarComponent
            onChange={handleDayClick}
            onMonthChange={handleMonthChange}
            attendanceMap={attendanceMap ?? {}}
            resultsMap={resultsMap ?? {}}
          />
        </div>
      </div>

      {/* 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {' '}
          {/* ★ 변경: flex 가운데 정렬 */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeModal}
          />
          {/* ★ 변경: bottom-0 제거, 가운데 카드 */}
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
                {selectedDate}
              </div>

              {/* ★ 변경: max-h-[80vh] 제거 → 내부만 스크롤 */}
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
                    className="mx-auto flex w-full max-w-md cursor-pointer items-center justify-center transition-transform hover:scale-[1.01]"
                  >
                    <TestCard solves={solves} category={category} />
                  </div>
                ))}
              </div>
              {/* --- 끝 --- */}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
