import { useState, useEffect } from 'react';

export const useParticle = () => {
  const [animationPhase, setAnimationPhase] = useState<'falling' | 'complete'>(
    'falling'
  );
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const phaseTimer = setTimeout(() => {
      setAnimationPhase('complete');
    }, 800);

    const confettiTimer = setTimeout(async () => {
      const { default: confetti } = await import('canvas-confetti');
      confetti({
        particleCount: 40,
        spread: 80,
        startVelocity: 40,
        scalar: 1.0,
      });
    }, 2000);

    return () => {
      clearTimeout(phaseTimer);
      clearTimeout(confettiTimer);
    };
  }, []);

  return { animationPhase, isClient };
};
