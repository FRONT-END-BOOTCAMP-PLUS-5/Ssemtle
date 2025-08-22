import { useState, useEffect, useCallback } from 'react';

const INTERVAL = 1000; // 1 second

export const useTimer = (endTime: string) => {
  const compute = useCallback(() => {
    const endMs = new Date(endTime).getTime();
    const diff = endMs - Date.now();
    return Number.isFinite(diff) ? Math.max(0, diff) : 0;
  }, [endTime]);

  const [timeLeft, setTimeLeft] = useState<number>(() => compute());

  useEffect(() => {
    // Sync immediately on endTime change
    const initial = compute();
    setTimeLeft(initial);
    if (initial <= 0) return;

    let id: ReturnType<typeof setInterval> | null = null;

    const tick = () => {
      const diff = compute();
      if (diff <= 0) {
        setTimeLeft(0);
        if (id) clearInterval(id);
      } else {
        setTimeLeft(diff);
      }
    };

    id = setInterval(tick, INTERVAL);
    return () => {
      if (id) clearInterval(id);
    };
  }, [compute]);

  return timeLeft;
};
