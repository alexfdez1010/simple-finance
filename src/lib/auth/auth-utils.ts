import { cookies } from 'next/headers';
import crypto from 'crypto';

const AUTH_COOKIE_NAME = 'simple-finance-auth';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

/**
 * Generates a secure token from the password using SHA-256 hashing.
 *
 * @param password - The password to hash
 * @returns The hashed token as a hex string
 */
export function generateAuthToken(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * Verifies if the provided password matches the expected password from environment.
 *
 * @param password - The password to verify
 * @returns True if password is correct, false otherwise
 */
export function verifyPassword(password: string): boolean {
  const expectedPassword = process.env.PASSWORD;

  if (!expectedPassword) {
    console.error('PASSWORD environment variable is not set');
    return false;
  }

  return generateAuthToken(password) === generateAuthToken(expectedPassword);
}

/**
 * Sets the authentication cookie with the generated token.
 *
 * @param password - The password to generate token from
 */
export async function setAuthCookie(password: string): Promise<void> {
  const token = generateAuthToken(password);
  const cookieStore = await cookies();

  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
}

/**
 * Checks if the user is authenticated by validating the auth cookie.
 *
 * @returns True if user has valid auth token, false otherwise
 */
export async function isAuthenticated(): Promise<boolean> {
  const expectedPassword = process.env.PASSWORD;

  if (!expectedPassword) {
    console.error('PASSWORD environment variable is not set');
    return false;
  }

  const cookieStore = await cookies();
  const authCookie = cookieStore.get(AUTH_COOKIE_NAME);

  if (!authCookie) {
    return false;
  }

  const expectedToken = generateAuthToken(expectedPassword);
  return authCookie.value === expectedToken;
}

/**
 * Clears the authentication cookie (logout).
 */
export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}
