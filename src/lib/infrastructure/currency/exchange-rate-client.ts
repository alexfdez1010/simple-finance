/**
 * Currency exchange rate client
 * Fetches USD/EUR exchange rates with server-side caching
 * Uses exchangerate-api.com free tier (1500 requests/month)
 * @module infrastructure/currency/exchange-rate-client
 */

/**
 * Exchange rate response from API
 */
export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  timestamp: Date;
}

/**
 * Fetches the current USD to EUR exchange rate
 * Cached on the server with 1-hour revalidation
 *
 * @returns Exchange rate data or null if failed
 */
export async function fetchUsdToEurRate(): Promise<ExchangeRate | null> {
  try {
    // Using exchangerate-api.com free tier
    // Alternative: Use ECB (European Central Bank) API for more reliability
    const response = await fetch(
      'https://api.exchangerate-api.com/v4/latest/USD',
      {
        next: { revalidate: 60 },
      },
    );

    if (!response.ok) {
      console.error(
        `Exchange rate API error: ${response.status} ${response.statusText}`,
      );
      return null;
    }

    const data = await response.json();

    if (!data.rates || !data.rates.EUR) {
      console.error('Invalid exchange rate response: missing EUR rate');
      return null;
    }

    return {
      from: 'USD',
      to: 'EUR',
      rate: data.rates.EUR,
      timestamp: new Date(data.time_last_updated * 1000),
    };
  } catch (err) {
    console.error('Error fetching exchange rate:', err);
    return null;
  }
}

/**
 * Fetches historical USD to EUR exchange rate for a specific date
 * Note: Free tier may not support historical rates, falls back to current rate
 *
 * @param date - Date to fetch rate for
 * @returns Exchange rate data or null if failed
 */
export async function fetchHistoricalUsdToEurRate(
  date: Date,
): Promise<ExchangeRate | null> {
  try {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    // Try to fetch historical rate
    // Note: This endpoint may require a paid plan
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/history/USD/${dateStr}`,
      {
        next: { revalidate: 86400 }, // Cache historical rates for 24 hours
      },
    );

    if (!response.ok) {
      // Fallback to current rate if historical not available
      console.warn(
        `Historical rate not available for ${dateStr}, using current rate`,
      );
      return fetchUsdToEurRate();
    }

    const data = await response.json();

    if (!data.rates || !data.rates.EUR) {
      console.warn('Invalid historical rate response, using current rate');
      return fetchUsdToEurRate();
    }

    return {
      from: 'USD',
      to: 'EUR',
      rate: data.rates.EUR,
      timestamp: new Date(dateStr),
    };
  } catch (err) {
    console.error('Error fetching historical exchange rate:', err);
    // Fallback to current rate
    return fetchUsdToEurRate();
  }
}

/**
 * Converts USD amount to EUR
 *
 * @param usdAmount - Amount in USD
 * @param rate - Exchange rate (USD to EUR)
 * @returns Amount in EUR, rounded to 2 decimal places
 */
export function convertUsdToEur(usdAmount: number, rate: number): number {
  return Math.round(usdAmount * rate * 100) / 100;
}

/**
 * Yahoo Finance tickers for crypto / commodity-backed assets supported as
 * custom product currencies. BTC-EUR and ETH-EUR quote directly in EUR;
 * XAUT (Tether Gold) has no native EUR pair on Yahoo — use XAUT-USD and
 * let the existing server-client convert USD→EUR via the cached USD rate.
 */
const YAHOO_CRYPTO_TICKERS = {
  BTC: 'BTC-USD',
  ETH: 'ETH-USD',
  XAUT: 'XAUT-USD',
} as const;

export type CryptoCurrency = keyof typeof YAHOO_CRYPTO_TICKERS;

/**
 * Returns the Yahoo Finance ticker for a supported crypto/commodity currency.
 *
 * @param symbol - Asset symbol
 * @returns Yahoo ticker (e.g. 'BTC-EUR')
 */
export function getCryptoYahooTicker(symbol: CryptoCurrency): string {
  return YAHOO_CRYPTO_TICKERS[symbol];
}

/**
 * Converts an amount denominated in a crypto/commodity asset to EUR.
 *
 * @param amount - Amount in source asset
 * @param rateEur - Rate (1 unit of asset in EUR)
 * @returns Amount in EUR, rounded to 2 decimal places
 */
export function convertCryptoToEur(amount: number, rateEur: number): number {
  return Math.round(amount * rateEur * 100) / 100;
}
