'use client';

import React, { useMemo, useRef } from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from 'recharts';

type RadarDatum = {
  subject: string;
  value: number; // 0~100 (%)
  correct: number;
  total: number;
};

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

export default function RadarChartComponent({
  data = [],
  className = '',
}: {
  data?: RadarDatum[];
  className?: string;
}) {
  // ✅ "처음으로 데이터가 채워진 렌더"에서만 애니메이션을 켜고 즉시 닫음(상태/이펙트 X)
  const hasAnimatedRef = useRef(false);
  const dataReady = (data?.length ?? 0) > 0;

  let isAnimationActive = false;
  if (dataReady && !hasAnimatedRef.current) {
    isAnimationActive = true; // 이번 렌더에서만 애니메이션
    hasAnimatedRef.current = true; // 이후 렌더부터는 false
  }

  // (선택) 상위가 매 렌더 새 배열을 만들어도 동일 참조 유지
  const chartData = useMemo(() => data, [data]);

  return (
    <div className={`w-full max-w-xl ${className}`}>
      <div className="h-[280px] rounded-2xl sm:h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData} outerRadius="70%">
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fontSize: 11 }}
            />
            <Radar
              dataKey="value"
              stroke="rgb(124, 58, 237)"
              fill="rgba(124, 58, 237, 0.5)"
              strokeWidth={2}
              isAnimationActive={isAnimationActive}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
