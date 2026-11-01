import { test, expect } from '@playwright/test';
import {
  authenticateTestUser,
  loginTestUser,
  testCredentials,
} from './auth-helper';
import { oauthTokens, resource } from './oauth-helper';
const origin = 'http://localhost:3000';

test('MCP challenges advertise discoverable OAuth authorization and PKCE', async ({
  request,
}) => {
  const response = await request.post(resource, { data: {} });
  expect(response.status()).toBe(401);
  expect(response.headers()['www-authenticate']).toContain(
    'resource_metadata=',
  );
  const metadata = await (
    await request.get(
      `${origin}/.well-known/oauth-protected-resource/api/mcp/mcp`,
    )
  ).json();
  expect(metadata.resource).toBe(resource);
  const server = await (
    await request.get(
      `${origin}/.well-known/oauth-authorization-server/api/auth`,
    )
  ).json();
  expect(server.issuer).toBe(`${origin}/api/auth`);
  expect(server.code_challenge_methods_supported).toEqual(['S256']);
  expect(server.registration_endpoint).toBe(
    `${origin}/api/auth/oauth2/register`,
  );
});

test('requires explicit browser consent before the assistant gets portfolio access', async ({
  page,
}) => {
  await authenticateTestUser(page);
  await page.route('http://127.0.0.1:34567/callback**', (route) =>
    route.fulfill({ body: 'Authorized' }),
  );
  const tokens = await oauthTokens(
    page.context().request,
    'assets:rw offline_access',
    async (url) => {
      await page.goto(url);
      await expect(
        page.getByText('E2E Assistant', { exact: true }),
      ).toBeVisible();
      await Promise.all([
        page.waitForURL('http://127.0.0.1:34567/callback**'),
        page.getByRole('button', { name: 'Allow access' }).click(),
      ]);
      return page.url();
    },
  );
  expect(tokens.access_token).toBeTruthy();
  expect(tokens.refresh_token).toBeTruthy();
});

test('refreshes an OAuth grant and rejects reuse of the consumed authorization code', async ({
  request,
}) => {
  await loginTestUser(request);
  const tokens = await oauthTokens(request);
  const refreshed = await request.post(`${origin}/api/auth/oauth2/token`, {
    headers: { origin },
    form: {
      grant_type: 'refresh_token',
      refresh_token: tokens.refresh_token,
      client_id: tokens.clientId,
      resource,
    },
  });
  expect(refreshed.ok()).toBe(true);
  expect((await refreshed.json()).access_token).toBeTruthy();
  const replay = await request.post(`${origin}/api/auth/oauth2/token`, {
    headers: { origin },
    form: {
      grant_type: 'authorization_code',
      client_id: tokens.clientId,
      code: tokens.code,
      code_verifier: tokens.verifier,
      redirect_uri: 'http://127.0.0.1:34567/callback',
      resource,
    },
  });
  expect(replay.status()).toBe(400);
});

test('rejects valid tokens that lack portfolio permission', async ({
  request,
}) => {
  await loginTestUser(request);
  const tokens = await oauthTokens(request, 'openid profile');
  const response = await request.post(resource, {
    data: {},
    headers: { authorization: `Bearer ${tokens.access_token}` },
  });
  expect(response.status()).toBe(403);
  expect(response.headers()['www-authenticate']).toContain(
    'insufficient_scope',
  );
});

test('resumes an assistant authorization through email sign-in and browser consent', async ({
  page,
}) => {
  await page.route('http://127.0.0.1:34567/callback**', (route) =>
    route.fulfill({ body: 'Authorized' }),
  );
  const tokens = await oauthTokens(
    page.context().request,
    'assets:rw offline_access',
    async (url) => {
      await page.goto(url);
      await expect(
        page.getByText('E2E Assistant', { exact: true }),
      ).toBeVisible();
      await Promise.all([
        page.waitForURL('http://127.0.0.1:34567/callback**'),
        page.getByRole('button', { name: 'Allow access' }).click(),
      ]);
      return page.url();
    },
    async (url) => {
      await page.goto(url);
      await page
        .getByLabel('Email', { exact: true })
        .fill(testCredentials.email);
      await page
        .getByLabel('Password', { exact: true })
        .fill(testCredentials.password);
      await Promise.all([
        page.waitForURL((url) => url.pathname === '/consent'),
        page.getByRole('button', { name: 'Sign in', exact: true }).click(),
      ]);
      return page.url();
    },
  );
  expect(tokens.access_token).toBeTruthy();
});
