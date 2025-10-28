/**
 * Unit tests for useYahooFinance hook
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useYahooFinance } from '@/lib/hooks/useYahooFinance';

// Mock fetch
global.fetch = vi.fn() as unknown as typeof fetch;

describe('useYahooFinance hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useYahooFinance());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should return error for empty symbol', async () => {
    const { result } = renderHook(() => useYahooFinance());

    let quote;
    await act(async () => {
      quote = await result.current.fetchQuote('');
    });

    expect(quote).toBeNull();
    expect(result.current.error).toBe('Symbol cannot be empty');
  });

  it('should fetch quote successfully', async () => {
    const mockResponse = {
      quoteSummary: {
        result: [
          {
            price: {
              symbol: 'AAPL',
              regularMarketPrice: { raw: 150.25 },
              regularMarketTime: { raw: 1704067200 },
              currency: 'USD',
              shortName: 'Apple Inc.',
              longName: 'Apple Inc.',
            },
          },
        ],
      },
    };

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const { result } = renderHook(() => useYahooFinance());

    let quote;
    await act(async () => {
      quote = await result.current.fetchQuote('AAPL');
    });

    expect(quote).toEqual({
      symbol: 'AAPL',
      regularMarketPrice: 150.25,
      regularMarketTime: expect.any(Date),
      currency: 'USD',
      shortName: 'Apple Inc.',
      longName: 'Apple Inc.',
    });
    expect(result.current.error).toBeNull();
  });

  it('should handle fetch errors', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
    } as any);

    const { result } = renderHook(() => useYahooFinance());

    let quote;
    await act(async () => {
      quote = await result.current.fetchQuote('INVALID');
    });

    expect(quote).toBeNull();
    expect(result.current.error).toBe('Failed to fetch quote for INVALID');
  });

  it('should handle network errors', async () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useYahooFinance());

    let quote;
    await act(async () => {
      quote = await result.current.fetchQuote('AAPL');
    });

    expect(quote).toBeNull();
    expect(result.current.error).toBe('Network error');
  });

  it('should clear loading state after fetch completes', async () => {
    const mockResponse = {
      quoteSummary: {
        result: [
          {
            price: {
              symbol: 'AAPL',
              regularMarketPrice: { raw: 150.25 },
              regularMarketTime: { raw: 1704067200 },
              currency: 'USD',
            },
          },
        ],
      },
    };

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const { result } = renderHook(() => useYahooFinance());

    expect(result.current.loading).toBe(false);

    await act(async () => {
      await result.current.fetchQuote('AAPL');
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should encode symbol parameter in URL', async () => {
    const mockResponse = {
      quoteSummary: {
        result: [
          {
            price: {
              symbol: 'BRK.A',
              regularMarketPrice: { raw: 500000 },
              regularMarketTime: { raw: 1704067200 },
              currency: 'USD',
            },
          },
        ],
      },
    };

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as any);

    const { result } = renderHook(() => useYahooFinance());

    await act(async () => {
      await result.current.fetchQuote('BRK.A');
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'https://query1.finance.yahoo.com/v10/finance/quoteSummary/BRK.A?modules=price',
      expect.objectContaining({
        headers: expect.any(Object),
      }),
    );
  });
});
