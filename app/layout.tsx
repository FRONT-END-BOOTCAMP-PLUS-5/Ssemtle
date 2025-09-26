import type { Metadata, Viewport } from 'next';
import './globals.css';
import Providers from '@/libs/providers';
import RoleBasedSidebar from './_components/sidebar/RoleBasedSidebar';
import LayoutClient from './_components/layoutclient/LayoutClient';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MainContainer from '@/app/_components/layoutclient/MainContainer';

export const metadata: Metadata = {
  title: 'Ssemtle',
  description: 'Ssemtle web service',
  icons: {
    icon: [{ url: '/ssemtle_favicon.png', type: 'image/png' }],
    shortcut: ['/ssemtle_favicon.png'],
    apple: [{ url: '/ssemtle_favicon.png' }],
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
