/**
 * E2E tests for authentication functionality
 * Tests password protection, login flow, and cookie persistence
 * @module tests/e2e/auth
 */

import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ context }) => {
    // Clear cookies before each test to ensure clean state
    await context.clearCookies();
  });

  test('should redirect unauthenticated user to auth page', async ({
    page,
  }) => {
    // Try to access dashboard without authentication
    await page.goto('http://localhost:3000/dashboard');

    // Should be redirected to auth page with redirectTo parameter
    await expect(page).toHaveURL(/\/auth\?redirectTo=%2Fdashboard/);

    // Verify auth page elements are visible
    await expect(
      page.getByRole('heading', { name: 'Simple Finance' }),
    ).toBeVisible();
    await expect(page.getByText('Enter password to continue')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
  });

  test('should show error for invalid password', async ({ page }) => {
    await page.goto('http://localhost:3000/auth');

    // Enter wrong password
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Continue' }).click();

    // Should show error message
    await expect(page.getByText('Invalid password')).toBeVisible();

    // Should still be on auth page
    await expect(page).toHaveURL(/\/auth/);
  });

  test('should show error for empty password', async ({ page }) => {
    await page.goto('http://localhost:3000/auth');

    // Try to submit without entering password
    await page.getByRole('button', { name: 'Continue' }).click();

    // HTML5 validation should prevent submission
    const passwordInput = page.getByLabel('Password');
    const validationMessage = await passwordInput.evaluate(
      (el: HTMLInputElement) => el.validationMessage,
    );
    expect(validationMessage).toBeTruthy();
  });

  test('should authenticate with correct password and redirect', async ({
    page,
  }) => {
    // Go to auth page with redirectTo parameter
    await page.goto('http://localhost:3000/auth?redirectTo=%2Fdashboard');

    // Enter correct password (from .env: PASSWORD="12345678")
    await page.getByLabel('Password').fill('12345678');
    await page.getByRole('button', { name: 'Continue' }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL('http://localhost:3000/dashboard');

    // Verify dashboard content is visible
    await expect(
      page.getByRole('heading', { name: 'Portfolio Overview' }),
    ).toBeVisible();
  });

  test('should authenticate and redirect to root if no redirectTo', async ({
    page,
  }) => {
    await page.goto('http://localhost:3000/auth');

    // Enter correct password
    await page.getByLabel('Password').fill('12345678');
    await page.getByRole('button', { name: 'Continue' }).click();

    // Should redirect to dashboard (default)
    await expect(page).toHaveURL('http://localhost:3000/dashboard');
  });

  test('should persist authentication across page navigations', async ({
    page,
  }) => {
    // Authenticate first
    await page.goto('http://localhost:3000/auth');
    await page.getByLabel('Password').fill('12345678');
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page).toHaveURL('http://localhost:3000/dashboard');

    // Navigate to add product page
    await page.goto('http://localhost:3000/products/add');

    // Should NOT be redirected to auth page
    await expect(page).toHaveURL('http://localhost:3000/products/add');
    await expect(
      page.getByRole('heading', { name: 'Add Yahoo Finance Product' }),
    ).toBeVisible();

    // Navigate to add custom product page
    await page.goto('http://localhost:3000/products/add-custom');

    // Should still be authenticated
    await expect(page).toHaveURL('http://localhost:3000/products/add-custom');
    await expect(
      page.getByRole('heading', { name: 'Add Custom Product' }),
    ).toBeVisible();
  });

  test('should maintain authentication after page reload', async ({ page }) => {
    // Authenticate
    await page.goto('http://localhost:3000/auth');
    await page.getByLabel('Password').fill('12345678');
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page).toHaveURL('http://localhost:3000/dashboard');

    // Reload the page
    await page.reload();

    // Should still be on dashboard, not redirected to auth
    await expect(page).toHaveURL('http://localhost:3000/dashboard');
    await expect(
      page.getByRole('heading', { name: 'Portfolio Overview' }),
    ).toBeVisible();
  });

  test('should protect all routes except auth page', async ({ page }) => {
    const protectedRoutes = [
      'http://localhost:3000/',
      'http://localhost:3000/dashboard',
      'http://localhost:3000/products/add',
      'http://localhost:3000/products/add-custom',
    ];

    for (const route of protectedRoutes) {
      await page.goto(route);

      // Should be redirected to auth page
      await expect(page).toHaveURL(/\/auth\?redirectTo=/);
    }
  });

  test('should allow direct access to auth page', async ({ page }) => {
    // Auth page should be accessible without authentication
    await page.goto('http://localhost:3000/auth');

    // Should stay on auth page
    await expect(page).toHaveURL('http://localhost:3000/auth');
    await expect(page.getByLabel('Password')).toBeVisible();
  });

  test('should have proper cookie attributes after authentication', async ({
    page,
    context,
  }) => {
    // Authenticate
    await page.goto('http://localhost:3000/auth');
    await page.getByLabel('Password').fill('12345678');
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page).toHaveURL('http://localhost:3000/dashboard');

    // Get cookies
    const cookies = await context.cookies();
    const authCookie = cookies.find((c) => c.name === 'simple-finance-auth');

    // Verify auth cookie exists and has proper attributes
    expect(authCookie).toBeDefined();
    expect(authCookie?.httpOnly).toBe(true);
    expect(authCookie?.sameSite).toBe('Lax');
    expect(authCookie?.path).toBe('/');
    // Value should be a SHA-256 hash (64 hex characters)
    expect(authCookie?.value).toMatch(/^[a-f0-9]{64}$/);
  });
});
