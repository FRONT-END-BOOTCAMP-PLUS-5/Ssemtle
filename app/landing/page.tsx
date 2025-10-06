import React from 'react';
import LandingLogo from './landing-logo/LandingLogo';
import { ScrollNavigation } from './_component/ScrollNavigation';
import { ProblemSolvingSphere } from './landing-sphere/ProblemSolvingSphere';
import InteractiveLanding from './landing-trial/InteractiveLanding';
import { createMetadata, SITE_CONFIG } from '@/libs/metadata';

export const metadata = createMetadata({
  path: '/landing',
});

const sections = [
  { id: 'hero', label: '홈', icon: '🏠' },
  { id: 'problem-solving', label: '문제해결', icon: '💡' },
  { id: 'features', label: '기능', icon: '⭐' },
  { id: 'contact', label: '연락처', icon: '📞' },
];

export default function LandingLogoPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.baseUrl,
    logo: `${SITE_CONFIG.baseUrl}${SITE_CONFIG.logo}`,
    sameAs: [SITE_CONFIG.baseUrl],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: 'Korean',
    },
    foundingDate: '2025',
    areaServed: {
      '@type': 'Country',
      name: 'South Korea',
    },
    serviceType: 'Educational Technology',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web Browser',
  };

  return (
    <div className="scroll-smooth" style={{ scrollSnapType: 'y mandatory' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 style={{ display: 'none' }}>SSemtle - 기초학력의 수학</h1>

      <ScrollNavigation sections={sections} />

      <section
        id="hero"
        className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100"
        style={{ scrollSnapAlign: 'start' }}
      >
        <LandingLogo />
      </section>
      <section
        id="problem-solving"
        className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100"
        style={{ scrollSnapAlign: 'start' }}
      >
        <div className="flex h-screen w-full text-center">
          <ProblemSolvingSphere />
        </div>
      </section>

      <section
        id="features"
        className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100"
        style={{ scrollSnapAlign: 'start' }}
      >
        <InteractiveLanding />
      </section>

      <section
        id="contact"
        className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-orange-50 to-red-100"
        style={{ scrollSnapAlign: 'start' }}
      >
        <div className="max-w-4xl px-8 text-center">
          <h2 className="mb-6 text-4xl font-bold text-gray-800">문의하기</h2>
          <p className="mb-8 text-xl text-gray-700">
            더 자세한 정보가 필요하시나요?
          </p>
          <div className="rounded-lg bg-white/80 p-8 shadow-md">
            <h3 className="mb-6 text-2xl font-semibold text-gray-800">
              지금 시작해보세요
            </h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="text-center">
                <h4 className="mb-3 text-lg font-semibold text-gray-800">
                  👨‍🎓 학생용
                </h4>
                <p className="mb-4 text-gray-600">
                  개인 맞춤형 학습으로 기초 실력을 향상시켜보세요
                </p>
                <a
                  href="/signup/students"
                  className="inline-block rounded-lg bg-blue-500 px-6 py-3 text-white transition-colors hover:bg-blue-600"
                >
                  학생 회원가입
                </a>
              </div>
              <div className="text-center">
                <h4 className="mb-3 text-lg font-semibold text-gray-800">
                  👩‍🏫 교사용
                </h4>
                <p className="mb-4 text-gray-600">
                  학생들의 학습 현황을 체계적으로 관리하세요
                </p>
                <a
                  href="/signup/teacher"
                  className="inline-block rounded-lg bg-green-500 px-6 py-3 text-white transition-colors hover:bg-green-600"
                >
                  교사 회원가입
                </a>
              </div>
            </div>
            <div className="mt-8 border-t border-gray-200 pt-6">
              <p className="text-gray-600">
                이미 계정이 있으신가요?
                <a
                  href="/signin"
                  className="font-medium text-blue-600 hover:text-blue-800"
                >
                  로그인하기
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
