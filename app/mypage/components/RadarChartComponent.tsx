'use client';

import React from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from 'recharts';

// 더미 데이터 (0~100)
const DEFAULT_DATA = [
  { subject: '수학 연산', value: 90 },
  { subject: '일차방정식', value: 70 },
  { subject: '확률', value: 65 },
  { subject: 'PS', value: 50 },
  { subject: 'AI', value: 40 },
  { subject: 'ML', value: 80 },
  { subject: '통계학', value: 75 },
  { subject: '데이터베이스', value: 60 },
];

/**
 * RadarChartComponent
 * - 반응형 레이더 차트
 * - props로 data(overrides) 전달 가능
 */
export default function RadarChartComponent({
  data = DEFAULT_DATA,
  className = '',
}: {
  data?: { subject: string; value: number }[];
  className?: string;
}) {
  return (
    <div className={`w-full max-w-xl ${className}`}>
      <div className="rounded-2x h-[320px] border border-white/40 p-4 shadow-sm backdrop-blur sm:h-[380px] sm:p-6">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="70%">
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fontSize: 11 }}
            />
            <Radar
              dataKey="value"
              stroke="rgb(124, 58, 237)" /* purple-600 */
              fill="rgba(124, 58, 237, 0.5)"
              strokeWidth={2}
            />
            <Tooltip formatter={(v: number) => [`${v}`, '점수']} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
