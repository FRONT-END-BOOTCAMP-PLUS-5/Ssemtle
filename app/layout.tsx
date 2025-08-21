import type { Metadata, Viewport } from 'next';
import './globals.css';
import Providers from '@/libs/providers';
import RoleBasedSidebar from './_components/sidebar/RoleBasedSidebar';
import LayoutClient from './_components/layoutclient/LayoutClient';

export const metadata: Metadata = {
  title: 'Ssemtle',
  description: 'Ssemtle web service',
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        {/* Header + isOpen 상태 관리 */}

        <LayoutClient>
          <div
            className="flex w-full"
            style={{ height: 'calc(100vh - var(--header-h, 0px))' }}
          >
            {/* 모바일 전용(≤430px): 기본 hidden → isOpen일 때 hidden 제거 */}
            <div
              id="mobile-sidebar"
              className="fixed inset-y-0 left-0 z-[60] hidden overflow-y-auto bg-[var(--color-sidebar,_#fff)] shadow-xl min-[431px]:hidden"
            >
              <RoleBasedSidebar />
            </div>
            {/* 데스크톱 전용(≥431px): 항상 보임 */ []}
            <div className="hidden min-[431px]:block">
              <RoleBasedSidebar />
            </div>
            {/* 메인 콘텐츠 영역 */}
            <Providers>{children}</Providers>
          </div>
        </LayoutClient>

        {/* (선택) 모바일 오버레이: 기본 hidden → isOpen일 때 hidden 제거 */}
        <div
          id="mobile-overlay"
          className="fixed inset-0 z-[55] hidden bg-black/40 min-[431px]:hidden"
          aria-hidden="true"
        />
      </body>
    </html>
  );
}
