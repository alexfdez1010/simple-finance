import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth/auth-utils';

/**
 * Server component that guards routes requiring authentication.
 * Redirects to /auth page if user is not authenticated.
 *
 * @param children - The protected content to render
 * @param currentPath - The current path for redirect after authentication
 */
export async function AuthGuard({
  children,
  currentPath,
}: {
  children: React.ReactNode;
  currentPath: string;
}) {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    // Redirect to auth page with return URL
    const redirectUrl = `/auth?redirectTo=${encodeURIComponent(currentPath)}`;
    redirect(redirectUrl);
  }

  return <>{children}</>;
}
