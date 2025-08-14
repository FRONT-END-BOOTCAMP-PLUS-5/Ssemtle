'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGets } from '@/hooks/useGets';
import { GetStudentUnitPerformanceResponseDTO } from '@/backend/analysis/dtos/GetStudentUnitPerformanceDTO';
import { CreateUserResponseDto } from '@/backend/auth/dtos/UserDto';
import CalendarComponent from './components/CalenderComponent';
import TestCard from '../_components/cards/TestCard';
import PerformanceChart from './components/PerformanceChart';

// ==== solves/list 응답 타입(카테고리/유닛은 옵션) ====
type SolveItem = {
  id: number;
  isCorrect: boolean;
  createdAt: string; // ISO
  category?: string;
  unitId?: number;
};

type SolvesListResponse = {
  items: SolveItem[];
  nextCursor?: string | null;
};

// KST 기준 YYYY-MM-DD (UTC → KST 보정)
function toKstYmd(iso: string) {
  const d = new Date(iso);
  const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  const y = kst.getUTCFullYear();
  const m = String(kst.getUTCMonth() + 1).padStart(2, '0');
  const day = String(kst.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function MyPage() {
  const router = useRouter();

  // 1) 세션
  const { data: userData } = useGets<CreateUserResponseDto>(
    ['auth', 'session'],
    '/auth/session',
    true
  );
  type WithUserField = { user: { name?: string; userId?: string } };
  type WithUserId = { userId?: string };

  const username =
    (userData &&
      'user' in userData &&
      (userData as WithUserField).user?.userId) ??
    (userData as WithUserId)?.userId ??
    undefined;

  const displayName =
    (userData &&
      'user' in userData &&
      (userData as WithUserField).user?.name) ??
    (userData as { name?: string })?.name ??
    '사용자';

  // 2) 레이더(단원 성과)
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

  const { data: solvesResp } = useGets<SolvesListResponse>(
    ['solves', username],
    '/solves/list',
    !!username
  );

  // 캘린더 바인딩용 맵 생성 (resultsMap / attendanceMap)
  const { resultsMap, attendanceMap } = useMemo(() => {
    const resMap: Record<string, { correct: number; total: number }> = {};
    const items = solvesResp?.items ?? [];

    for (const it of items) {
      const key = toKstYmd(it.createdAt);
      const cur = resMap[key] ?? { correct: 0, total: 0 };
      cur.total += 1;
      if (it.isCorrect) cur.correct += 1;
      resMap[key] = cur;
    }

    // 연속 출석(풀이가 있는 날짜 기준) → 값이 2 이상이면 🔥
    const days = Object.keys(resMap).sort();
    const attMap: Record<string, number> = {};
    let streak = 0;
    let prev: string | null = null;
    const isNextDay = (a: string, b: string) => {
      const da = new Date(a + 'T00:00:00Z').getTime();
      const db = new Date(b + 'T00:00:00Z').getTime();
      return db - da === 86400000;
    };
    for (const day of days) {
      streak = prev && isNextDay(prev, day) ? streak + 1 : 1;
      attMap[day] = streak;
      prev = day;
    }

    return { resultsMap: resMap, attendanceMap: attMap };
  }, [solvesResp]);

  // 날짜 클릭 → 모달 오픈
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDayClick = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const key = `${yyyy}-${mm}-${dd}`;
    setSelectedDate(key);
    setIsModalOpen(true);
  };

  // 모달 컨텐츠: 선택 날짜 풀이 → (카테고리가 있으면) 카테고리별 그룹
  const solvesByCategoryForSelectedDate = useMemo(() => {
    if (!selectedDate) return {};
    const items = (solvesResp?.items ?? []).filter(
      (it) => toKstYmd(it.createdAt) === selectedDate
    );

    // category가 없으면 "전체"로 묶음
    const map: Record<string, SolveItem[]> = {};
    for (const s of items) {
      const cat = s.category || '전체';
      (map[cat] ??= []).push(s);
    }

    // 최신순 정렬(옵션)
    Object.values(map).forEach((arr) =>
      arr.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    );
    return map;
  }, [solvesResp, selectedDate]);

  //모달 열릴 때 body 스크롤 잠금
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
    // 문제풀이 페이지는 추후 구현 예정 → 라우팅만 연결
    const q = new URLSearchParams();
    if (selectedDate) q.set('date', selectedDate);
    if (category) q.set('category', category);
    router.push(`/solve?${q.toString()}`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center bg-[rgb(254,247,255)]">
      <div className="w-full text-center">
        <h1 className="text-2xl font-semibold sm:text-3xl">
          {displayName}의 마이페이지
        </h1>
      </div>

      {(!username || isLoading) && <div className="mt-4">불러오는 중…</div>}
      {isError && (
        <div className="mt-4 text-red-600">에러: {error?.message}</div>
      )}

      {/* 레이더 */}
      <div className="mt-4 w-full max-w-xl">
        <PerformanceChart data={radarData} />
      </div>

      {/* 캘린더 */}
      <div className="mt-6">
        <CalendarComponent
          onChange={handleDayClick}
          attendanceMap={attendanceMap}
          resultsMap={resultsMap}
        />
      </div>

      {/* 모달 오버레이 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50">
          {/* 반투명 배경 */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeModal}
          />
          {/* 패널 */}
          <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-lg">
            <div className="mx-3 mb-4 rounded-2xl bg-white shadow-lg outline outline-1 outline-gray-200">
              {/* 헤더 */}
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

              {/* 스크롤 리스트 */}
              <div className="max-h-[70vh] space-y-3 overflow-y-auto px-4 pt-2 pb-4">
                {Object.keys(solvesByCategoryForSelectedDate).length === 0 && (
                  <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
                    해당 날짜에는 풀이 기록이 없습니다.
                  </div>
                )}

                {Object.entries(solvesByCategoryForSelectedDate).map(
                  ([category, solves]) => (
                    <div
                      key={category}
                      role="button"
                      onClick={() => goSolvePage(category)}
                      className="cursor-pointer transition-transform hover:scale-[1.01]"
                    >
                      {/* ✅ TestCard에 solves/카테고리 주입 */}
                      <TestCard solves={solves} category={category} />
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
