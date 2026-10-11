'use client';

import Link from 'next/link';
import { ArrowUpRight } from '@phosphor-icons/react';
import { useDisplayCurrency } from '@/components/dashboard/display-currency-context';
import type { ProductWithValue } from '@/lib/domain/models/product.types';
import { assetCategoryLabel } from '@/lib/domain/models/asset-category';

/**
 * Shows up to five largest positions as a readable summary, without management dialogs.
 * @param props - Holdings sorted by EUR valuation; no input mutation.
 * @returns A responsive table or first-holding guidance and a management link.
 * Currency formatting follows the current workspace provider.
 */
export function HoldingsPreview({
  products,
}: {
  products: ProductWithValue[];
}) {
  const { format } = useDisplayCurrency();
  return (
    <section aria-labelledby="largest-holdings-title" className="finance-card">
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-5">
        <h2 id="largest-holdings-title" className="text-base font-semibold">
          Largest holdings
        </h2>
        <Link
          href="/dashboard/portfolio"
          prefetch={false}
          className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          View all holdings <ArrowUpRight aria-hidden size={16} />
        </Link>
      </div>
      {products.length ? (
        <table className="w-full table-fixed text-sm">
          <caption className="sr-only">
            Your five largest holdings by current value
          </caption>
          <thead className="border-y border-border bg-surface-secondary text-xs text-muted-foreground">
            <tr>
              <th
                scope="col"
                className="w-[40%] px-3 py-3 sm:px-5 text-left font-medium"
              >
                Holding
              </th>
              <th scope="col" className="px-3 py-3 text-right font-medium">
                Value
              </th>
              <th
                scope="col"
                className="px-3 py-3 sm:px-5 text-right font-medium"
              >
                Gain / loss
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.slice(0, 5).map((product) => {
              const gain = product.currentValueEur - product.investedEur;
              return (
                <tr key={product.id}>
                  <th
                    scope="row"
                    className="px-3 py-4 sm:px-5 text-left font-medium [overflow-wrap:anywhere]"
                  >
                    {product.name}
                    <span className="mt-1 block text-xs font-normal text-muted-foreground">
                      {assetCategoryLabel(product.assetCategory)}
                    </span>
                  </th>
                  <td className="px-3 py-4 text-right tabular-nums [overflow-wrap:anywhere]">
                    <span className="sm:hidden">
                      {format(product.currentValueEur, { compact: true })}
                    </span>
                    <span className="hidden sm:inline">
                      {format(product.currentValueEur)}
                    </span>
                  </td>
                  <td
                    className={`px-3 py-4 sm:px-5 text-right tabular-nums [overflow-wrap:anywhere] ${gain >= 0 ? 'text-gain' : 'text-loss'}`}
                  >
                    {gain > 0 ? '+' : ''}
                    <span className="sm:hidden">
                      {format(gain, { compact: true })}
                    </span>
                    <span className="hidden sm:inline">{format(gain)}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p className="px-5 pb-6 text-sm leading-relaxed text-muted-foreground">
          Add your first holding to start tracking your portfolio. Market assets
          and custom investments live together in Holdings.
        </p>
      )}
    </section>
  );
}
