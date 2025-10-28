/**
 * Client-side hook for Yahoo Finance API calls
 * Calls Yahoo Finance directly from the browser to avoid server-side rate limiting
 * @module hooks/useYahooFinance
 */

import { useState, useCallback } from 'react';

/**
 * Quote data from Yahoo Finance
 */
export interface YahooQuote {
  symbol: string;
  regularMarketPrice: number;
  regularMarketTime: Date;
  currency: string;
  shortName?: string;
  longName?: string;
}

/**
 * Hook for fetching Yahoo Finance quotes directly from the client
 */
export function useYahooFinance() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches a quote directly from the client-side
   * Calls Yahoo Finance API directly from the browser to avoid server-side rate limiting
   * The client IP is used instead of the server IP, distributing rate limits across users
   */
  const fetchQuote = useCallback(
    async (symbol: string): Promise<YahooQuote | null> => {
      if (!symbol || symbol.trim().length === 0) {
        setError('Symbol cannot be empty');
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        // Call Yahoo Finance API directly from the client
        // This uses the client's IP address, not the server's, avoiding rate limiting issues
        const yahooUrl = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?modules=price`;

        const response = await fetch(yahooUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch quote for ${symbol}`);
        }

        const data = await response.json();
        const priceData = data.quoteSummary?.result?.[0]?.price;

        if (!priceData) {
          throw new Error(`No price data available for symbol: ${symbol}`);
        }

        return {
          symbol: priceData.symbol,
          regularMarketPrice: priceData.regularMarketPrice?.raw || 0,
          regularMarketTime: new Date(
            (priceData.regularMarketTime?.raw || 0) * 1000,
          ),
          currency: priceData.currency || 'USD',
          shortName: priceData.shortName,
          longName: priceData.longName,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { fetchQuote, loading, error };
}
