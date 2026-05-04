/**
 * Product card. Yahoo cards display in the user-selected display currency
 * (since Yahoo prices are stored in EUR). Custom cards display in the
 * product's own currency so the numbers shown match what the user typed
 * for each contribution — the EUR-converted totals exist only for the
 * portfolio-level aggregations on the dashboard.
 *
 * @module components/products/product-card
 */

'use client';

import { useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DetailItem } from '@/components/products/detail-item';
import { useDisplayCurrency } from '@/components/dashboard/display-currency-context';
import {
  formatInCurrency,
  type DisplayCurrency,
} from '@/lib/utils/format-currency';
import type { FinancialProduct } from '@/lib/domain/models/product.types';

interface ProductCardProps {
  product: FinancialProduct;
  currentValue?: number;
  /** Total current value in EUR (already includes quantity). */
  currentValueEur?: number;
  /** Total net invested in EUR (signed, already includes quantity). */
  investedEur?: number;
  /** Total current value in product currency (already includes quantity). */
  currentValueProductCcy?: number;
  /** Total net invested in product currency (already includes quantity). */
  investedProductCcy?: number;
  onEdit?: (product: FinancialProduct) => void;
  onDelete?: (product: FinancialProduct) => void;
}

const PRODUCT_CURRENCIES: DisplayCurrency[] = [
  'EUR',
  'USD',
  'BTC',
  'ETH',
  'XAUT',
];

/** Formats percentage value with sign */
function formatPercentage(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

/**
 * Formatter for amounts already denominated in the product's own currency.
 * Bypasses the display-currency conversion entirely (rate = 1).
 */
function makeProductFormatter(currency: string) {
  const code = (
    PRODUCT_CURRENCIES.includes(currency as DisplayCurrency) ? currency : 'EUR'
  ) as DisplayCurrency;
  return (amount: number) => formatInCurrency(amount, code, 1);
}

/**
 * Product card with enhanced visual design and dialog-based actions.
 *
 * @param props - Component props
 * @returns Product card element
 */
export function ProductCard({
  product,
  currentValue = 0,
  currentValueEur,
  investedEur,
  currentValueProductCcy,
  investedProductCcy,
  onEdit,
  onDelete,
}: ProductCardProps) {
  const { format: formatDisplay } = useDisplayCurrency();
  const isYahoo = product.type === 'YAHOO_FINANCE';
  const [dateString, setDateString] = useState('');

  const formatCurrency = isYahoo
    ? formatDisplay
    : makeProductFormatter(product.custom.currency);

  const totalValue = isYahoo
    ? (currentValueEur ?? currentValue * product.quantity)
    : (currentValueProductCcy ?? 0);

  const fallbackInvested = isYahoo
    ? product.yahoo.purchasePrice * product.quantity
    : 0;
  const invested = isYahoo
    ? (investedEur ?? fallbackInvested)
    : (investedProductCcy ?? 0);
  const returnValue = totalValue - invested;
  const returnPct = invested > 0 ? (returnValue / invested) * 100 : 0;
  const isPositive = returnValue >= 0;

  useEffect(() => {
    const date = isYahoo
      ? product.yahoo.purchaseDate
      : product.custom.contributions[0]?.date;
    if (!date) {
      setDateString('');
      return;
    }
    setDateString(
      new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    );
  }, [product, isYahoo]);

  return (
    <div className="group bg-card rounded-xl glass-card p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 h-full flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div className="min-w-0 flex-1 mr-2">
          <h3 className="text-base font-semibold text-foreground truncate">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-[10px]">
              {isYahoo ? product.yahoo.symbol : product.custom.currency}
            </Badge>
            <span className="text-[10px] text-muted-foreground">
              {dateString}
            </span>
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {onEdit && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onEdit(product)}
              aria-label="Edit product"
            >
              <Pencil />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onDelete(product)}
              aria-label="Delete product"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 />
            </Button>
          )}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-2xl font-bold text-foreground tabular-nums">
          {formatCurrency(totalValue)}
        </p>
        <p
          className={`text-sm font-semibold tabular-nums mt-0.5 ${isPositive ? 'text-gain' : 'text-loss'}`}
        >
          {formatCurrency(returnValue)} ({formatPercentage(returnPct)})
        </p>
      </div>

      <div className="grid grid-cols-2 gap-y-2.5 gap-x-3 mt-auto text-center">
        <DetailItem label="Quantity" value={String(product.quantity)} />
        {isYahoo ? (
          <>
            <DetailItem
              label="Current Price"
              value={formatCurrency(currentValue)}
            />
            <DetailItem
              label="Avg. Purchase"
              value={formatCurrency(product.yahoo.purchasePrice)}
            />
            <DetailItem
              label="Price Change"
              value={formatCurrency(currentValue - product.yahoo.purchasePrice)}
              className={
                currentValue >= product.yahoo.purchasePrice
                  ? 'text-gain'
                  : 'text-loss'
              }
            />
          </>
        ) : (
          <>
            <DetailItem
              label="Annual Rate"
              value={formatPercentage(product.custom.annualReturnRate * 100)}
            />
            <DetailItem
              label="Net Investment"
              value={formatCurrency(invested)}
            />
            <DetailItem label="Currency" value={product.custom.currency} />
            <DetailItem
              label="Movements"
              value={String(product.custom.contributions.length)}
            />
          </>
        )}
      </div>
    </div>
  );
}
