/**
 * Interactive dashboard page with real-time data
 * @module app/dashboard/page
 */

'use client';

import { useProducts } from '@/lib/hooks/use-products';
import { ProductCard } from '@/components/products/product-card';
import { PortfolioStats } from '@/components/dashboard/portfolio-stats';
import { calculateCustomProductValue } from '@/lib/domain/services/custom-product-calculator';
import Link from 'next/link';
import { useEffect, useState } from 'react';

/**
 * Dashboard page component with live data
 *
 * @returns Dashboard page element
 */
export default function DashboardPage() {
  const { products, loading, error, deleteProduct } = useProducts();
  const [productValues, setProductValues] = useState<Map<string, number>>(
    new Map(),
  );

  // Calculate current values for all products
  useEffect(() => {
    const calculateValues = async () => {
      const values = new Map<string, number>();

      for (const product of products) {
        if (product.type === 'YAHOO_FINANCE') {
          try {
            const response = await fetch(
              `/api/yahoo/quote?symbol=${product.yahoo.symbol}`,
            );
            if (response.ok) {
              const data = await response.json();
              values.set(product.id, data.quote.regularMarketPrice);
            }
          } catch {
            values.set(product.id, 0);
          }
        } else if (product.type === 'CUSTOM') {
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

    if (products.length > 0) {
      void calculateValues();
    }
  }, [products]);

  // Calculate portfolio statistics
  const stats = products.reduce(
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="text-center py-12">
            <p className="text-slate-600 dark:text-slate-400">
              Loading portfolio...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400">Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Simple Finance
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Track your financial products and portfolio performance
          </p>
        </header>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link
            href="/products/add"
            className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-slate-200 dark:border-slate-700"
          >
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Add Yahoo Finance Product
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Track real stocks and assets using Yahoo Finance data
            </p>
          </Link>

          <Link
            href="/products/add-custom"
            className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-slate-200 dark:border-slate-700"
          >
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Add Custom Product
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Track investments with fixed annual return rates
            </p>
          </Link>
        </div>

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

          {products.length === 0 ? (
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
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  currentValue={productValues.get(product.id) || 0}
                  onDelete={deleteProduct}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-slate-600 dark:text-slate-400">
          <p>Built with Next.js, React, TypeScript, TailwindCSS, and Prisma</p>
        </footer>
      </div>
    </div>
  );
}
