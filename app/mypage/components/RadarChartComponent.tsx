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

// ✅ 레이더 데이터 타입에 correct/total 추가
type RadarDatum = {
  subject: string;
  value: number; // % 값 (0~100)
  correct: number; // 맞은 개수
  total: number; // 전체 개수
};

// ✅ 커스텀 툴팁
type CustomTooltipProps = {
  active?: boolean;
  payload?: Array<{ payload: RadarDatum }>;
};

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0].payload;
  const pct = p.total > 0 ? Math.round((p.correct / p.total) * 100) : 0;

  return (
    <div className="rounded-md bg-white/95 px-3 py-2 text-sm">
      <div className="mb-1 font-medium">{p.subject}</div>
      <div>
        <span className="font-bold text-green-600">{p.correct}</span>/{p.total}{' '}
        • {pct}%
      </div>
    </div>
  );
}

/**
 * RadarChartComponent
 * - 반응형 레이더 차트
 * - props로 data(overrides) 전달 가능
 */
export default function RadarChartComponent({
  data = [],
  className = '',
}: {
  data?: RadarDatum[]; // ✅ 타입 교체
  className?: string;
}) {
  return (
    <div className={`w-full max-w-xl ${className}`}>
      <div className="rounded-2x h-[280px] backdrop-blur sm:h-[340px]">
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
            {/* ✅ 커스텀 툴팁로 교체 */}
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
