import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET, POST } from '@/app/api/backup/route';
import { isAuthenticated } from '@/lib/auth/auth-utils';
import {
  exportBackup,
  restoreBackup,
} from '@/lib/infrastructure/database/backup-repository';
import { revalidatePath } from 'next/cache';
import { financeBackupFixture } from '../fixtures/finance-backup';
import { MAX_BACKUP_BYTES } from '@/lib/backup/backup-schema';

vi.mock('@/lib/auth/auth-utils', () => ({ isAuthenticated: vi.fn() }));
vi.mock('@/lib/infrastructure/database/backup-repository', () => ({
  exportBackup: vi.fn(),
  restoreBackup: vi.fn(),
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

/** Builds a same-origin JSON replacement request, with optional malformed body/headers. */
function request(
  body = JSON.stringify(financeBackupFixture()),
  headers: Record<string, string> = {},
) {
  return new Request('http://localhost/api/backup', {
    method: 'POST',
    headers: { origin: 'http://localhost', ...headers },
    body,
  });
}

describe('authenticated backup routes', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(isAuthenticated).mockResolvedValue(true);
    vi.mocked(exportBackup).mockResolvedValue(financeBackupFixture());
    vi.mocked(restoreBackup).mockResolvedValue(undefined);
  });

  it('denies both operations before database access when signed out', async () => {
    vi.mocked(isAuthenticated).mockResolvedValue(false);
    expect((await GET(new Request('http://localhost/api/backup'))).status).toBe(
      401,
    );
    expect((await POST(request())).status).toBe(401);
    expect(exportBackup).not.toHaveBeenCalled();
    expect(restoreBackup).not.toHaveBeenCalled();
  });

  it('downloads an uncached attachment preserving the selected currency', async () => {
    const response = await GET(
      new Request('http://localhost/api/backup?currency=USD'),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get('content-disposition')).toContain(
      'attachment;',
    );
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.json()).toEqual(financeBackupFixture());
    expect(exportBackup).toHaveBeenCalledWith('USD');
  });

  it('rejects unsupported display currencies', async () => {
    expect(
      (await GET(new Request('http://localhost/api/backup?currency=invalid')))
        .status,
    ).toBe(400);
    expect(exportBackup).not.toHaveBeenCalled();
  });

  it.each(['https://attacker.example', ''])(
    'rejects foreign or absent origin %s',
    async (origin) => {
      expect((await POST(request(undefined, { origin }))).status).toBe(403);
      expect(restoreBackup).not.toHaveBeenCalled();
    },
  );

  it.each([
    '{',
    '{}',
    JSON.stringify({ ...financeBackupFixture(), version: 2 }),
  ])('rejects malformed/incompatible files', async (body) => {
    expect((await POST(request(body))).status).toBe(400);
    expect(restoreBackup).not.toHaveBeenCalled();
  });

  it('caps declared and streamed sizes before restoring', async () => {
    expect(
      (
        await POST(
          request('{}', { 'content-length': String(MAX_BACKUP_BYTES + 1) }),
        )
      ).status,
    ).toBe(400);
    expect((await POST(request(' '.repeat(MAX_BACKUP_BYTES + 1)))).status).toBe(
      400,
    );
    expect(restoreBackup).not.toHaveBeenCalled();
  });

  it('restores validated data and invalidates every dashboard route', async () => {
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(restoreBackup).toHaveBeenCalledWith(financeBackupFixture());
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard', 'layout');
    expect(await response.json()).toEqual({
      success: true,
      preferences: { displayCurrency: 'USD' },
    });
  });

  it('reports transactional failure without leaking internal errors or invalidating data', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.mocked(restoreBackup).mockRejectedValue(new Error('private DB detail'));
    const response = await POST(request());
    expect(response.status).toBe(500);
    expect(await response.text()).not.toContain('private DB detail');
    expect(revalidatePath).not.toHaveBeenCalled();
    log.mockRestore();
  });
});
