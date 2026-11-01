import { test, expect } from '@playwright/test';
import {
  authenticateTestUser,
  testCredentials,
  clearTestSession,
} from './auth-helper';

const origin = 'http://localhost:3000';

test('redirects anonymous visitors and shows email sign-in after registration closes', async ({
  page,
}) => {
  await page.goto(`${origin}/dashboard`);
  await expect(page).toHaveURL(/\/auth\?redirectTo=/);
  await expect(page.getByLabel('Email', { exact: true })).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Sign in', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Create account' }),
  ).toHaveCount(0);
});

test('rejects a second registration through the API', async ({ request }) => {
  const response = await request.post(`${origin}/api/auth/sign-up/email`, {
    data: {
      name: 'Intruder',
      email: 'second@example.test',
      password: 'different-password-123',
    },
    headers: { origin },
  });
  expect(response.status()).toBe(403);
});

test('shows invalid credentials without granting access', async ({ page }) => {
  await page.goto(`${origin}/auth`);
  await page.getByLabel('Email', { exact: true }).fill(testCredentials.email);
  await page.getByLabel('Password', { exact: true }).fill('wrong-password');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(
    page.getByText('Invalid email or password', { exact: true }),
  ).toHaveText('Invalid email or password');
  await expect(page).toHaveURL(/\/auth/);
});

test('signs in with a real HttpOnly session and preserves it after reload', async ({
  page,
  context,
}) => {
  await page.goto(`${origin}/auth?redirectTo=%2Fdashboard%2Fskill`);
  await page.getByLabel('Email', { exact: true }).fill(testCredentials.email);
  await page
    .getByLabel('Password', { exact: true })
    .fill(testCredentials.password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(`${origin}/dashboard/skill`);
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Agent setup' }),
  ).toBeVisible();
  const cookie = (await context.cookies()).find((cookie) =>
    cookie.name.endsWith('session_token'),
  );
  expect(cookie?.httpOnly).toBe(true);
  expect(cookie?.sameSite).toBe('Lax');
  expect(cookie?.value).not.toMatch(/^[a-f0-9]{64}$/);
});

test('rejects forged legacy cookies and logout revokes the session', async ({
  page,
  context,
}) => {
  await context.addCookies([
    {
      name: 'simple-finance-auth',
      value: 'forged',
      domain: 'localhost',
      path: '/',
    },
  ]);
  await page.goto(`${origin}/dashboard`);
  await expect(page).toHaveURL(/\/auth/);
  await authenticateTestUser(page);
  await context.request.post(`${origin}/api/auth/sign-out`, {
    data: {},
    headers: { origin },
  });
  expect((await context.request.get(`${origin}/api/backup`)).status()).toBe(
    401,
  );
  clearTestSession();
});
