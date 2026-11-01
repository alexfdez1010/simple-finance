import { randomBytes } from 'node:crypto';
import type { Page, APIRequestContext, Cookie } from '@playwright/test';

export const testCredentials = {
  email: 'owner@example.test',
  password: 'test-password-12345678',
};

let cachedCookies: Cookie[] = [];

/** Uses the real session API and shared browser cookie jar instead of forging authentication. */
export async function authenticateTestUser(page: Page): Promise<void> {
  if (cachedCookies.length) {
    await page.context().addCookies(cachedCookies);
    return;
  }
  await loginTestUser(page.context().request);
  cachedCookies = await page.context().cookies();
}

/** Authenticates an isolated localhost test context and fails loudly if setup did not provision its owner. */
export async function loginTestUser(request: APIRequestContext): Promise<void> {
  const response = await request.post(
    'http://localhost:3000/api/auth/sign-in/email',
    {
      data: testCredentials,
      headers: {
        origin: 'http://localhost:3000',
        'cf-connecting-ip': Array.from(randomBytes(4)).join('.'),
      },
    },
  );
  if (!response.ok())
    throw new Error(
      `Test login failed: ${response.status()} ${await response.text()}`,
    );
}

/** Drops the local fixture cache when a test intentionally revokes that session. */
export function clearTestSession(): void {
  cachedCookies = [];
}
