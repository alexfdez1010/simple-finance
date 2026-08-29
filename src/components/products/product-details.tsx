/** Metric definitions displayed in a product card. */

import { DetailItem } from '@/components/products/detail-item';
import { calculateNetInvestedFromContributions } from '@/lib/domain/services/custom-product-calculator';
import {
  formatInCurrency,
  type DisplayCurrency,
} from '@/lib/utils/format-currency';
import type { FinancialProduct } from '@/lib/domain/models/product.types';

interface ProductDetailsProps {
  product: FinancialProduct;
  currentValue: number;
  expectedAnnualReturn?: number | null;
  formatCurrency: (value: number) => string;
}

/** Formats a percentage with an explicit positive sign. */
function formatPercentage(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

/** Returns the semantic color for an optional return value. */
function getReturnTone(value?: number | null): string | undefined {
  if (value == null) return undefined;
  return value >= 0 ? 'text-gain' : 'text-loss';
}

/**
 * Renders type-specific product metrics as a definition list.
 *
 * @param props - Product, price, expected return, and currency formatter.
 * @returns Four compact metric definitions.
 */
export function ProductDetails({
  product,
  currentValue,
  expectedAnnualReturn,
  formatCurrency,
}: ProductDetailsProps) {
  const expectedReturn =
    expectedAnnualReturn == null
      ? '—'
      : formatPercentage(expectedAnnualReturn * 100);

  if (product.type === 'YAHOO_FINANCE') {
    return (
      <dl className="mt-auto grid grid-cols-2 gap-x-3 gap-y-3">
        <DetailItem label="Quantity" value={String(product.quantity)} />
        <DetailItem
          label="Current price"
          value={formatCurrency(currentValue)}
        />
        <DetailItem
          label="Avg. purchase"
          value={formatCurrency(product.yahoo.purchasePrice)}
        />
        <DetailItem
          label="Expected return"
          value={expectedReturn}
          className={getReturnTone(expectedAnnualReturn)}
        />
      </dl>
    );
  }

  return (
    <dl className="mt-auto grid grid-cols-2 gap-x-3 gap-y-3">
      <DetailItem
        label="Annual rate"
        value={formatPercentage(product.custom.annualReturnRate * 100)}
      />
      <DetailItem
        label="Expected return"
        value={expectedReturn}
        className={getReturnTone(expectedAnnualReturn)}
      />
      <DetailItem
        label="Net investment"
        value={formatInCurrency(
          calculateNetInvestedFromContributions(product.custom.contributions),
          product.custom.currency as DisplayCurrency,
          1,
        )}
      />
      <DetailItem label="Currency" value={product.custom.currency} />
    </dl>
  );
}
