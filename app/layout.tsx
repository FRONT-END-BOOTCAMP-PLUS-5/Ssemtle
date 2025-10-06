import type { Viewport } from 'next';
import './globals.css';
import Providers from '@/libs/providers';
import RoleBasedSidebar from './_components/sidebar/RoleBasedSidebar';
import LayoutClient from './_components/layoutclient/LayoutClient';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MainContainer from '@/app/_components/layoutclient/MainContainer';
import { createMetadata, SITE_CONFIG } from '@/libs/metadata';

export const metadata = {
  ...createMetadata({}),
  icons: {
    icon: [{ url: SITE_CONFIG.favicon, type: 'image/png' }],
    shortcut: [SITE_CONFIG.favicon],
    apple: [{ url: SITE_CONFIG.favicon }],
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
