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
    <div className={`relative w-full max-w-xl ${className}`}>
      {/* 우상단 토글 버튼 */}
      <div className="absolute top-3 right-3 z-10">
        <button
          onClick={toggle}
          className="rounded-full border border-gray-200 bg-white/90 px-3 py-1 text-xs shadow hover:bg-gray-50"
          aria-label={buttonLabel}
          title={buttonLabel}
        >
          {buttonLabel}
        </button>
      </div>

      {/* 그래프 본체 */}
      {mode === 'radar' ? (
        <RadarChartComponent data={data} />
      ) : (
        <BarChartComponent data={data} />
      )}
    </div>
  );
}
