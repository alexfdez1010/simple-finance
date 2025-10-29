import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
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

export const metadata: Metadata = {
  title: 'Simple Finance - Portfolio Tracker',
  description: 'Track your financial products and portfolio performance',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get current path from headers
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '/';

  // Don't protect the auth page itself
  const isAuthPage = pathname === '/auth';

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
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
