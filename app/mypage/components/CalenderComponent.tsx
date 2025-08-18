'use client';

import React from 'react';

type Results = { correct: number; total: number };

type Props = {
  value?: Date;
  onChange?: (date: Date) => void;
  className?: string;
  onMonthChange?: (newMonth: string) => void;
  attendanceMap?: Record<string, number>;
  resultsMap?: Record<string, Results>;
  showZero?: boolean;
};

/* ---------- 유틸 ---------- */
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}
function addMonths(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}
function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function ymd(d: Date) {
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
}
function monthLabelOf(d: Date) {
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월`;
}

export default function CalendarComponent({
  value,
  onChange,
  className = '',
  onMonthChange,
  attendanceMap = {},
  resultsMap = {},
}: Props) {
  const [cursor, setCursor] = React.useState<Date>(
    value ? startOfMonth(value) : startOfMonth(new Date())
  );

  React.useEffect(() => {
    if (value) setCursor(startOfMonth(value));
  }, [value]);

  // ✅ 커서 바뀐 후에만 부모 콜백 실행
  React.useEffect(() => {
    if (!onMonthChange) return;
    const y = cursor.getFullYear();
    const m = String(cursor.getMonth() + 1).padStart(2, '0');
    onMonthChange(`${y}-${m}`);
  }, [cursor, onMonthChange]);

  const weeks = React.useMemo(() => {
    const first = startOfMonth(cursor);
    const last = endOfMonth(cursor);
    const firstWeekday = (first.getDay() + 6) % 7;
    const days: Date[] = [];

    for (let i = 0; i < firstWeekday; i++) {
      const d = new Date(first);
      d.setDate(first.getDate() - (firstWeekday - i));
      days.push(d);
    }
    for (let d = 1; d <= last.getDate(); d++) {
      days.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
    }
    while (days.length < 42) {
      const lastDay = days[days.length - 1];
      const next = new Date(lastDay);
      next.setDate(lastDay.getDate() + 1);
      days.push(next);
    }

    const result: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) result.push(days.slice(i, i + 7));
    return result;
  }, [cursor]);

  const today = new Date();

  const goPrev = React.useCallback(() => {
    setCursor((c) => addMonths(c, -1));
  }, []);
  const goNext = React.useCallback(() => {
    setCursor((c) => addMonths(c, 1));
  }, []);

  return (
    <div
      className={`w-full max-w-[350px] rounded-2xl bg-white p-4 shadow ${className}`}
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="text-lg font-semibold select-none">
          {monthLabelOf(cursor)}
        </div>
        <div className="flex items-center gap-1">
          <button
            className="rounded-lg px-2 py-1 hover:bg-gray-100"
            onClick={goPrev}
          >
            ←
          </button>
          <button
            className="rounded-lg px-2 py-1 hover:bg-gray-100"
            onClick={goNext}
          >
            →
          </button>
        </div>
      </div>

      {/* Weekdays */}
      <div className="mb-1 grid grid-cols-7 text-center text-[11px] text-gray-500">
        {['월', '화', '수', '목', '금', '토', '일'].map((d, i) => (
          <div
            key={d}
            className={`py-1 select-none ${i >= 5 ? 'text-red-500' : ''}`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-[4px]">
        {weeks.flat().map((d, idx) => {
          const inMonth = d.getMonth() === cursor.getMonth();
          const selected = value && isSameDay(d, value);
          const isToday = isSameDay(d, today);
          const key = ymd(d);

          const att = attendanceMap[key] || 0;
          const res = resultsMap[key];
          const correct = res?.correct ?? 0;
          const total = res?.total ?? 0;
          const weekend = d.getDay() === 0 || d.getDay() === 6;

          return (
            <button
              key={idx}
              onClick={() => onChange?.(d)}
              className={[
                'relative grid h-10 w-10 grid-cols-2 grid-rows-2 gap-[2px] rounded-lg border border-gray-200 p-1 text-[10px]',
                !inMonth ? 'text-gray-300' : 'text-gray-900',
                selected ? 'ring-2 ring-purple-600' : 'hover:bg-gray-50',
                isToday && !selected ? 'bg-purple-200' : '',
              ].join(' ')}
            >
              {/* 날짜 */}
              <div
                className={`mt-[1px] ml-[1px] self-start justify-self-start font-medium ${
                  inMonth
                    ? weekend
                      ? 'text-red-500'
                      : ''
                    : weekend
                      ? 'text-red-300'
                      : 'text-gray-300'
                }`}
              >
                {d.getDate()}
              </div>

              {/* 🔥 */}
              <div className="self-start justify-self-end">
                {att > 1 ? '🔥' : ''}
              </div>

              {/* 좌하 빈칸 */}
              <div className="self-end justify-self-start" />

              {/* 맞은/전체 — 0/0은 숨김 */}
              {(correct !== 0 || total !== 0) && (
                <div className="self-end justify-self-end text-[9px]">
                  <span className="font-bold text-green-600">{correct}</span>
                  <span className="text-black">/{total}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
