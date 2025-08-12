'use client';

import CalendarComponent from './components/CalenderComponent';
import React from 'react';
import RadarChartComponent from './components/RadarChartComponent';

export default function MyPage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-[rgb(254,247,255)]">
      {/* Title */}
      <div className="w-full text-center">
        <h1 className="text-2xl font-semibold sm:text-3xl">
          동규의 마이페이지
        </h1>
      </div>
      <RadarChartComponent />
      <CalendarComponent />
    </main>
  );
}
