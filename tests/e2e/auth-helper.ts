/**
 * Helper functions for authentication in E2E tests.
 * @module tests/e2e/auth-helper
 */

import { createHash } from 'node:crypto';
import { Page } from '@playwright/test';

const PASSWORD = process.env.PASSWORD ?? '12345678';
const AUTH_COOKIE_NAME = 'simple-finance-auth';

/**
 * Sets the auth cookie directly so tests skip the UI login flow.
 * The cookie value is sha256(PASSWORD) — same shape as
 * `generateAuthToken` in src/lib/auth/auth-utils.ts.
 *
 * @param page - Playwright page object
 */
export async function authenticateTestUser(page: Page): Promise<void> {
  const token = createHash('sha256').update(PASSWORD).digest('hex');
  await page.context().addCookies([
    {
      name: AUTH_COOKIE_NAME,
      value: token,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
    },
  ]);
}
