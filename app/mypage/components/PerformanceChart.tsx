'use client';

import React from 'react';
import BarChartComponent, { ChartDatum } from './BarChartComponent';
import RadarChartComponent from './RadarChartComponent';

type ViewMode = 'radar' | 'bar';

export default function PerformanceChart({
  data,
  initial = 'radar',
  className = '',
}: {
  data: ChartDatum[];
  initial?: ViewMode;
  className?: string;
}) {
  const [mode, setMode] = React.useState<ViewMode>(initial);
  const toggle = () => setMode((m) => (m === 'radar' ? 'bar' : 'radar'));
  const buttonLabel = mode === 'radar' ? '막대그래프로 보기' : '레이더로 보기';

  return (
    <div className={`w-full ${className}`}>
      {/* ===== 모바일/태블릿 (<1024px): 토글 방식 ===== */}
      <div className="relative mx-auto block max-w-xl lg:hidden">
        {/* 우상단 토글 버튼 */}
        <div className="absolute top-3 right-3 z-10">
          <button
            onClick={toggle}
            className="rounded-full border border-gray-200 bg-white/90 px-3 py-1 text-xs hover:bg-gray-50"
            aria-label={buttonLabel}
            title={buttonLabel}
          >
            {buttonLabel}
          </button>
        </div>

        {/* 그래프 본체 (단일) */}
        {mode === 'radar' ? (
          <RadarChartComponent data={data} />
        ) : (
          <BarChartComponent data={data} />
        )}
      </div>

      {/* ===== 데스크톱 (≥1024px): 좌우 동시 배치 ===== */}
      <section className="hidden w-full gap-8 lg:flex lg:items-stretch">
        {/* 레이더(왼쪽) */}
        <div
          className="flex-1 rounded-2xl bg-white p-4 outline-none focus:outline-none"
          onMouseDown={(e) => e.preventDefault()}
        >
          <h2 className="mb-2 text-sm font-medium text-gray-600">
            단원 성과(레이더)
          </h2>
          <RadarChartComponent data={data} />
        </div>

        {/* 막대(오른쪽) */}
        <div className="flex-1 rounded-2xl bg-white p-4">
          <h2 className="mb-2 text-sm font-medium text-gray-600">
            단원별 정답률(%)
          </h2>
          <BarChartComponent data={data} />
        </div>
      </section>
    </div>
  );
}
