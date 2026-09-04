/** Tests for bounded Yahoo quote retries. */

import { describe, expect, it, vi } from 'vitest';
import {
  fetchYahooQuoteWithRetryServer,
  type YahooQuote,
} from '@/lib/infrastructure/yahoo-finance/server-client';

const quote = { symbol: 'AAPL' } as YahooQuote;

describe('fetchYahooQuoteWithRetryServer', () => {
  it('returns immediately when the first attempt succeeds', async () => {
    const fetchQuote = vi.fn().mockResolvedValue(quote);
    const wait = vi.fn();

    const result = await fetchYahooQuoteWithRetryServer('AAPL', {
      fetchQuote,
      wait,
    });

    expect(result).toBe(quote);
    expect(fetchQuote).toHaveBeenCalledTimes(1);
    expect(wait).not.toHaveBeenCalled();
  });

  it('retries null results with exponential backoff', async () => {
    const fetchQuote = vi
      .fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(quote);
    const wait = vi.fn().mockResolvedValue(undefined);

    const result = await fetchYahooQuoteWithRetryServer('AAPL', {
      fetchQuote,
      wait,
      delayMs: 100,
    });

    expect(result).toBe(quote);
    expect(fetchQuote).toHaveBeenCalledTimes(3);
    expect(wait.mock.calls).toEqual([[100], [200]]);
  });

  it('returns null after the final failed attempt', async () => {
    const fetchQuote = vi.fn().mockResolvedValue(null);

    const result = await fetchYahooQuoteWithRetryServer('AAPL', {
      attempts: 2,
      delayMs: 0,
      fetchQuote,
    });

    expect(result).toBeNull();
    expect(fetchQuote).toHaveBeenCalledTimes(2);
  });
});
