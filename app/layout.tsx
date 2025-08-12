import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/libs/providers';
import Header from './_components/header/Header';

export const metadata: Metadata = {
  title: 'Ssemtle',
  description: 'Ssemtle web service',
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
