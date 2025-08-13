'use client';

import React, { useMemo } from 'react';
import CalendarComponent from './components/CalenderComponent'; // 파일명 확인!
import RadarChartComponent from './components/RadarChartComponent';
import { useGets } from '@/hooks/useGets';
import { GetStudentUnitPerformanceResponseDTO } from '@/backend/analysis/dtos/GetStudentUnitPerformanceDTO';
import { CreateUserResponseDto } from '@/backend/auth/dtos/UserDto';

export default function MyPage() {
  // 1) 세션 먼저
  const { data: userData } = useGets<CreateUserResponseDto>(
    ['auth', 'session'],
    '/auth/session',
    true
  );

  // 세션 구조 안전 처리 (user.userId 또는 userId)
  const username = userData?.user?.userId ?? userData?.userId ?? undefined;

  // 2) 분석 데이터: username 있을 때만 호출
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

  // 3) 차트 데이터 만들기
  const { radarData, debugRows } = useMemo(() => {
    const rows = analysisData?.units ?? [];

    // 숫자형 보정 + 방어
    const sane = rows.map((u) => ({
      unitId: Number(u.unitId),
      unitName: String(u.unitName ?? `Unit ${u.unitId}`),
      total: Number(u.total) || 0,
      correct: Number(u.correct) || 0,
    }));
    // total이 0인 항목은 퍼센트 0으로 두거나 제외하고 싶다면 여기서 필터 가능
    // .filter(u => u.total > 0)
    // unitName 기준으로 합산(중복 라벨 병합)
    const agg = new Map<string, { total: number; correct: number }>();
    for (const u of sane) {
      const prev = agg.get(u.unitName) ?? { total: 0, correct: 0 };
      agg.set(u.unitName, {
        total: prev.total + u.total,
        correct: prev.correct + u.correct,
      });
    }

    // 퍼센트 계산 + 0~100 클램프
    const data = Array.from(agg.entries()).map(([name, v]) => {
      const pct = v.total > 0 ? Math.round((v.correct / v.total) * 100) : 0;
      const value = Math.max(0, Math.min(100, pct));

      return {
        subject: name,
        value,
        correct: v.correct,
        total: v.total,
      };
    });

    data.sort((a, b) => a.subject.localeCompare(b.subject, 'ko'));

    // 디버그 테이블용 원본 행 정리
    const debug = sane
      .map((u) => ({
        unitId: u.unitId,
        unitName: u.unitName,
        correct: u.correct,
        total: u.total,
        pct: u.total > 0 ? Math.round((u.correct / u.total) * 100) : 0,
      }))
      .sort((a, b) => a.unitId - b.unitId);

    return { radarData: data, debugRows: debug };
  }, [analysisData]);

  const displayName = userData?.user?.name ?? userData?.name ?? '사용자';

  return (
    <main className="flex min-h-screen flex-col items-center bg-[rgb(254,247,255)]">
      <div className="w-full text-center">
        <h1 className="text-2xl font-semibold sm:text-3xl">
          {displayName}의 마이페이지
        </h1>
      </div>

      {/* 로딩/에러 표시 */}
      {(!username || isLoading) && <div className="mt-4">불러오는 중…</div>}
      {isError && (
        <div className="mt-4 text-red-600">에러: {error?.message}</div>
      )}

      {/* 레이더 차트 */}
      <RadarChartComponent data={radarData} />

      {/* 디버그: 원본 rows를 표로 잠깐 보여주기 (확인 끝나면 지워도 됨) */}
      <div className="mt-6 w-full max-w-xl rounded-xl bg-white p-4 shadow">
        <h2 className="mb-2 font-semibold">원본 데이터 확인</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="py-1 pr-2">unitId</th>
                <th className="py-1 pr-2">unitName</th>
                <th className="py-1 pr-2">correct</th>
                <th className="py-1 pr-2">total</th>
                <th className="py-1 pr-2">%</th>
              </tr>
            </thead>
            <tbody>
              {debugRows.map((r, i) => (
                <tr key={i} className="border-t border-gray-100">
                  <td className="py-1 pr-2">{r.unitId}</td>
                  <td className="py-1 pr-2">{r.unitName}</td>
                  <td className="py-1 pr-2">{r.correct}</td>
                  <td className="py-1 pr-2">{r.total}</td>
                  <td className="py-1 pr-2">{r.pct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          동일 과목명이 여러 유닛에 걸쳐 있으면 합산되어 차트에 한 번만
          표시됩니다.
        </p>
      </div>

      <CalendarComponent />
    </main>
  );
}
