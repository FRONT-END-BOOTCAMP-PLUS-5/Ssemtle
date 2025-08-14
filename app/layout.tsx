import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/libs/providers';
import Header from './_components/header/Header';
import RoleBasedSidebar from './_components/sidebar/RoleBasedSidebar';
import RoleDebugger from './_components/debug/RoleDebugger';

export const metadata: Metadata = {
  title: 'Ssemtle',
  description: 'Ssemtle web service',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <Header logoSrc="/logos/Ssemtle_logo.png" logoHref="/" />
        <div
          className="flex w-full"
          style={{ height: 'calc(100vh - var(--header-h, 0px))' }}
        >
          {/* 역할에 따른 사이드바 */}
          <RoleBasedSidebar />
          <Providers>
            {/* 세션 컨텍스트 내부에서 콘솔 디버깅 */}
            <RoleDebugger />
            {children}
          </Providers>
        </div>
      </body>
    </html>
  );
}
