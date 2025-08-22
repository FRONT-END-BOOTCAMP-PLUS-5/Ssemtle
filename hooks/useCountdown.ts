import { useMemo } from 'react';
import { useTimer } from './useTimer';

// A convenience wrapper that starts a countdown for the given seconds.
// Changing `seconds` resets the countdown from now.
export const useCountdown = (seconds: number | null | undefined) => {
  // Always compute a string so we can call the hook unconditionally.
  const endTime: string = useMemo(() => {
    if (seconds == null) return new Date(0).toISOString(); // already expired
    const ms = Math.max(0, Math.round(seconds * 1000));
    return new Date(Date.now() + ms).toISOString();
  }, [seconds]);

  return useTimer(endTime);
};
