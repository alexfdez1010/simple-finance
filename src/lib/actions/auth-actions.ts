'use server';

import { verifyPassword, setAuthCookie } from '@/lib/auth/auth-utils';
import { redirect } from 'next/navigation';

/**
 * Server action to verify password and set authentication cookie.
 *
 * @param password - The password to verify
 * @param redirectTo - Optional path to redirect to after successful authentication
 * @returns Object with success status and optional error message
 */
export async function authenticateWithPassword(
  password: string,
  redirectTo?: string,
): Promise<{ success: boolean; error?: string }> {
  if (!password || password.trim() === '') {
    return { success: false, error: 'Password is required' };
  }

  const isValid = verifyPassword(password);

  if (!isValid) {
    return { success: false, error: 'Invalid password' };
  }

  // Set the authentication cookie
  await setAuthCookie(password);

  // Redirect to the original page or dashboard
  redirect(redirectTo || '/dashboard');
}
