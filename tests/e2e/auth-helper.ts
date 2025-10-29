/**
 * Helper functions for authentication in E2E tests
 * @module tests/e2e/auth-helper
 */

import { Page } from '@playwright/test';

/**
 * Authenticates a test user by navigating to auth page and entering password.
 * This helper should be called in test setup to bypass authentication for tests
 * that don't specifically test auth functionality.
 *
 * @param page - Playwright page object
 */
export async function authenticateTestUser(page: Page): Promise<void> {
  await page.goto('http://localhost:3000/auth');
  await page.getByLabel('Password').fill('12345678');
  await page.getByRole('button', { name: 'Continue' }).click();

  // Wait for redirect to complete
  await page.waitForURL('http://localhost:3000/dashboard');
}
