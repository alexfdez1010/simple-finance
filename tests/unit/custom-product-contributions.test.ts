/**
 * Unit tests for the contribution-based custom-product calculator.
 * @module tests/unit/custom-product-contributions
 */

import { describe, expect, it } from 'vitest';
import {
  calculateCustomProductValueFromContributions,
  calculateNetInvestedFromContributions,
} from '@/lib/domain/services/custom-product-calculator';
import type { CustomContribution } from '@/lib/domain/models/product.types';

const contribution = (
  amount: number,
  date: string,
  id = `c-${date}-${amount}`,
): CustomContribution => ({
  id,
  amount,
  date: new Date(date),
  note: null,
  createdAt: new Date(date),
  updatedAt: new Date(date),
});

describe('calculateCustomProductValueFromContributions', () => {
  const rate = 0.05; // 5% annual
  const today = new Date('2024-12-31');

  it('returns 0 when there are no contributions', () => {
    expect(calculateCustomProductValueFromContributions([], rate, today)).toBe(
      0,
    );
  });

  it('matches the single-contribution formula for one deposit', () => {
    // 1000 EUR deposited 365 days ago at 5% annual ≈ 1051.27
    const contributions = [contribution(1000, '2024-01-01')];
    const value = calculateCustomProductValueFromContributions(
      contributions,
      rate,
      today,
    );
    expect(value).toBeCloseTo(1051.27, 1);
  });

  it('compounds each contribution from its own date independently', () => {
    // Deposit 1000 a year ago + deposit 500 today: 1051.27 + 500 = 1551.27
    const contributions = [
      contribution(1000, '2024-01-01'),
      contribution(500, '2024-12-31'),
    ];
    const value = calculateCustomProductValueFromContributions(
      contributions,
      rate,
      today,
    );
    expect(value).toBeCloseTo(1551.27, 1);
  });

  it('treats withdrawals as negative compounded contributions', () => {
    // Deposit 1000 a year ago grows to 1051.27, withdraw 100 today: 951.27
    const contributions = [
      contribution(1000, '2024-01-01'),
      contribution(-100, '2024-12-31'),
    ];
    const value = calculateCustomProductValueFromContributions(
      contributions,
      rate,
      today,
    );
    expect(value).toBeCloseTo(951.27, 1);
  });

  it('ignores contributions dated after the reference date', () => {
    const contributions = [
      contribution(1000, '2024-01-01'),
      contribution(500, '2025-06-01'), // future
    ];
    const value = calculateCustomProductValueFromContributions(
      contributions,
      rate,
      today,
    );
    expect(value).toBeCloseTo(1051.27, 1);
  });

  it('rejects rates below -100%', () => {
    expect(() =>
      calculateCustomProductValueFromContributions(
        [contribution(1000, '2024-01-01')],
        -1.5,
        today,
      ),
    ).toThrow('Annual return rate cannot be less than -100%');
  });
});

describe('calculateNetInvestedFromContributions', () => {
  it('sums positive deposits only when no withdrawals', () => {
    const contributions = [
      contribution(1000, '2024-01-01'),
      contribution(500, '2024-06-30'),
    ];
    expect(calculateNetInvestedFromContributions(contributions)).toBe(1500);
  });

  it('subtracts withdrawals from deposits', () => {
    const contributions = [
      contribution(1000, '2024-01-01'),
      contribution(-200, '2024-06-30'),
    ];
    expect(calculateNetInvestedFromContributions(contributions)).toBe(800);
  });

  it('includes future-dated contributions in the sum', () => {
    const contributions = [
      contribution(1000, '2024-01-01'),
      contribution(500, '2025-12-31'),
    ];
    expect(calculateNetInvestedFromContributions(contributions)).toBe(1500);
  });

  it('returns 0 for an empty list', () => {
    expect(calculateNetInvestedFromContributions([])).toBe(0);
  });
});
