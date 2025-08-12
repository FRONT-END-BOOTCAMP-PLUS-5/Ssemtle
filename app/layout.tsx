import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/libs/providers';

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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
