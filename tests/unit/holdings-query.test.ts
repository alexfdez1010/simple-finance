import { describe, expect, it } from 'vitest';
import { queryHoldings } from '@/components/dashboard/holdings-query';
import { createHoldingsFixtures } from './holdings-fixtures';

describe('queryHoldings', () => {
  it.each([
    ['  zEn  ', ['reserve']],
    ['AapL', ['shares']],
    ['  bTc ', ['reserve']],
    ['eur', ['bonds']],
    ['SHARES', ['shares']],
    ['missing', []],
  ])('matches names, tickers and native currencies for %s', (query, ids) => {
    expect(
      queryHoldings(createHoldingsFixtures(), query, 'value').map(
        (holding) => holding.id,
      ),
    ).toEqual(ids);
  });

  it.each([
    ['value', ['shares', 'reserve', 'bonds']],
    ['gain', ['reserve', 'shares', 'bonds']],
    ['name', ['shares', 'bonds', 'reserve']],
  ] as const)(
    'sorts by %s without changing the original collection',
    (sort, ids) => {
      const holdings = createHoldingsFixtures();
      const original = structuredClone(holdings);
      const result = queryHoldings(Object.freeze(holdings), '   ', sort);

      expect(result.map((holding) => holding.id)).toEqual(ids);
      expect(holdings).toEqual(original);
      expect(result).not.toBe(holdings);
      expect(result[0]).toBe(holdings.find((holding) => holding.id === ids[0]));
    },
  );

  it('sorts the matching subset and handles an empty portfolio', () => {
    const holdings = createHoldingsFixtures();
    expect(
      queryHoldings(holdings, 'a', 'gain').map((holding) => holding.id),
    ).toEqual(['shares', 'bonds']);
    expect(queryHoldings([], '', 'value')).toEqual([]);
  });
});
