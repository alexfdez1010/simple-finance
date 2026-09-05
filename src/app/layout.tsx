import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Instrument_Serif } from 'next/font/google';
import { headers } from 'next/headers';
import { AuthGuard } from '@/components/auth/auth-guard';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const instrumentSerif = Instrument_Serif({
  variable: '--font-instrument-serif',
  weight: '400',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Simple Finance',
  description: 'A private view of your portfolio and its performance.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#edf2f8',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '/';
  const isAuthPage = pathname === '/auth';

  return (
    <html lang="en" data-theme="light">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} antialiased`}
      >
        {!isAuthPage && (
          <a className="skip-link" href="#main-content">
            Skip to content
          </a>
        )}
        {isAuthPage ? (
          children
        ) : (
          <AuthGuard currentPath={pathname}>{children}</AuthGuard>
        )}
      </body>
    </html>
  );
}
