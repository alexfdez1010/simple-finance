/**
 * Server-side Yahoo Finance client
 * Fetches quotes on the server for SSR using yahoo-finance2 library
 * @module infrastructure/yahoo-finance/server-client
 */

import YahooFinance from 'yahoo-finance2';

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

// Create a single instance to reuse
const yahooFinance = new YahooFinance();

/**
 * Fetches a quote from Yahoo Finance on the server using yahoo-finance2
 * This library handles crumb/cookie authentication automatically
 * Note: This uses the server's IP and may hit rate limits with high traffic
 *
 * @param symbol - Stock symbol to fetch
 * @returns Quote data or null if failed
 */
export async function fetchYahooQuoteServer(
  symbol: string,
): Promise<YahooQuote | null> {
  if (!symbol || symbol.trim().length === 0) {
    return null;
  }

  try {
    // Use yahoo-finance2 library which handles authentication
    const quote = await yahooFinance.quote(symbol);

    if (!quote || quote.regularMarketPrice === undefined) {
      console.error(`No price data available for symbol: ${symbol}`);
      return null;
    }

    return {
      symbol: quote.symbol,
      regularMarketPrice: quote.regularMarketPrice,
      regularMarketTime: quote.regularMarketTime
        ? new Date(quote.regularMarketTime)
        : new Date(),
      currency: quote.currency || 'USD',
      shortName: quote.shortName || undefined,
      longName: quote.longName || undefined,
    };
  } catch (err) {
    console.error(`Error fetching quote for ${symbol}:`, err);
    return null;
  }
}
