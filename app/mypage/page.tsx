'use client';

import React, { useMemo } from 'react';
import CalendarComponent from './components/CalenderComponent'; // 파일명이 CalendarComponent면 경로/스펠링 확인!
import RadarChartComponent from './components/RadarChartComponent';
import { useGets } from '@/hooks/useGets';
import { GetStudentUnitPerformanceResponseDTO } from '@/backend/analysis/dtos/GetStudentUnitPerformanceDTO';
import { CreateUserResponseDto } from '@/backend/auth/dtos/UserDto';

export default function MyPage() {
  // 1) 세션
  const { data: userData } = useGets<CreateUserResponseDto>(
    ['auth', 'session'],
    '/auth/session',
    true
  );
  const username = userData?.user?.userId ?? userData?.userId; // 둘 중 있는 쪽

  // 2) 분석 데이터 (username 있을 때만 호출)
  const { data: analysisData } = useGets<GetStudentUnitPerformanceResponseDTO>(
    ['mypage', username],
    username ? `/students/${username}/unit` : '',
    !!username // enabled
  );

  // 3) 레이더 차트용 데이터: 정답률(%) = round(correct / total * 100)
  const radarData = useMemo(() => {
    const units = analysisData?.units ?? [];
    return units.map((u) => ({
      subject: u.unitName || `Unit ${u.unitId}`,
      value: u.total > 0 ? Math.round((u.correct / u.total) * 100) : 0,
    }));
  }, [analysisData]);

  return (
    <main className="flex min-h-screen flex-col items-center bg-[rgb(254,247,255)]">
      {/* Title */}
      <div className="w-full text-center">
        <h1 className="text-2xl font-semibold sm:text-3xl">
          {(userData as unknown)?.user?.name ??
            (userData as unknown)?.name ??
            '사용자'}
          의 마이페이지
        </h1>
      </div>

      {/* 4) 레이더 차트에 바인딩 */}
      <RadarChartComponent data={radarData} />

      <CalendarComponent />
    </main>
  );
}
