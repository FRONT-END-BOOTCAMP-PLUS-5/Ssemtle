'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// 공통 데이터 타입 (퍼센트 + 맞은/전체)
export type ChartDatum = {
  subject: string;
  value: number; // 0~100 (%)
  correct: number;
  total: number;
};

// recharts Tooltip을 any 없이 안전하게 쓰기 위한 최소 타입
type RechartsPayload<T> = { payload: T };
type TooltipContentProps<T> = {
  active?: boolean;
  payload?: Array<RechartsPayload<T>>;
};

function CustomTooltip({ active, payload }: TooltipContentProps<ChartDatum>) {
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0].payload;
  const pct = p.total > 0 ? Math.round((p.correct / p.total) * 100) : 0;
  return (
    <div className="rounded-md bg-white/95 px-3 py-2 text-sm shadow">
      <div className="mb-1 font-medium">{p.subject}</div>
      <div>
        <span className="font-bold text-green-600">{p.correct}</span>/{p.total}{' '}
        • {pct}%
      </div>
    </div>
  );
}

export default function BarChartComponent({
  data,
  className = '',
}: {
  data: ChartDatum[];
  className?: string;
}) {
  return (
    <div className={`w-full max-w-xl ${className}`}>
      <div className="h-[280px] p-4 backdrop-blur sm:h-[340px] sm:p-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 8, right: 12, bottom: 8, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="subject" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill="rgb(14, 165, 233)" />{' '}
            {/* tailwind sky-500 */}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
