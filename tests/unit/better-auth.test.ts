// @vitest-environment node
import { readFileSync, readdirSync } from 'node:fs';
import Database from 'better-sqlite3';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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
