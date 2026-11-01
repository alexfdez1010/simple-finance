// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { createYahooClient } from '@/lib/infrastructure/yahoo-finance/client';

describe('Yahoo client request isolation', () => {
  it('allows another request to finish while an earlier request is suspended', async () => {
    let release!: (response: Response) => void;
    const suspended = new Promise<Response>((resolve) => {
      release = resolve;
    });
    const firstFetch = Object.assign(
      vi.fn(() => suspended),
      { preconnect: vi.fn() },
    );
    const secondFetch = Object.assign(
      vi.fn(async () => Response.json({ value: 2 })),
      { preconnect: vi.fn() },
    );
    const first = createYahooClient()._fetch(
      'https://example.test/quote',
      {},
      { fetch: firstFetch },
    );
    await vi.waitFor(() => expect(firstFetch).toHaveBeenCalledOnce());
    try {
      const second = createYahooClient()._fetch(
        'https://example.test/quote',
        {},
        { fetch: secondFetch },
      );
      await vi.waitFor(() => expect(secondFetch).toHaveBeenCalledOnce());
      await expect(second).resolves.toEqual({ value: 2 });
    } finally {
      release(Response.json({ value: 1 }));
      await expect(first).resolves.toEqual({ value: 1 });
    }
  });
});
