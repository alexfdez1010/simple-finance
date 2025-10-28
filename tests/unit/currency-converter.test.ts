/**
 * Unit tests for currency converter service
 * @module tests/unit/currency-converter
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  convertToEur,
  convertToEurHistorical,
  getCurrentExchangeRate,
  getHistoricalExchangeRate,
} from '@/lib/domain/services/currency-converter';
import {
  fetchUsdToEurRate,
  fetchHistoricalUsdToEurRate,
} from '@/lib/infrastructure/currency/exchange-rate-client';

// Mock the exchange rate client
vi.mock('@/lib/infrastructure/currency/exchange-rate-client', () => ({
  fetchUsdToEurRate: vi.fn(),
  fetchHistoricalUsdToEurRate: vi.fn(),
  convertUsdToEur: (amount: number, rate: number) =>
    Math.round(amount * rate * 100) / 100,
}));

describe('Currency Converter Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('convertToEur', () => {
    it('should convert USD to EUR using current exchange rate', async () => {
      const mockRate = {
        from: 'USD',
        to: 'EUR',
        rate: 0.92,
        timestamp: new Date(),
      };

      vi.mocked(fetchUsdToEurRate).mockResolvedValue(mockRate);

      const result = await convertToEur(100);

      expect(result).toBe(92);
      expect(fetchUsdToEurRate).toHaveBeenCalledTimes(1);
    });

    it('should use fallback rate when API fails', async () => {
      vi.mocked(fetchUsdToEurRate).mockResolvedValue(null);

      const result = await convertToEur(100);

      // Fallback rate is 0.92
      expect(result).toBe(92);
    });

    it('should handle zero amount', async () => {
      const mockRate = {
        from: 'USD',
        to: 'EUR',
        rate: 0.92,
        timestamp: new Date(),
      };

      vi.mocked(fetchUsdToEurRate).mockResolvedValue(
        mockRate,
      );

      const result = await convertToEur(0);

      expect(result).toBe(0);
    });

    it('should handle negative amounts', async () => {
      const mockRate = {
        from: 'USD',
        to: 'EUR',
        rate: 0.92,
        timestamp: new Date(),
      };

      vi.mocked(fetchUsdToEurRate).mockResolvedValue(
        mockRate,
      );

      const result = await convertToEur(-100);

      expect(result).toBe(-92);
    });
  });

  describe('convertToEurHistorical', () => {
    it('should convert USD to EUR using historical exchange rate', async () => {
      const date = new Date('2024-01-01');
      const mockRate = {
        from: 'USD',
        to: 'EUR',
        rate: 0.9,
        timestamp: date,
      };

      vi.mocked(
        fetchHistoricalUsdToEurRate,
      ).mockResolvedValue(mockRate);

      const result = await convertToEurHistorical(100, date);

      expect(result).toBe(90);
      expect(fetchHistoricalUsdToEurRate).toHaveBeenCalledWith(date);
    });

    it('should use fallback rate when historical rate unavailable', async () => {
      const date = new Date('2024-01-01');

      vi.mocked(
        fetchHistoricalUsdToEurRate,
      ).mockResolvedValue(null);

      const result = await convertToEurHistorical(100, date);

      // Fallback rate is 0.92
      expect(result).toBe(92);
    });
  });

  describe('getCurrentExchangeRate', () => {
    it('should return current exchange rate', async () => {
      const mockRate = {
        from: 'USD',
        to: 'EUR',
        rate: 0.92,
        timestamp: new Date(),
      };

      vi.mocked(fetchUsdToEurRate).mockResolvedValue(
        mockRate,
      );

      const result = await getCurrentExchangeRate();

      expect(result).toEqual(mockRate);
    });

    it('should return fallback rate when API fails', async () => {
      vi.mocked(fetchUsdToEurRate).mockResolvedValue(null);

      const result = await getCurrentExchangeRate();

      expect(result.from).toBe('USD');
      expect(result.to).toBe('EUR');
      expect(result.rate).toBe(0.92);
      expect(result.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('getHistoricalExchangeRate', () => {
    it('should return historical exchange rate', async () => {
      const date = new Date('2024-01-01');
      const mockRate = {
        from: 'USD',
        to: 'EUR',
        rate: 0.9,
        timestamp: date,
      };

      vi.mocked(
        fetchHistoricalUsdToEurRate,
      ).mockResolvedValue(mockRate);

      const result = await getHistoricalExchangeRate(date);

      expect(result).toEqual(mockRate);
    });

    it('should return fallback rate when historical rate unavailable', async () => {
      const date = new Date('2024-01-01');

      vi.mocked(
        fetchHistoricalUsdToEurRate,
      ).mockResolvedValue(null);

      const result = await getHistoricalExchangeRate(date);

      expect(result.from).toBe('USD');
      expect(result.to).toBe('EUR');
      expect(result.rate).toBe(0.92);
      expect(result.timestamp).toEqual(date);
    });
  });
});
