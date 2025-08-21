'use client';

import { useEffect, useRef } from 'react';
import { useCountdown } from '@/hooks/useCountdown';
import { formatDuration } from '@/libs/formatDuration';

interface ExamCountdownProps {
  timeMinutes: number;
  onTimeUp: () => void;
  disabled?: boolean;
}

export default function ExamCountdown({
  timeMinutes,
  onTimeUp,
  disabled = false,
}: ExamCountdownProps) {
  const timeLeftMs = useCountdown(timeMinutes * 60); // Convert minutes to seconds
  const hasCalledRef = useRef(false);

  // Call onTimeUp when countdown reaches 0 (only once)
  useEffect(() => {
    if (timeLeftMs === 0 && !disabled && !hasCalledRef.current) {
      hasCalledRef.current = true; // Synchronously prevent duplicate calls
      onTimeUp();
    }
  }, [timeLeftMs, onTimeUp, disabled]);

  // Reset the call flag when timer restarts (new exam)
  useEffect(() => {
    hasCalledRef.current = false;
  }, [timeMinutes]);

  const getCountdownStyle = () => {
    const timeLeftMinutes = timeLeftMs / (1000 * 60);

    if (timeLeftMinutes < 5) {
      return 'text-red-600 bg-red-50 border-red-200';
    } else if (timeLeftMinutes < 10) {
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getIcon = () => {
    const timeLeftMinutes = timeLeftMs / (1000 * 60);

    if (timeLeftMinutes < 5) {
      return '⚠️';
    } else if (timeLeftMinutes < 10) {
      return '⏰';
    }
    return '🕐';
  };

  return (
    <div
      className={`flex items-center space-x-2 rounded-lg border px-3 py-2 font-mono text-sm font-semibold ${getCountdownStyle()}`}
    >
      <span className="text-base">{getIcon()}</span>
      <span>남은 시간: {formatDuration(timeLeftMs)}</span>
    </div>
  );
}
