// @vitest-environment node
import { readFileSync, readdirSync } from 'node:fs';
import Database from 'better-sqlite3';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { totpFromUri } from '../helpers/totp';
import { getAuth } from '@/lib/auth/config';

let database: Database.Database;
let auth: ReturnType<typeof getAuth>;
const origin = 'http://localhost:3000';
const credentials = {
  email: 'owner@example.test',
  password: 'long-test-password-123',
  name: 'Owner',
};

/** Calls the real Better Auth HTTP handler against an isolated SQLite schema. */
function post(path: string, body: object, cookie = '') {
  return auth.handler(
    new Request(`${origin}/api/auth/${path}`, {
      method: 'POST',
      headers: { origin, 'content-type': 'application/json', cookie },
      body: JSON.stringify(body),
    }),
  );
}

beforeEach(() => {
  vi.stubEnv('BETTER_AUTH_URL', origin);
  database = new Database(':memory:');
  for (const file of readdirSync('migrations')
    .filter((name) => name.endsWith('.sql'))
    .sort()) {
    database.exec(readFileSync(`migrations/${file}`, 'utf8'));
  }
  auth = getAuth(
    database,
    async () => !database.prepare('SELECT id FROM owner_registration').get(),
  );
});
afterEach(() => {
  database.close();
  vi.unstubAllEnvs();
});

describe('single-owner Better Auth with SQLite', () => {
  it('accepts exactly one of two racing first registrations', async () => {
    const results = await Promise.all([
      post('sign-up/email', credentials),
      post('sign-up/email', { ...credentials, email: 'other@example.test' }),
    ]);
    expect(results.filter((result) => result.ok)).toHaveLength(1);
    expect(database.prepare('SELECT COUNT(*) AS n FROM user').get()).toEqual({
      n: 1,
    });
    expect(database.prepare('SELECT COUNT(*) AS n FROM account').get()).toEqual(
      { n: 1 },
    );
  });

  it('keeps registration closed after deleting the owner and bypassing the UI', async () => {
    expect((await post('sign-up/email', credentials)).ok).toBe(true);
    database.exec('DELETE FROM user');
    expect(
      (
        await post('sign-up/email', {
          ...credentials,
          email: 'second@example.test',
        })
      ).status,
    ).toBe(403);
    expect(() =>
      database
        .prepare(
          'INSERT INTO user (id, name, email, updatedAt) VALUES (?, ?, ?, ?)',
        )
        .run(
          'second',
          'Second',
          'second@example.test',
          new Date().toISOString(),
        ),
    ).toThrow('Registration is closed');
  });

  it('uses revocable database sessions and rejects wrong passwords', async () => {
    expect((await post('sign-up/email', credentials)).ok).toBe(true);
    expect(
      (await post('sign-in/email', { ...credentials, password: 'wrong' }))
        .status,
    ).toBe(401);
    const response = await post('sign-in/email', credentials);
    const cookie = response.headers.get('set-cookie')!.split(';')[0];
    expect(cookie).toContain('better-auth.session_token=');
    const headers = new Headers({ cookie });
    expect(await auth.api.getSession({ headers })).toHaveProperty(
      'user.email',
      credentials.email,
    );
    expect((await post('sign-out', {}, cookie)).ok).toBe(true);
    expect(await auth.api.getSession({ headers })).toBeNull();
  });
});

/** Applies all Set-Cookie updates to a local HTTP-handler test cookie jar. */
function updatedCookies(response: Response, previous = ''): string {
  const cookies = new Map(
    previous
      .split('; ')
      .filter(Boolean)
      .map((value) => {
        const index = value.indexOf('=');
        return [value.slice(0, index), value.slice(index + 1)];
      }),
  );
  for (const value of response.headers.getSetCookie()) {
    const pair = value.split(';')[0];
    const index = pair.indexOf('=');
    if (/Max-Age=0/i.test(value)) cookies.delete(pair.slice(0, index));
    else cookies.set(pair.slice(0, index), pair.slice(index + 1));
  }
  return [...cookies].map(([key, value]) => `${key}=${value}`).join('; ');
}

/** Enrolls a fresh local account and returns its password-authenticated cookie and pending setup. */
async function enrollment() {
  const registration = await post('sign-up/email', credentials);
  const cookie = updatedCookies(registration);
  const response = await post(
    'two-factor/enable',
    { password: credentials.password, method: 'totp' },
    cookie,
  );
  expect(response.ok).toBe(true);
  return {
    cookie,
    setup: (await response.json()) as {
      totpURI: string;
      backupCodes: string[];
    },
  };
}

describe('optional authenticator protection', () => {
  it('keeps 2FA disabled until the authenticator proves possession and encrypts recovery material', async () => {
    const { cookie, setup } = await enrollment();
    expect(
      database.prepare('SELECT twoFactorEnabled AS enabled FROM user').get(),
    ).toEqual({ enabled: 0 });
    expect(setup.backupCodes).toHaveLength(10);
    const row = database
      .prepare('SELECT secret, backupCodes FROM twoFactor')
      .get() as { secret: string; backupCodes: string };
    expect(row.secret).not.toContain(
      new URL(setup.totpURI).searchParams.get('secret'),
    );
    expect(row.backupCodes).not.toContain(setup.backupCodes[0]);
    expect(
      (await post('two-factor/verify-totp', { code: 'not-a-code' }, cookie)).ok,
    ).toBe(false);
    expect(
      database.prepare('SELECT twoFactorEnabled AS enabled FROM user').get(),
    ).toEqual({ enabled: 0 });
    expect(
      (
        await post(
          'two-factor/verify-totp',
          { code: totpFromUri(setup.totpURI) },
          cookie,
        )
      ).ok,
    ).toBe(true);
    expect(
      database.prepare('SELECT twoFactorEnabled AS enabled FROM user').get(),
    ).toEqual({ enabled: 1 });
  });

  it('withholds the session until TOTP verification and requires a password to disable protection', async () => {
    const { cookie, setup } = await enrollment();
    const activation = await post(
      'two-factor/verify-totp',
      { code: totpFromUri(setup.totpURI) },
      cookie,
    );
    const session = updatedCookies(activation, cookie);
    expect(
      (await post('two-factor/disable', { password: 'wrong' }, session)).ok,
    ).toBe(false);
    const challenge = await post('sign-in/email', credentials);
    expect(await challenge.json()).toHaveProperty('twoFactorRedirect', true);
    const pending = updatedCookies(challenge);
    expect(
      await auth.api.getSession({ headers: new Headers({ cookie: pending }) }),
    ).toBeNull();
    const verified = await post(
      'two-factor/verify-totp',
      { code: totpFromUri(setup.totpURI) },
      pending,
    );
    expect(verified.ok).toBe(true);
    const signedIn = updatedCookies(verified, pending);
    expect(
      await auth.api.getSession({ headers: new Headers({ cookie: signedIn }) }),
    ).toHaveProperty('user.email', credentials.email);
    expect(
      (
        await post(
          'two-factor/disable',
          { password: credentials.password },
          signedIn,
        )
      ).ok,
    ).toBe(true);
    expect(
      await (await post('sign-in/email', credentials)).json(),
    ).not.toHaveProperty('twoFactorRedirect');
  });

  it('consumes a recovery code once and rejects its reuse on a later pending sign-in', async () => {
    const { cookie, setup } = await enrollment();
    await post(
      'two-factor/verify-totp',
      { code: totpFromUri(setup.totpURI) },
      cookie,
    );
    const pending = updatedCookies(await post('sign-in/email', credentials));
    const recovered = await post(
      'two-factor/verify-backup-code',
      { code: setup.backupCodes[0] },
      pending,
    );
    expect(recovered.ok).toBe(true);
    const next = updatedCookies(await post('sign-in/email', credentials));
    expect(
      (
        await post(
          'two-factor/verify-backup-code',
          { code: setup.backupCodes[0] },
          next,
        )
      ).ok,
    ).toBe(false);
    expect(
      await auth.api.getSession({ headers: new Headers({ cookie: next }) }),
    ).toBeNull();
  });

  it('issues a 30-day browser cookie for ordinary password sign-in', async () => {
    const response = await post('sign-up/email', credentials);
    expect(response.headers.get('set-cookie')).toMatch(/Max-Age=2592000/i);
  });
});
