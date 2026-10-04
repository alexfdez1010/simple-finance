import type { ProductWithValue } from '@/lib/domain/models/product.types';

export type HoldingsSort = 'value' | 'gain' | 'name';

/**
 * Filters holdings by name, ticker or native currency, then sorts a new array.
 * @param products - Readonly enriched holdings; never mutated.
 * @param query - Case-insensitive substring; blank or whitespace matches all.
 * @param sort - Value and absolute EUR gain descend; names ascend.
 * @returns Matching holdings in the requested order, without side effects.
 */
export function queryHoldings(
  products: readonly ProductWithValue[],
  query: string,
  sort: HoldingsSort,
): ProductWithValue[] {
  const search = query.trim().toLowerCase();
  return products
    .filter((product) => {
      const identifier =
        product.type === 'YAHOO_FINANCE'
          ? product.yahoo.symbol
          : product.custom.currency;
      return `${product.name} ${identifier}`.toLowerCase().includes(search);
    })
    .sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'gain') {
        return (
          b.currentValueEur -
          b.investedEur -
          (a.currentValueEur - a.investedEur)
        );
      }
      return b.currentValueEur - a.currentValueEur;
    });
}
