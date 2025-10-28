/**
 * Yahoo Finance API client for fetching real-time stock data
 * This client is designed to be used on the client-side to avoid IP rate limits
 * @module infrastructure/yahoo-finance/client
 */

import yahooFinance from 'yahoo-finance2';

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
 * Historical price data point
 */
export interface HistoricalPrice {
  date: Date;
  close: number;
}

/**
 * Fetches current quote for a given symbol
 *
 * @param symbol - Stock symbol (e.g., 'AAPL', 'GOOGL')
 * @returns Quote data
 * @throws Error if symbol is invalid or API request fails
 */
export async function fetchQuote(symbol: string): Promise<YahooQuote> {
  if (!symbol || symbol.trim().length === 0) {
    throw new Error('Symbol cannot be empty');
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const quote = await (yahooFinance as any).quote(symbol);

    if (!quote || !quote.regularMarketPrice) {
      throw new Error(`No price data available for symbol: ${symbol}`);
    }

    return {
      symbol: quote.symbol,
      regularMarketPrice: quote.regularMarketPrice,
      regularMarketTime: quote.regularMarketTime || new Date(),
      currency: quote.currency || 'USD',
      shortName: quote.shortName,
      longName: quote.longName,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch quote for ${symbol}: ${error.message}`);
    }
    throw new Error(`Failed to fetch quote for ${symbol}: Unknown error`);
  }
}

/**
 * Fetches historical prices for a given symbol
 *
 * @param symbol - Stock symbol
 * @param startDate - Start date for historical data
 * @param endDate - End date for historical data (defaults to today)
 * @returns Array of historical prices
 * @throws Error if symbol is invalid or API request fails
 */
export async function fetchHistoricalPrices(
  symbol: string,
  startDate: Date,
  endDate: Date = new Date(),
): Promise<HistoricalPrice[]> {
  if (!symbol || symbol.trim().length === 0) {
    throw new Error('Symbol cannot be empty');
  }

  if (startDate > endDate) {
    throw new Error('Start date must be before end date');
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (yahooFinance as any).historical(symbol, {
      period1: startDate,
      period2: endDate,
      interval: '1d',
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return result.map((item: any) => ({
      date: item.date,
      close: item.close,
    }));
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Failed to fetch historical data for ${symbol}: ${error.message}`,
      );
    }
    throw new Error(
      `Failed to fetch historical data for ${symbol}: Unknown error`,
    );
  }
}

/**
 * Validates if a symbol exists and is valid
 *
 * @param symbol - Stock symbol to validate
 * @returns True if symbol is valid
 */
export async function validateSymbol(symbol: string): Promise<boolean> {
  try {
    await fetchQuote(symbol);
    return true;
  } catch {
    return false;
  }
}

/**
 * Searches for symbols matching a query
 *
 * @param query - Search query
 * @returns Array of matching symbols with names
 */
export async function searchSymbols(
  query: string,
): Promise<Array<{ symbol: string; name: string }>> {
  if (!query || query.trim().length === 0) {
    return [];
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = await (yahooFinance as any).search(query);

    return results.quotes
      .filter((quote: unknown) => {
        const q = quote as { symbol?: string; shortname?: string };
        return q.symbol && q.shortname;
      })
      .slice(0, 10)
      .map((quote: unknown) => {
        const q = quote as { symbol: string; shortname: string };
        return {
          symbol: q.symbol,
          name: q.shortname,
        };
      });
  } catch (error) {
    console.error('Failed to search symbols:', error);
    return [];
  }
}
