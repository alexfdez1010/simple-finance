import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  convertFromEur,
  formatInCurrency,
  type DisplayCurrency,
} from '@/lib/utils/format-currency';

afterEach(() => vi.restoreAllMocks());

describe('display currency formatting', () => {
  it('converts without rounding the underlying amount', () => {
    expect(convertFromEur(123.456, 1.2345)).toBe(123.456 * 1.2345);
    expect(convertFromEur(-20, 2)).toBe(-40);
  });

  it.each([
    ['EUR', 1, '12.345,60 €'],
    ['USD', 2, '24.691,20 $'],
    ['BTC', 0.00001, '0,123456 ₿'],
    ['ETH', 0.001, '12,3456 Ξ'],
    ['XAUT', 0.0001, '1,23456 ☉'],
  ] as const)(
    'preserves %s standard precision and conversion',
    (currency, rate, expected) => {
      expect(
        formatInCurrency(12345.6, currency, rate).replace(/\u00a0/g, ' '),
      ).toBe(expected);
    },
  );

  it.each([
    [999, '999 €'],
    [1000, '1 mil €'],
    [1500, '1,5 mil €'],
    [999999, '1 M €'],
    [49100000, '49,1 M €'],
    [-49100000, '-49,1 M €'],
    [0, '0 €'],
    [-0, '-0 €'],
  ])(
    'formats compact EUR threshold %s with stable spacing',
    (value, expected) => {
      expect(
        formatInCurrency(value as number, 'EUR', 1, { compact: true }),
      ).toBe(expected);
    },
  );

  it.each([
    ['EUR', '1,2 M €'],
    ['USD', '1,23 M $'],
    ['BTC', '1,23 M ₿'],
    ['ETH', '1,23 M Ξ'],
    ['XAUT', '1,23 M ☉'],
  ] as const)(
    'keeps the existing compact precision for %s',
    (currency, expected) => {
      expect(formatInCurrency(1234567, currency, 1, { compact: true })).toBe(
        expected,
      );
    },
  );

  it('applies absolute formatting before standard and compact conversion', () => {
    expect(
      formatInCurrency(-49100000, 'EUR', 2, { compact: true, absolute: true }),
    ).toBe('98,2 M €');
    expect(formatInCurrency(-3.65, 'USD', 2, { absolute: true })).toBe(
      '7,30 $',
    );
    expect(
      formatInCurrency(-0, 'BTC', 1, { compact: true, absolute: true }),
    ).toBe('0 ₿');
  });

  it.each(['', ' ', '\u00a0', '\u202f'])(
    'normalizes engine literal separator %j without changing number tokens',
    (separator) => {
      const parts: Intl.NumberFormatPart[] = [
        { type: 'minusSign', value: '-' },
        { type: 'integer', value: '49' },
        { type: 'decimal', value: ',' },
        { type: 'fraction', value: '1' },
        ...(separator ? [{ type: 'literal' as const, value: separator }] : []),
        { type: 'compact', value: 'M' },
      ];
      vi.spyOn(Intl.NumberFormat.prototype, 'formatToParts').mockReturnValue(
        parts,
      );
      expect(formatInCurrency(-49100000, 'EUR', 1, { compact: true })).toBe(
        '-49,1 M €',
      );
    },
  );

  it('joins numeric and suffix tokens identically for every display symbol', () => {
    for (const currency of [
      'EUR',
      'USD',
      'BTC',
      'ETH',
      'XAUT',
    ] as DisplayCurrency[]) {
      const value = formatInCurrency(49100000, currency, 1, { compact: true });
      expect(value).toMatch(/^49,1 M [€$₿Ξ☉]$/);
    }
  });
});
