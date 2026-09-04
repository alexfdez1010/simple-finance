/**
 * Server-side Yahoo Finance client
 * Fetches quotes on the server for SSR using yahoo-finance2 library
 * All prices are converted to EUR
 * @module infrastructure/yahoo-finance/server-client
 */

import YahooFinance from 'yahoo-finance2';
import { convertToEur } from '@/lib/domain/services/currency-converter';

/**
 * Quote data from Yahoo Finance (prices in EUR)
 */
export interface YahooQuote {
  symbol: string;
  regularMarketPrice: number;
  regularMarketPriceUsd: number;
  regularMarketTime: Date;
  currency: string;
  originalCurrency: string;
  shortName?: string;
  longName?: string;
}

export interface YahooQuoteRetryOptions {
  attempts?: number;
  delayMs?: number;
  fetchQuote?: (symbol: string) => Promise<YahooQuote | null>;
  wait?: (milliseconds: number) => Promise<void>;
}

// Create a single instance to reuse
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

/** Resolves after a delay between retry attempts. */
function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

/**
 * Fetches a quote from Yahoo Finance on the server using yahoo-finance2
 * This library handles crumb/cookie authentication automatically
 * Converts all prices to EUR regardless of original currency
 * Note: This uses the server's IP and may hit rate limits with high traffic
 *
 * @param symbol - Stock symbol to fetch
 * @returns Quote data with prices in EUR, or null if failed
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

    const originalCurrency = quote.currency || 'USD';
    const priceUsd = quote.regularMarketPrice;

    // Convert to EUR if the original currency is USD
    // For other currencies, we assume USD as intermediate (simplified)
    let priceEur: number;
    if (originalCurrency === 'EUR') {
      priceEur = priceUsd;
    } else {
      // Convert USD to EUR (or treat non-USD as USD for simplicity)
      priceEur = await convertToEur(priceUsd);
    }

    return {
      symbol: quote.symbol,
      regularMarketPrice: priceEur,
      regularMarketPriceUsd: originalCurrency === 'USD' ? priceUsd : priceEur,
      regularMarketTime: quote.regularMarketTime
        ? new Date(quote.regularMarketTime)
        : new Date(),
      currency: 'EUR',
      originalCurrency,
      shortName: quote.shortName || undefined,
      longName: quote.longName || undefined,
    };
  } catch (err) {
    console.error(`Error fetching quote for ${symbol}:`, err);
    return null;
  }
}

/**
 * Fetches a quote up to three times with exponential backoff. A nullable
 * result is preserved after the final attempt so callers choose whether a
 * missing quote is tolerable or must abort an atomic operation.
 *
 * @param symbol - Stock symbol to fetch
 * @param options - Injectable retry policy and boundaries
 * @returns First available quote, or null after all attempts fail
 */
export async function fetchYahooQuoteWithRetryServer(
  symbol: string,
  options: YahooQuoteRetryOptions = {},
): Promise<YahooQuote | null> {
  const attempts = Math.max(1, options.attempts ?? 3);
  const delayMs = Math.max(0, options.delayMs ?? 250);
  const fetchQuote = options.fetchQuote ?? fetchYahooQuoteServer;
  const sleep = options.wait ?? wait;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const quote = await fetchQuote(symbol);
    if (quote) return quote;
    if (attempt < attempts) {
      await sleep(delayMs * 2 ** (attempt - 1));
    }
  }
  return null;
}
