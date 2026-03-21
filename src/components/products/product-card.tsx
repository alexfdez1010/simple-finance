/**
 * Product card component for displaying financial product information
 * @module components/products/product-card
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { FinancialProduct } from '@/lib/domain/models/product.types';

interface ProductCardProps {
  product: FinancialProduct;
  currentValue?: number;
  onDelete?: (id: string) => void;
}

/**
 * Formats currency value in EUR
 *
 * @param value - Value to format
 * @returns Formatted currency string in EUR
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}

/**
 * Formats percentage value
 *
 * @param value - Value to format
 * @returns Formatted percentage string
 */
function formatPercentage(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

/**
 * Product card component with refined design
 *
 * @param props - Component props
 * @returns Product card element
 */
export function ProductCard({
  product,
  currentValue = 0,
  onDelete,
}: ProductCardProps) {
  const isYahoo = product.type === 'YAHOO_FINANCE';
  const totalValue = currentValue * product.quantity;
  const [dateString, setDateString] = useState('');

  let returnValue = 0;
  let returnPct = 0;
  let initialInvestment = 0;

  if (isYahoo && product.yahoo) {
    initialInvestment = product.yahoo.purchasePrice * product.quantity;
  } else if (!isYahoo && product.custom) {
    initialInvestment = product.custom.initialInvestment * product.quantity;
  }
  returnValue = totalValue - initialInvestment;
  returnPct =
    initialInvestment > 0 ? (returnValue / initialInvestment) * 100 : 0;

  const isPositive = returnValue >= 0;

  useEffect(() => {
    setDateString(new Date(product.createdAt).toLocaleDateString());
  }, [product.createdAt]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg glass-card p-5 border border-border shadow-sm hover:shadow-md transition-all duration-200">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="min-w-0 flex-1 mr-2">
          <h3 className="text-base font-semibold text-foreground truncate">
            {product.name}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isYahoo ? `Symbol: ${product.yahoo.symbol}` : 'Custom Product'}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/products/edit/${product.id}`}
            className="text-sm font-medium text-primary hover:opacity-80 transition-opacity"
            aria-label="Edit product"
          >
            Edit
          </Link>
          {onDelete && (
            <button
              onClick={() => onDelete(product.id)}
              className="text-sm font-medium text-destructive hover:opacity-80 transition-opacity"
              aria-label="Delete product"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
            Quantity
          </p>
          <p className="text-sm font-semibold text-foreground tabular-nums">
            {product.quantity}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
            {isYahoo ? 'Unit Price' : 'Annual Rate'}
          </p>
          <p className="text-sm font-semibold text-foreground tabular-nums">
            {isYahoo
              ? formatCurrency(currentValue)
              : formatPercentage(product.custom.annualReturnRate * 100)}
          </p>
        </div>
      </div>

      {/* Current Value */}
      <div className="mb-3">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
          Current Value
        </p>
        <p className="text-2xl font-bold text-foreground tabular-nums">
          {formatCurrency(totalValue)}
        </p>
      </div>

      {/* Return */}
      <div className="flex justify-between items-center pt-3 border-t border-border">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
            Return
          </p>
          <p
            className={`text-sm font-semibold tabular-nums ${isPositive ? 'text-gain' : 'text-loss'}`}
          >
            {formatCurrency(returnValue)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
            Return %
          </p>
          <p
            className={`text-sm font-semibold tabular-nums ${isPositive ? 'text-gain' : 'text-loss'}`}
          >
            {formatPercentage(returnPct)}
          </p>
        </div>
      </div>

      {/* Footer */}
      <p className="text-[10px] text-muted-foreground mt-3">
        Added {dateString}
      </p>
    </div>
  );
}
