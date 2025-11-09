/**
 * Product card component for displaying financial product information
 * @module components/products/product-card
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { FinancialProduct } from '@/lib/domain/models/product.types';

/**
 * Product card props
 */
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
 * Product card component
 *
 * @param props - Component props
 * @returns Product card element
 */
export function ProductCard({
  product,
  currentValue = 0,
  onDelete,
}: ProductCardProps) {
  const isYahooFinance = product.type === 'YAHOO_FINANCE';
  const totalValue = currentValue * product.quantity;
  const [dateString, setDateString] = useState('');

  let returnValue = 0;
  let returnPercentage = 0;
  let initialInvestment = 0;

  if (isYahooFinance && product.yahoo) {
    initialInvestment = product.yahoo.purchasePrice * product.quantity;
    returnValue = totalValue - initialInvestment;
    returnPercentage =
      initialInvestment > 0 ? (returnValue / initialInvestment) * 100 : 0;
  } else if (!isYahooFinance && product.custom) {
    initialInvestment = product.custom.initialInvestment * product.quantity;
    returnValue = totalValue - initialInvestment;
    returnPercentage =
      initialInvestment > 0 ? (returnValue / initialInvestment) * 100 : 0;
  }

  // Render date on client to avoid hydration mismatch
  useEffect(() => {
    setDateString(new Date(product.createdAt).toLocaleDateString());
  }, [product.createdAt]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {product.name}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {isYahooFinance
              ? `Symbol: ${product.yahoo.symbol}`
              : 'Custom Product'}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/products/edit/${product.id}`}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
            aria-label="Edit product"
          >
            Edit
          </Link>
          {onDelete && (
            <button
              onClick={() => onDelete(product.id)}
              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
              aria-label="Delete product"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Quantity */}
      <div className="mb-4">
        <p className="text-sm text-slate-600 dark:text-slate-400">Quantity</p>
        <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
          {product.quantity}
        </p>
      </div>

      {/* Value */}
      <div className="mb-4">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Current Value
        </p>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {formatCurrency(totalValue)}
        </p>
      </div>

      {/* Return (Both Yahoo Finance and Custom products) */}
      {(isYahooFinance || product.custom) && (
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Return
              </p>
              <p
                className={`text-lg font-semibold ${
                  returnValue >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {formatCurrency(returnValue)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Return %
              </p>
              <p
                className={`text-lg font-semibold ${
                  returnPercentage >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {formatPercentage(returnPercentage)}
              </p>
            </div>
          </div>
          {!isYahooFinance && product.custom && (
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Annual Rate
              </p>
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {formatPercentage(product.custom.annualReturnRate * 100)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Metadata */}
      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Added {dateString}
        </p>
      </div>
    </div>
  );
}
