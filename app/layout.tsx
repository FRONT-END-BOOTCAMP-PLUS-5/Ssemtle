import type { Metadata, Viewport } from 'next';
import './globals.css';
import Providers from '@/libs/providers';
import Header from './_components/header/Header';
import SidebarUser from './_components/sidebar/SidebarUser';

export const metadata: Metadata = {
  title: 'Ssemtle',
  description: 'Ssemtle web service',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Header logoSrc="/logos/Ssemtle_logo.png" logoHref="/" />
        <div className="flex">
          {/* 차후 userID에 따라 다른 사이드바 렌더링 처리해야함 */}
          <SidebarUser />
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
