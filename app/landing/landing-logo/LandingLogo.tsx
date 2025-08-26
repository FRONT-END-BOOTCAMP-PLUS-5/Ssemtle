'use client';

import { useParticle } from '@/hooks/useParticle';
import LogoAnimation from './components/LogoAnimation';
import TextAnimated from './components/TextAnimated';
import ScrollIndicator from './components/ScrollIndicator';

export default function LandingLogo() {
  const { animationPhase, isClient } = useParticle();

  if (!isClient) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center opacity-0">
          <h1 className="mb-2 text-4xl font-bold text-gray-800">
            기초학력의 시작
          </h1>
          <h2 className="text-6xl font-extrabold">Ssemtle</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100">
      <LogoAnimation animationPhase={animationPhase} />
      <TextAnimated animationPhase={animationPhase} />
      <ScrollIndicator animationPhase={animationPhase} />
    </div>
  );
}
