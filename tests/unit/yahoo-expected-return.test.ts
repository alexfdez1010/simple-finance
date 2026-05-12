/**
 * Unit tests for the Yahoo expected-return geometric-mean helper.
 * @module tests/unit/yahoo-expected-return
 */

import { describe, expect, it } from 'vitest';
import {
  computeAnnualGeomReturn,
  samplesFromChartQuotes,
} from '@/lib/domain/services/yahoo-expected-return';

describe('computeAnnualGeomReturn', () => {
  it('returns null when fewer than two positive samples', () => {
    expect(computeAnnualGeomReturn([])).toBeNull();
    expect(
      computeAnnualGeomReturn([{ date: new Date('2020-01-01'), value: 100 }]),
    ).toBeNull();
    expect(
      computeAnnualGeomReturn([
        { date: new Date('2020-01-01'), value: 0 },
        { date: new Date('2021-01-01'), value: 110 },
      ]),
    ).toBeNull();
  });

  it('returns null when total span is zero days', () => {
    expect(
      computeAnnualGeomReturn([
        { date: new Date('2020-01-01'), value: 100 },
        { date: new Date('2020-01-01'), value: 200 },
      ]),
    ).toBeNull();
  });

  it('annualises a single-year doubling to 100%', () => {
    const r = computeAnnualGeomReturn([
      { date: new Date('2020-01-01'), value: 100 },
      { date: new Date('2021-01-01'), value: 200 },
    ]);
    expect(r).not.toBeNull();
    expect(r as number).toBeCloseTo(1, 2);
  });

  it('annualises a 5-year doubling to ~14.87%', () => {
    // 2^(1/5) - 1 ≈ 0.1487
    const r = computeAnnualGeomReturn([
      { date: new Date('2020-01-01'), value: 100 },
      { date: new Date('2025-01-01'), value: 200 },
    ]);
    expect(r).not.toBeNull();
    expect(r as number).toBeCloseTo(0.1487, 3);
  });

  it('returns negative CAGR when value declines', () => {
    // 100 → 50 over 1 year → -50%
    const r = computeAnnualGeomReturn([
      { date: new Date('2020-01-01'), value: 100 },
      { date: new Date('2021-01-01'), value: 50 },
    ]);
    expect(r).not.toBeNull();
    expect(r as number).toBeCloseTo(-0.5, 2);
  });

  it('uses only the first and last positive samples', () => {
    // Intermediate noise should not affect the geomean
    const r = computeAnnualGeomReturn([
      { date: new Date('2020-01-01'), value: 100 },
      { date: new Date('2020-06-01'), value: 1000 },
      { date: new Date('2020-09-01'), value: 10 },
      { date: new Date('2021-01-01'), value: 110 },
    ]);
    expect(r).not.toBeNull();
    expect(r as number).toBeCloseTo(0.1, 2);
  });
});

describe('samplesFromChartQuotes', () => {
  it('prefers adjclose over close', () => {
    const out = samplesFromChartQuotes([
      { date: new Date('2020-01-01'), close: 100, adjclose: 95 },
      { date: new Date('2021-01-01'), close: 110, adjclose: 108 },
    ]);
    expect(out).toEqual([
      { date: new Date('2020-01-01'), value: 95 },
      { date: new Date('2021-01-01'), value: 108 },
    ]);
  });

  it('falls back to close when adjclose is missing', () => {
    const out = samplesFromChartQuotes([
      { date: new Date('2020-01-01'), close: 100 },
      { date: new Date('2021-01-01'), close: 110, adjclose: null },
    ]);
    expect(out).toEqual([
      { date: new Date('2020-01-01'), value: 100 },
      { date: new Date('2021-01-01'), value: 110 },
    ]);
  });

  it('drops samples with no usable price', () => {
    const out = samplesFromChartQuotes([
      { date: new Date('2020-01-01'), close: null },
      { date: new Date('2020-02-01'), close: 0, adjclose: null },
      { date: new Date('2020-03-01'), close: 100 },
    ]);
    expect(out).toEqual([{ date: new Date('2020-03-01'), value: 100 }]);
  });
});
