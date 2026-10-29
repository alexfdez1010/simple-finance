import type { Metadata, Viewport } from 'next';
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
  title: 'Simple Finance',
  description: 'A private view of your portfolio and its performance.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f5f5f7',
};

/** Renders the font and authentication boundaries; request paths preserve post-login destinations. */
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
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
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
