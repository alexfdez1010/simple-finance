import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useBackup } from '@/components/backup/use-backup';
import { financeBackupFixture } from '../fixtures/finance-backup';

const boundary = vi.hoisted(() => ({
  refresh: vi.fn(),
  setCurrency: vi.fn(),
  fetch: vi.fn(),
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: boundary.refresh }),
}));
vi.mock('@/components/dashboard/display-currency-context', () => ({
  useDisplayCurrency: () => ({
    currency: 'EUR',
    setCurrency: boundary.setCurrency,
  }),
}));

/** Models a chosen JSON file using the browser File interface without jsdom's missing text implementation. */
function file(text = JSON.stringify(financeBackupFixture())): File {
  return { size: text.length, text: async () => text } as File;
}

describe('backup interaction state', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubGlobal('fetch', boundary.fetch);
  });
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('previews and cancels without server writes or preference changes', async () => {
    const { result } = renderHook(useBackup);
    await act(() => result.current.choose(file()));
    expect(result.current.pending).toEqual(financeBackupFixture());
    act(() => result.current.cancel());
    expect(result.current.pending).toBeNull();
    expect(boundary.fetch).not.toHaveBeenCalled();
    expect(boundary.setCurrency).not.toHaveBeenCalled();
  });

  it('rejects invalid data before showing confirmation', async () => {
    const { result } = renderHook(useBackup);
    await act(() => result.current.choose(file('{}')));
    expect(result.current.error).toContain('complete Simple Finance backup');
    expect(result.current.pending).toBeNull();
    expect(boundary.fetch).not.toHaveBeenCalled();
  });

  it('updates currency and visible data only after a successful confirmed restore', async () => {
    boundary.fetch.mockResolvedValue(Response.json({ success: true }));
    const { result } = renderHook(useBackup);
    await act(() => result.current.choose(file()));
    await act(() => result.current.restore());
    expect(boundary.fetch).toHaveBeenCalledWith(
      '/api/backup',
      expect.objectContaining({
        method: 'POST',
        body: expect.any(String),
      }),
    );
    expect(JSON.parse(boundary.fetch.mock.calls[0][1].body)).toEqual(
      financeBackupFixture(),
    );
    expect(boundary.setCurrency).toHaveBeenCalledWith('USD');
    expect(boundary.refresh).toHaveBeenCalledOnce();
    expect(result.current.pending).toBeNull();
    expect(result.current.message).toBe('Backup restored.');
  });

  it('blocks duplicate submission and cancellation while restoring', async () => {
    let resolve!: (response: Response) => void;
    boundary.fetch.mockImplementation(
      () =>
        new Promise<Response>((done) => {
          resolve = done;
        }),
    );
    const { result } = renderHook(useBackup);
    await act(() => result.current.choose(file()));
    let operation!: Promise<void>;
    act(() => {
      operation = result.current.restore();
    });
    await act(() => result.current.restore());
    act(() => result.current.cancel());
    expect(boundary.fetch).toHaveBeenCalledOnce();
    expect(result.current.pending).not.toBeNull();
    await act(async () => {
      resolve(Response.json({ success: true }));
      await operation;
    });
  });

  it('retains the file for retry after a rejected import', async () => {
    boundary.fetch.mockResolvedValue(
      Response.json(
        { error: 'Your existing data has been kept.' },
        { status: 500 },
      ),
    );
    const { result } = renderHook(useBackup);
    await act(() => result.current.choose(file()));
    await act(() => result.current.restore());
    expect(result.current.error).toBe('Your existing data has been kept.');
    expect(result.current.pending).not.toBeNull();
    expect(boundary.refresh).not.toHaveBeenCalled();
    expect(boundary.setCurrency).not.toHaveBeenCalled();
    boundary.fetch.mockResolvedValue(Response.json({ success: true }));
    await act(() => result.current.restore());
    expect(result.current.message).toBe('Backup restored.');
  });

  it('reports an uncertain network outcome without claiming that data was untouched', async () => {
    boundary.fetch.mockRejectedValue(new TypeError('Failed to fetch'));
    const { result } = renderHook(useBackup);
    await act(() => result.current.choose(file()));
    await act(() => result.current.restore());
    expect(result.current.error).toContain('Could not confirm the import');
    expect(boundary.refresh).not.toHaveBeenCalled();
  });
});
