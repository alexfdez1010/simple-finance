import { test, expect, type Page } from '@playwright/test';
import {
  authenticateTestUser,
  clearTestSession,
  testCredentials,
} from './auth-helper';
import { oauthTokens } from './oauth-helper';
import { totpFromUri } from '../helpers/totp';

const origin = 'http://localhost:3000';

/** Starts a fresh browser sign-in and confirms that password-only access is still blocked. */
async function signInChallenge(page: Page) {
  await page.goto(`${origin}/auth?redirectTo=%2Fdashboard%2Fsecurity`);
  await page.getByLabel('Email', { exact: true }).fill(testCredentials.email);
  await page
    .getByLabel('Password', { exact: true })
    .fill(testCredentials.password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(/\/auth\/two-factor/);
  expect(
    (await page.context().request.get(`${origin}/api/backup`)).status(),
  ).toBe(401);
}

test('optionally enrolls an authenticator, gates web and OAuth login, recovers once and disables with a password', async ({
  page,
  browser,
}) => {
  test.setTimeout(60000);
  await authenticateTestUser(page);
  try {
    await page.goto(`${origin}/dashboard/security`);
    await expect(page.getByText('Not enabled', { exact: true })).toBeVisible();
    await page.getByLabel('Password', { exact: true }).fill('wrong-password');
    await page.getByRole('button', { name: 'Set up authenticator' }).click();
    await expect(
      page.getByText(
        'Could not start setup. Check your password and try again.',
      ),
    ).toBeVisible();
    await page
      .getByLabel('Password', { exact: true })
      .fill(testCredentials.password);
    await page.getByRole('button', { name: 'Set up authenticator' }).click();
    await expect(
      page.getByRole('button', { name: 'Activate 2FA' }),
    ).toBeVisible();
    const pending = await page
      .context()
      .request.post(`${origin}/api/auth/two-factor/get-totp-uri`, {
        data: { password: testCredentials.password },
        headers: { origin },
      });
    expect(pending.ok()).toBe(true);
    const { totpURI } = await pending.json();
    const before = await (
      await page.context().request.get(`${origin}/api/auth/get-session`)
    ).json();
    expect(before.user.twoFactorEnabled).toBe(false);
    for (const width of [1440, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: `/tmp/simple-finance-2fa-setup-${width}.png`,
        fullPage: true,
      });
    }
    await page
      .getByLabel('Authentication code', { exact: true })
      .fill(totpFromUri(totpURI));
    await page.getByRole('button', { name: 'Activate 2FA' }).click();
    await expect(
      page.getByRole('heading', { name: 'Save your recovery codes' }),
    ).toBeVisible();
    let codes = await page
      .getByRole('region', { name: 'Recovery codes' })
      .getByRole('listitem')
      .allTextContents();
    expect(codes).toHaveLength(10);
    const download = page.waitForEvent('download');
    await page.getByRole('link', { name: 'Download recovery codes' }).click();
    expect((await download).suggestedFilename()).toBe(
      'simple-finance-recovery-codes.txt',
    );
    await page.getByRole('button', { name: 'I saved these codes' }).click();
    await expect(page.getByText('Enabled', { exact: true })).toBeVisible();
    await page
      .getByLabel('Password', { exact: true })
      .fill(testCredentials.password);
    await page.getByRole('button', { name: 'Generate recovery codes' }).click();
    await expect(
      page.getByRole('heading', { name: 'Save your recovery codes' }),
    ).toBeVisible();
    const replacementCodes = await page
      .getByRole('region', { name: 'Recovery codes' })
      .getByRole('listitem')
      .allTextContents();
    expect(replacementCodes).not.toEqual(codes);
    codes = replacementCodes;
    await page.getByRole('button', { name: 'I saved these codes' }).click();

    const loginContext = await browser.newContext({
      extraHTTPHeaders: { 'cf-connecting-ip': '192.0.2.101' },
    });
    try {
      const login = await loginContext.newPage();
      await signInChallenge(login);
      await login
        .getByLabel('Authentication code', { exact: true })
        .fill(totpFromUri(totpURI));
      await login.getByRole('button', { name: 'Verify', exact: true }).click();
      await expect(login).toHaveURL(`${origin}/dashboard/security`);
      await login.reload();
      await expect(
        login.getByRole('heading', { name: 'Account security' }),
      ).toBeVisible();
    } finally {
      await loginContext.close();
    }

    for (const reused of [false, true]) {
      const recoveryContext = await browser.newContext({
        extraHTTPHeaders: {
          'cf-connecting-ip': reused ? '192.0.2.102' : '192.0.2.103',
        },
      });
      try {
        const recovery = await recoveryContext.newPage();
        await signInChallenge(recovery);
        await recovery
          .getByRole('button', { name: 'Use a recovery code' })
          .click();
        await recovery
          .getByLabel('Recovery code', { exact: true })
          .fill(codes[0]);
        await recovery
          .getByRole('button', { name: 'Verify', exact: true })
          .click();
        if (reused) {
          await expect(
            recovery.getByText('Invalid or expired code. Try again.'),
          ).toBeVisible();
          expect(
            (
              await recoveryContext.request.get(`${origin}/api/backup`)
            ).status(),
          ).toBe(401);
        } else await expect(recovery).toHaveURL(`${origin}/dashboard/security`);
      } finally {
        await recoveryContext.close();
      }
    }

    const oauthContext = await browser.newContext({
      extraHTTPHeaders: { 'cf-connecting-ip': '192.0.2.104' },
    });
    try {
      const oauthPage = await oauthContext.newPage();
      await oauthPage.route('http://127.0.0.1:34567/callback**', (route) =>
        route.fulfill({ body: 'Authorized' }),
      );
      const tokens = await oauthTokens(
        oauthContext.request,
        'assets:rw offline_access',
        async (url) => {
          await oauthPage.goto(url);
          await Promise.all([
            oauthPage.waitForURL('http://127.0.0.1:34567/callback**'),
            oauthPage.getByRole('button', { name: 'Allow access' }).click(),
          ]);
          return oauthPage.url();
        },
        async (url) => {
          await oauthPage.goto(url);
          await oauthPage
            .getByLabel('Email', { exact: true })
            .fill(testCredentials.email);
          await oauthPage
            .getByLabel('Password', { exact: true })
            .fill(testCredentials.password);
          await oauthPage
            .getByRole('button', { name: 'Sign in', exact: true })
            .click();
          await expect(oauthPage).toHaveURL(/\/auth\/two-factor/);
          expect(
            (await oauthContext.request.get(`${origin}/api/backup`)).status(),
          ).toBe(401);
          await oauthPage
            .getByLabel('Authentication code', { exact: true })
            .fill(totpFromUri(totpURI));
          await Promise.all([
            oauthPage.waitForURL((url) => url.pathname === '/consent'),
            oauthPage
              .getByRole('button', { name: 'Verify', exact: true })
              .click(),
          ]);
          return oauthPage.url();
        },
      );
      expect(tokens.access_token).toBeTruthy();
    } finally {
      await oauthContext.close();
    }

    await page
      .getByLabel('Password', { exact: true })
      .fill(testCredentials.password);
    await page.getByRole('button', { name: 'Disable 2FA' }).click();
    await expect(page.getByText('Not enabled', { exact: true })).toBeVisible();
  } finally {
    await page.context().request.post(`${origin}/api/auth/two-factor/disable`, {
      data: { password: testCredentials.password },
      headers: { origin },
    });
    clearTestSession();
  }
});
