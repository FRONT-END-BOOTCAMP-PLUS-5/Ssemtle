'use client';

import CalendarComponent from './components/CalenderComponent';
import React from 'react';
import RadarChartComponent from './components/RadarChartComponent';
import { useGets } from '@/hooks/useGets';
import { GetStudentUnitPerformanceResponseDTO } from '@/backend/analysis/dtos/GetStudentUnitPerformanceDTO';
import { CreateUserResponseDto } from '@/backend/auth/dtos/UserDto';

export default function MyPage() {
  const { data: analysisData } = useGets<GetStudentUnitPerformanceResponseDTO>(
    ['mypage'],

    '/students/unit',

    true
  );

  const { data: userData } = useGets<CreateUserResponseDto>(
    ['auth', 'session'],
    '/auth/session',
    true
  );

  console.log('analysisData', analysisData);
  console.log('userData', userData);
  console.log('BASE_URL', process.env.NEXT_PUBLIC_BASE_URL);
  return (
    <main className="flex min-h-screen flex-col items-center bg-[rgb(254,247,255)]">
      {/* Title */}
      <div className="w-full text-center">
        <h1 className="text-2xl font-semibold sm:text-3xl">
          {userData?.user.name}의 마이페이지
        </h1>
      </div>
      <RadarChartComponent />
      <CalendarComponent />
    </main>
  );
}
