import type { Metadata, Viewport } from 'next';
import './globals.css';
import Providers from '@/libs/providers';
import RoleBasedSidebar from './_components/sidebar/RoleBasedSidebar';
import LayoutClient from './_components/layoutclient/LayoutClient';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MainContainer from '@/app/_components/layoutclient/MainContainer';

export const metadata: Metadata = {
  title: 'Ssemtle - 기초학력의 수학',
  description:
    '기초학력 향상을 위한 AI 기반 학습 플랫폼. 개인 맞춤형 수학 학습으로 학생들의 기초 실력을 체계적으로 향상시킵니다.',
  keywords:
    '기초학력, 수학, 학습, AI, 교육, 개인맞춤, 학습플랫폼, 초등수학, 중등수학',
  authors: [
    {
      name: 'SSemtle Team',
      url: 'https://github.com/FRONT-END-BOOTCAMP-PLUS-5/Ssemtle',
    },
  ],
  creator: 'Ssemtle',
  publisher: 'Ssemtle',
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
  icons: {
    icon: [{ url: '/favicon.ico' }],
    shortcut: ['/favicon.ico'],
    apple: [{ url: '/favicon.ico' }],
  },
  openGraph: {
    title: 'Ssemtle - 기초학력의 수학',
    description:
      '기초학력 향상을 위한 AI 기반 학습 플랫폼. 개인 맞춤형 수학 학습으로 학생들의 기초 실력을 체계적으로 향상시킵니다.',
    url: 'https://ssemtle.com',
    siteName: 'Ssemtle',
    locale: 'ko_KR',
    type: 'website',
    images: [
      {
        url: 'https://ssemtle.com/logos/Ssemtle_logo.png',
        width: 1200,
        height: 630,
        alt: 'Ssemtle 로고 - 기초학력 학습 플랫폼',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ssemtle - 기초학력의 수학',
    description:
      '기초학력 향상을 위한 AI 기반 학습 플랫폼. 개인 맞춤형 수학 학습으로 학생들의 기초 실력을 체계적으로 향상시킵니다.',
    images: ['https://ssemtle.com/logos/Ssemtle_logo.png'],
    creator: '@ssemtle',
  },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="flex min-h-screen flex-col">
        {/* Header + isOpen 상태 관리 */}
        <Providers>
          <LayoutClient>
            <div
              className="flex w-full"
              style={{ height: 'calc(100vh - var(--header-h, 0px))' }}
            >
              {/* 데스크톱 전용(≥1181px): 항상 보임 */}
              <aside
                className="sticky top-[var(--header-h,0px)] hidden self-start min-[1181px]:block"
                style={{ height: 'calc(100vh - var(--header-h, 0px))' }}
              >
                <RoleBasedSidebar />
              </aside>
              {/* 메인 콘텐츠 영역 */}
              <MainContainer>
                <ToastContainer
                  position="top-center"
                  autoClose={1500}
                  stacked
                  pauseOnHover={false}
                />
                {children}
              </MainContainer>
            </div>
          </LayoutClient>
        </Providers>
      </body>
    </html>
  );
}
