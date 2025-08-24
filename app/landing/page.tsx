import React from 'react';
import LandingLogo from './landing-logo/LandingLogo';
import { ScrollNavigation } from './_component/ScrollNavigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SSemtle - 기초학력의 시작',
  description: '기초학력 향상을 위한 AI 기반 학습 플랫폼',
  keywords: '기초학력, 수학, 학습, AI, 교육',
};

const sections = [
  { id: 'hero', label: '홈', icon: '🏠' },
  { id: 'features', label: '기능', icon: '⭐' },
  { id: 'about', label: '소개', icon: 'ℹ️' },
  { id: 'contact', label: '연락처', icon: '📞' },
];

export default function LandingLogoPage() {
  return (
    <div className="scroll-smooth" style={{ scrollSnapType: 'y mandatory' }}>
      <h1 style={{ display: 'none' }}>SSemtle - 기초학력의 시작</h1>

      <ScrollNavigation sections={sections} />

      <section
        id="hero"
        className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100"
        style={{ scrollSnapAlign: 'start' }}
      >
        <LandingLogo />
      </section>

      <section
        id="features"
        className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100"
        style={{ scrollSnapAlign: 'start' }}
      >
        <div className="text-center">
          <h2 className="mb-4 text-4xl font-bold text-gray-800">주요 기능</h2>
          <p className="text-lg text-gray-600">AI 기반 개인 맞춤형 수학 학습</p>
        </div>
      </section>

      <section
        id="about"
        className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100"
        style={{ scrollSnapAlign: 'start' }}
      >
        <div className="text-center">
          <h2 className="mb-4 text-4xl font-bold text-gray-800">
            SSemtle 소개
          </h2>
          <p className="text-lg text-gray-600">
            기초학력 향상을 위한 혁신적인 플랫폼
          </p>
        </div>
      </section>

      <section
        id="contact"
        className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-orange-50 to-red-100"
        style={{ scrollSnapAlign: 'start' }}
      >
        <div className="text-center">
          <h2 className="mb-4 text-4xl font-bold text-gray-800">문의하기</h2>
          <p className="text-lg text-gray-600">
            더 자세한 정보가 필요하시나요?
          </p>
        </div>
      </section>
    </div>
  );
}
