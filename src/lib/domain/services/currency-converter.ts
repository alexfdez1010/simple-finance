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
 * Converts a USD amount to EUR using current exchange rate.
 * Throws if the rate is unavailable — better to surface the failure than
 * silently render a stale or made-up value.
 *
 * @param usdAmount - Amount in USD
 * @returns Amount in EUR
 */
export async function convertToEur(usdAmount: number): Promise<number> {
  const exchangeRate = await fetchUsdToEurRate();
  if (!exchangeRate?.rate) throw new Error('Missing USD→EUR rate');
  return convertUsdToEur(usdAmount, exchangeRate.rate);
}

/**
 * Converts a USD amount to EUR using historical exchange rate.
 * Throws if no rate is available.
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
  if (!exchangeRate?.rate) throw new Error('Missing historical USD→EUR rate');
  return convertUsdToEur(usdAmount, exchangeRate.rate);
}

/**
 * Gets current USD to EUR exchange rate. Throws on failure.
 *
 * @returns Exchange rate object
 */
export async function getCurrentExchangeRate(): Promise<ExchangeRate> {
  const exchangeRate = await fetchUsdToEurRate();
  if (!exchangeRate) throw new Error('Missing USD→EUR rate');
  return exchangeRate;
}

/**
 * Gets historical USD to EUR exchange rate. Throws on failure.
 *
 * @param date - Historical date
 * @returns Exchange rate object
 */
export async function getHistoricalExchangeRate(
  date: Date,
): Promise<ExchangeRate> {
  const exchangeRate = await fetchHistoricalUsdToEurRate(date);
  if (!exchangeRate) throw new Error('Missing historical USD→EUR rate');
  return exchangeRate;
}
