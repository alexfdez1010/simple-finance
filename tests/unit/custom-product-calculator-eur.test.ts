/**
 * Unit tests for custom product calculator with EUR conversion
 * @module tests/unit/custom-product-calculator-eur
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  calculateCustomProductValue,
  calculateCustomProductValueSync,
} from '@/lib/domain/services/custom-product-calculator';

describe('Custom Product Calculator with EUR Conversion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('calculateCustomProductValue (async)', () => {
    it('should calculate value with EUR input directly', async () => {
      const investmentDate = new Date('2024-01-01');
      const currentDate = new Date('2024-12-31'); // 365 days later

      // Direct EUR input: €920 for 5% annual return over 365 days
      const result = await calculateCustomProductValue(
        920, // EUR
        0.05, // 5% annual return
        investmentDate,
        currentDate,
      );

      // Expected: 920 * (1 + 0.05/365)^365 ≈ 967.17 EUR
      expect(result).toBeCloseTo(967.17, 0);
    });

    it('should handle zero days since investment', async () => {
      const investmentDate = new Date('2024-01-01');

      const result = await calculateCustomProductValue(
        1000, // EUR
        0.05,
        investmentDate,
        investmentDate, // Same day
      );

      // No growth on day 0
      expect(result).toBe(1000);
    });

    it('should throw error for negative investment', async () => {
      const investmentDate = new Date('2024-01-01');

      await expect(
        calculateCustomProductValue(-1000, 0.05, investmentDate),
      ).rejects.toThrow('Initial investment must be positive');
    });

    it('should throw error for future investment date', async () => {
      const futureDate = new Date('2099-01-01');

      await expect(
        calculateCustomProductValue(1000, 0.05, futureDate),
      ).rejects.toThrow('Investment date cannot be in the future');
    });

    it('should handle negative return rate', async () => {
      const investmentDate = new Date('2024-01-01');
      const currentDate = new Date('2024-12-31');

      // -5% annual return on €920
      const result = await calculateCustomProductValue(
        920, // EUR
        -0.05,
        investmentDate,
        currentDate,
      );

      // Expected: 920 * (1 - 0.05/365)^365 ≈ 875.13 EUR
      expect(result).toBeCloseTo(875.13, 0);
    });

    it('should throw error for return rate less than -100%', async () => {
      const investmentDate = new Date('2024-01-01');

      await expect(
        calculateCustomProductValue(1000, -1.5, investmentDate),
      ).rejects.toThrow('Annual return rate cannot be less than -100%');
    });
  });

  describe('calculateCustomProductValueSync', () => {
    it('should calculate value without EUR conversion', () => {
      const investmentDate = new Date('2024-01-01');
      const currentDate = new Date('2024-12-31');

      // Already in EUR
      const result = calculateCustomProductValueSync(
        920, // EUR
        0.05,
        investmentDate,
        currentDate,
      );

      // Expected: 920 * (1 + 0.05/365)^365 ≈ 967.17 EUR
      expect(result).toBeCloseTo(967.17, 0);
    });

    it('should handle fractional days', () => {
      const investmentDate = new Date('2024-01-01');
      const currentDate = new Date('2024-01-11'); // 10 days later

      const result = calculateCustomProductValueSync(
        1000,
        0.05,
        investmentDate,
        currentDate,
      );

      // Expected: 1000 * (1 + 0.05/365)^10 ≈ 1001.37 EUR
      expect(result).toBeCloseTo(1001.37, 1);
    });

    it('should throw error for zero investment', () => {
      const investmentDate = new Date('2024-01-01');

      expect(() =>
        calculateCustomProductValueSync(0, 0.05, investmentDate),
      ).toThrow('Initial investment must be positive');
    });
  });

  describe('Integration scenarios', () => {
    it('should handle high return rates correctly', async () => {
      const investmentDate = new Date('2024-01-01');
      const currentDate = new Date('2024-12-31');

      // 50% annual return on €920
      const result = await calculateCustomProductValue(
        920, // EUR
        0.5,
        investmentDate,
        currentDate,
      );

      // Expected: 920 * (1 + 0.5/365)^365 ≈ 1516.30 EUR
      expect(result).toBeCloseTo(1516.3, 0);
    });

    it('should handle very small investments', async () => {
      const investmentDate = new Date('2024-01-01');
      const currentDate = new Date('2024-12-31');

      const result = await calculateCustomProductValue(
        1, // €1 EUR
        0.05,
        investmentDate,
        currentDate,
      );

      // Expected: 1 * (1 + 0.05/365)^365 ≈ 1.05 EUR
      expect(result).toBeCloseTo(1.05, 2);
    });
  });
});
