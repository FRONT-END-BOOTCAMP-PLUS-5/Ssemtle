import React from 'react';
import LandingLogo from './landing-logo/LandingLogo';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SSemtle - 기초학력의 수학',
  description: '기초학력 향상을 위한 AI 기반 학습 플랫폼',
  keywords: '기초학력, 수학, 학습, AI, 교육',
};

export default function LandingLogoPage() {
  return (
    <div className="flex flex-col">
      <h1 style={{ display: 'none' }}>SSemtle - 기초학력의 수학</h1>

      <div className="flex h-screen w-screen items-center justify-center bg-white">
        <LandingLogo />
      </div>

      <div className="flex h-screen w-screen items-center justify-center bg-white"></div>
      <div className="flex h-screen w-screen items-center justify-center bg-white"></div>

      <div className="flex h-screen w-screen items-center justify-center bg-white"></div>
    </div>
  );
}
