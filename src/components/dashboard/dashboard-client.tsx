/**
 * Dashboard client component - handles real-time updates
 * @module components/dashboard/dashboard-client
 */

'use client';

import { useEffect, useState } from 'react';
import { ProductCard } from '@/components/products/product-card';
import { PortfolioStats } from '@/components/dashboard/portfolio-stats';
import { calculateCustomProductValue } from '@/lib/domain/services/custom-product-calculator';
import { useYahooFinance } from '@/lib/hooks/useYahooFinance';
import { deleteProductAction } from '@/lib/actions/product-actions';
import type { FinancialProduct } from '@/lib/domain/models/product.types';
import Link from 'next/link';

interface DashboardClientProps {
  initialProducts: FinancialProduct[];
}

/**
 * Client component for dashboard with real-time price updates
 * Receives server-rendered products and fetches real-time prices from Yahoo Finance
 *
 * @param props - Component props
 * @returns Dashboard client element
 */
export function DashboardClient({ initialProducts }: DashboardClientProps) {
  const { fetchQuote } = useYahooFinance();
  const [productValues, setProductValues] = useState<Map<string, number>>(
    new Map(),
  );

  // Fetch real-time prices from Yahoo Finance (client-side only)
  useEffect(() => {
    const fetchPrices = async () => {
      const values = new Map<string, number>();

      for (const product of initialProducts) {
        if (product.type === 'YAHOO_FINANCE') {
          // Call Yahoo Finance directly from client
          const quote = await fetchQuote(product.yahoo.symbol);
          if (quote) {
            values.set(product.id, quote.regularMarketPrice);
          } else {
            values.set(product.id, 0);
          }
        } else if (product.type === 'CUSTOM') {
          // Calculate custom product value
          const currentValue = calculateCustomProductValue(
            product.custom.initialInvestment,
            product.custom.annualReturnRate,
            new Date(product.custom.investmentDate),
          );
          values.set(product.id, currentValue);
        }
      }

      setProductValues(values);
    };

    if (initialProducts.length > 0) {
      void fetchPrices();
    }
  }, [initialProducts, fetchQuote]);

  // Handle product deletion
  const handleDelete = async (productId: string) => {
    const result = await deleteProductAction(productId);
    if (!result.success) {
      alert(result.error || 'Failed to delete product');
    }
    // Page will revalidate automatically
  };

  // Calculate portfolio statistics
  const stats = initialProducts.reduce(
    (acc, product) => {
      const currentPrice = productValues.get(product.id) || 0;
      const totalValue = currentPrice * product.quantity;

      acc.totalValue += totalValue;
      acc.productCount += 1;

      if (product.type === 'CUSTOM') {
        const initialInvestment =
          product.custom.initialInvestment * product.quantity;
        acc.totalInvestment += initialInvestment;
      }

      return acc;
    },
    {
      totalValue: 0,
      totalInvestment: 0,
      productCount: 0,
    },
  );

  const totalReturn = stats.totalValue - stats.totalInvestment;
  const totalReturnPercentage =
    stats.totalInvestment > 0 ? (totalReturn / stats.totalInvestment) * 100 : 0;

  return (
    <>
      {/* Portfolio Overview */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mb-8 border border-slate-200 dark:border-slate-700">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Portfolio Overview
        </h2>
        <PortfolioStats
          totalValue={stats.totalValue}
          totalReturn={totalReturn}
          totalReturnPercentage={totalReturnPercentage}
          dailyChange={0}
          dailyChangePercentage={0}
          productCount={stats.productCount}
        />
      </div>

      {/* Products List */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-700">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Your Products
        </h2>

        {initialProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              No products yet. Add your first product to get started!
            </p>
            <Link
              href="/products/add"
              className="inline-block px-6 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
            >
              Add Product
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {initialProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                currentValue={productValues.get(product.id) || 0}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
