'use client';

import React, { useMemo } from 'react';

type Props = {
  value?: Date;
  onChange?: (date: Date) => void;
  className?: string;
};

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

export default function SimpleCalendar({
  value,
  onChange,
  className = '',
}: Props) {
  const [cursor, setCursor] = React.useState<Date>(
    value ? startOfMonth(value) : startOfMonth(new Date())
  );
  const today = new Date();

  const weeks = useMemo(() => {
    const first = startOfMonth(cursor);
    const last = endOfMonth(cursor);
    // JS: 0=Sun..6=Sat -> we want weeks starting Mon (Korean convention). Map Sun(0) to 7
    const firstWeekday = (first.getDay() + 6) % 7; // 0=Mon..6=Sun
    const days: Date[] = [];

    // Fill leading days from previous month
    for (let i = 0; i < firstWeekday; i++) {
      const d = new Date(first);
      d.setDate(first.getDate() - (firstWeekday - i));
      days.push(d);
    }
    // Current month days
    for (let d = 1; d <= last.getDate(); d++) {
      days.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
    }
    // Trailing to complete 6 rows (6*7=42)
    while (days.length % 7 !== 0 || days.length < 42) {
      const lastDay = days[days.length - 1];
      const next = new Date(lastDay);
      next.setDate(lastDay.getDate() + 1);
      days.push(next);
    }

    // chunk into weeks of 7
    const result: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) result.push(days.slice(i, i + 7));
    return result;
  }, [cursor]);

  const monthLabel = `${cursor.getFullYear()}. ${String(cursor.getMonth() + 1).padStart(2, '0')}`;

  return (
    <div
      className={`w-full max-w-md rounded-2xl bg-white p-4 shadow ${className}`}
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <button
          className="rounded-lg px-3 py-1 hover:bg-gray-100"
          onClick={() => setCursor((c) => addMonths(c, -1))}
          aria-label="Previous month"
        >
          ◀
        </button>
        <div className="text-lg font-semibold select-none">{monthLabel}</div>
        <button
          className="rounded-lg px-3 py-1 hover:bg-gray-100"
          onClick={() => setCursor((c) => addMonths(c, 1))}
          aria-label="Next month"
        >
          ▶
        </button>
      </div>

      {/* Weekday header (Mon..Sun) */}
      <div className="mb-1 grid grid-cols-7 text-center text-xs text-gray-500">
        {['월', '화', '수', '목', '금', '토', '일'].map((d) => (
          <div key={d} className="py-1 select-none">
            {d}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-1">
        {weeks.flat().map((d, idx) => {
          const inMonth = d.getMonth() === cursor.getMonth();
          const selected = value && isSameDay(d, value);
          const isToday = isSameDay(d, today);
          return (
            <button
              key={idx}
              onClick={() => onChange?.(d)}
              className={[
                'flex h-10 items-center justify-center rounded-lg text-sm select-none',
                !inMonth ? 'text-gray-300' : 'text-gray-900',
                selected ? 'bg-purple-600 text-white' : 'hover:bg-gray-100',
                isToday && !selected ? 'ring-1 ring-purple-400' : '',
              ].join(' ')}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-3 flex justify-between">
        <button
          className="rounded-lg px-3 py-1 text-sm hover:bg-gray-100"
          onClick={() => setCursor(startOfMonth(today))}
        >
          오늘로 이동
        </button>
        {value && (
          <div className="text-sm text-gray-600">
            선택: {value.getFullYear()}.
            {String(value.getMonth() + 1).padStart(2, '0')}.
            {String(value.getDate()).padStart(2, '0')}
          </div>
        )}
      </div>
    </div>
  );
}
