/**
 * Bearer token validation for the MCP HTTP route.
 * Token is derived from PASSWORD via SHA-256 to match the browser session.
 * @module lib/mcp/auth
 */

import 'server-only';
import crypto from 'crypto';
import { generateAuthToken } from '@/lib/auth/auth-utils';

/**
 * Returns the bearer token expected by the MCP route.
 * Equivalent to the cookie token, so no extra storage is required.
 */
export function expectedMcpToken(): string {
  const password = process.env.PASSWORD;
  if (!password) {
    throw new Error('PASSWORD environment variable is not set');
  }
  return generateAuthToken(password);
}

/**
 * Constant-time check that a bearer token matches the expected one.
 *
 * @param token - Token from the Authorization header
 * @returns True if the token matches the expected one
 */
export function isValidMcpToken(token: string | undefined): boolean {
  if (!token) return false;
  let expected: string;
  try {
    expected = expectedMcpToken();
  } catch {
    return false;
  }
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
