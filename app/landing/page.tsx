import React from 'react';
import LandingLogo from './landing-logo/LandingLogo';
import { ScrollNavigation } from './_component/ScrollNavigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SSemtle - 기초학력의 수학 ',
  description:
    '기초학력 향상을 위한 AI 기반 학습 플랫폼. 개인 맞춤형 수학 학습으로 학생들의 기초 실력을 체계적으로 향상시킵니다.',
  keywords:
    '기초학력, 수학, 학습, AI, 교육, 개인맞춤, 학습플랫폼, 초등수학, 중등수학',
  authors: [{ name: 'SSemtle Team' }],
  creator: 'SSemtle',
  publisher: 'SSemtle',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://ssemtle.com'),
  alternates: {
    canonical: '/landing',
    languages: {
      'ko-KR': '/landing',
    },
  },
  openGraph: {
    title: 'SSemtle - 기초학력의 수학',
    description:
      '기초학력 향상을 위한 AI 기반 학습 플랫폼. 개인 맞춤형 수학 학습으로 학생들의 기초 실력을 체계적으로 향상시킵니다.',
    url: 'https://ssemtle.com/landing',
    siteName: 'SSemtle',
    locale: 'ko_KR',
    type: 'website',
    images: [
      {
        url: 'https://ssemtle.com/logos/Ssemtle_logo.png',
        width: 1200,
        height: 630,
        alt: 'SSemtle 로고 - 기초학력 학습 플랫폼',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SSemtle - 기초학력의 수학',
    description:
      '기초학력 향상을 위한 AI 기반 학습 플랫폼. 개인 맞춤형 수학 학습으로 학생들의 기초 실력을 체계적으로 향상시킵니다.',
    images: ['https://ssemtle.com/logos/Ssemtle_logo.png'],
    creator: '@ssemtle',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const sections = [
  { id: 'hero', label: '홈', icon: '🏠' },
  { id: 'features', label: '기능', icon: '⭐' },
  { id: 'about', label: '소개', icon: 'ℹ️' },
  { id: 'contact', label: '연락처', icon: '📞' },
];

export default function LandingLogoPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'SSemtle',
    description: '기초학력 향상을 위한 AI 기반 학습 플랫폼',
    url: 'https://ssemtle.com',
    logo: 'https://ssemtle.com/logos/Ssemtle_logo.png',
    sameAs: ['https://ssemtle.com/landing'],
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
        id="features"
        className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100"
        style={{ scrollSnapAlign: 'start' }}
      >
        <div className="max-w-4xl px-8 text-center">
          <h2 className="mb-6 text-4xl font-bold text-gray-800">주요 기능</h2>
          <p className="mb-8 text-xl text-gray-700">
            AI 기반 개인 맞춤형 수학 학습
          </p>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-lg bg-white/80 p-6 shadow-md">
              <h3 className="mb-2 text-lg font-semibold text-gray-800">
                🎯 맞춤형 학습
              </h3>
              <p className="text-gray-600">
                학생별 수준에 맞는 개인화된 문제 제공
              </p>
            </div>
            <div className="rounded-lg bg-white/80 p-6 shadow-md">
              <h3 className="mb-2 text-lg font-semibold text-gray-800">
                📊 실시간 분석
              </h3>
              <p className="text-gray-600">학습 진도와 취약점 실시간 분석</p>
            </div>
            <div className="rounded-lg bg-white/80 p-6 shadow-md">
              <h3 className="mb-2 text-lg font-semibold text-gray-800">
                🤖 AI 도우미
              </h3>
              <p className="text-gray-600">
                AI가 제공하는 스마트한 학습 가이드
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="about"
        className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100"
        style={{ scrollSnapAlign: 'start' }}
      >
        <div className="max-w-4xl px-8 text-center">
          <h2 className="mb-6 text-4xl font-bold text-gray-800">
            SSemtle 소개
          </h2>
          <p className="mb-8 text-xl text-gray-700">
            기초학력 향상을 위한 혁신적인 플랫폼
          </p>
          <div className="rounded-lg bg-white/80 p-8 text-left shadow-md">
            <h3 className="mb-4 text-2xl font-semibold text-gray-800">
              왜 SSemtle인가요?
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="mr-2 text-green-500">✓</span>
                <span>
                  <strong>체계적인 기초학력 관리:</strong> 학생의 기초 실력을
                  정확히 진단하고 단계별로 향상시킵니다
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-green-500">✓</span>
                <span>
                  <strong>AI 기반 개인화 학습:</strong> 각 학생의 학습 패턴을
                  분석하여 최적화된 학습 경로를 제공합니다
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-green-500">✓</span>
                <span>
                  <strong>교사-학생 연결:</strong> 교사와 학생이 함께 성장할 수
                  있는 통합 플랫폼입니다
                </span>
              </li>
            </ul>
          </div>
        </div>
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
