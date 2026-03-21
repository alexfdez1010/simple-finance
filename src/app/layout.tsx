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
  variable: '--font-serif',
  weight: '400',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Simple Finance - Portfolio Tracker',
  description: 'Track your financial products and portfolio performance',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f0eb' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a2e' },
  ],
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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} antialiased`}
      >
        {isAuthPage ? (
          children
        ) : (
          <AuthGuard currentPath={pathname}>{children}</AuthGuard>
        )}
      </body>
    </html>
  );
}
