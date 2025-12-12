/**
 * Dashboard page - Server Component
 * Fetches data on the server, passes to client component for real-time updates
 * @module app/dashboard/page
 */

import { getProducts } from '@/lib/actions/product-actions';
import { DashboardClient } from '@/components/dashboard/dashboard-client';
import { fetchYahooQuoteServer } from '@/lib/infrastructure/yahoo-finance/server-client';
import { calculateCustomProductValue } from '@/lib/domain/services/custom-product-calculator';
import { getPortfolioSnapshotsLastNDays } from '@/lib/infrastructure/database/portfolio-snapshot-repository';
import Link from 'next/link';
import type { FinancialProduct } from '@/lib/domain/models/product.types';

/**
 * Product with enriched current value data
 */
type ProductWithValue = FinancialProduct & {
  currentValue: number;
};

// Revalidate this page every 60 seconds
export const revalidate = 60;

/**
 * Dashboard page component - Server Component
 * Fetches product data and current prices on the server
 *
 * @returns Dashboard page element
 */
export default async function DashboardPage() {
  // Fetch products on the server
  const products = await getProducts();

  // Fetch current prices for all products on the server (all values in EUR)
  const productsWithValues: ProductWithValue[] = await Promise.all(
    products.map(async (product) => {
      let currentValue = 0;

      if (product.type === 'YAHOO_FINANCE') {
        // Fetch real-time price from Yahoo Finance on server (converted to EUR)
        const quote = await fetchYahooQuoteServer(product.yahoo.symbol);
        currentValue = quote ? quote.regularMarketPrice : 0;
      } else if (product.type === 'CUSTOM') {
        // Calculate custom product value (converted to EUR)
        currentValue = await calculateCustomProductValue(
          product.custom.initialInvestment,
          product.custom.annualReturnRate,
          new Date(product.custom.investmentDate),
        );
      }

      return {
        ...product,
        currentValue,
      };
    }),
  );

  // Sort products by total current value (currentValue * quantity) in descending order
  productsWithValues.sort((a, b) => {
    const totalValueA = a.currentValue * a.quantity;
    const totalValueB = b.currentValue * b.quantity;
    return totalValueB - totalValueA;
  });

  // Fetch portfolio snapshots for the last 30 days
  const snapshots = await getPortfolioSnapshotsLastNDays(30);

  // Prepare chart data
  const evolutionData = snapshots.map((snapshot) => ({
    date: snapshot.date.toISOString().split('T')[0],
    value: snapshot.value,
  }));

  // Calculate daily changes
  const dailyChanges = [];
  for (let i = 1; i < snapshots.length; i++) {
    const change = snapshots[i].value - snapshots[i - 1].value;
    dailyChanges.push({
      date: snapshots[i].date.toISOString().split('T')[0],
      change,
    });
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
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

        {/* Client Component for interactivity */}
        <DashboardClient
          productsWithValues={productsWithValues}
          evolutionData={evolutionData}
          dailyChanges={dailyChanges}
        />
      </div>
    </div>
  );
}
