/**
 * Currency conversion domain service
 * Handles business logic for converting financial values to EUR
 * @module domain/services/currency-converter
 */

import {
  fetchUsdToEurRate,
  fetchHistoricalUsdToEurRate,
  convertUsdToEur,
  type ExchangeRate,
} from '@/lib/infrastructure/currency/exchange-rate-client';

/**
 * Default fallback exchange rate if API fails
 * Based on approximate USD/EUR rate (updated periodically)
 */
const FALLBACK_USD_TO_EUR_RATE = 0.92;

/**
 * Converts a USD amount to EUR using current exchange rate
 * Falls back to default rate if API fails
 *
 * @param usdAmount - Amount in USD
 * @returns Amount in EUR
 */
export async function convertToEur(usdAmount: number): Promise<number> {
  const exchangeRate = await fetchUsdToEurRate();
  const rate = exchangeRate?.rate ?? FALLBACK_USD_TO_EUR_RATE;
  return convertUsdToEur(usdAmount, rate);
}

/**
 * Converts a USD amount to EUR using historical exchange rate
 * Falls back to current rate if historical rate unavailable
 *
 * @param usdAmount - Amount in USD
 * @param date - Historical date for exchange rate
 * @returns Amount in EUR
 */
export async function convertToEurHistorical(
  usdAmount: number,
  date: Date,
): Promise<number> {
  const exchangeRate = await fetchHistoricalUsdToEurRate(date);
  const rate = exchangeRate?.rate ?? FALLBACK_USD_TO_EUR_RATE;
  return convertUsdToEur(usdAmount, rate);
}

/**
 * Gets current USD to EUR exchange rate
 * Returns fallback rate if API fails
 *
 * @returns Exchange rate object
 */
export async function getCurrentExchangeRate(): Promise<ExchangeRate> {
  const exchangeRate = await fetchUsdToEurRate();
  return (
    exchangeRate ?? {
      from: 'USD',
      to: 'EUR',
      rate: FALLBACK_USD_TO_EUR_RATE,
      timestamp: new Date(),
    }
  );
}

/**
 * Gets historical USD to EUR exchange rate
 * Returns current rate if historical unavailable
 *
 * @param date - Historical date
 * @returns Exchange rate object
 */
export async function getHistoricalExchangeRate(
  date: Date,
): Promise<ExchangeRate> {
  const exchangeRate = await fetchHistoricalUsdToEurRate(date);
  return (
    exchangeRate ?? {
      from: 'USD',
      to: 'EUR',
      rate: FALLBACK_USD_TO_EUR_RATE,
      timestamp: date,
    }
  );
}
