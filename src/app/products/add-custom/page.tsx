/**
 * Add custom product page
 * @module app/products/add-custom/page
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createCustomProductAction } from '@/lib/actions/product-actions';

/**
 * Add custom product page component
 *
 * @returns Form page element
 */
export default function AddCustomProductPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    annualReturnRate: '',
    initialInvestment: '',
    investmentDate: '',
    quantity: '1',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await createCustomProductAction(
        formData.name,
        parseFloat(formData.annualReturnRate) / 100,
        parseFloat(formData.initialInvestment),
        new Date(formData.investmentDate),
        parseFloat(formData.quantity),
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to create product');
      }

      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Add Custom Product
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Track investments with fixed annual return rates
          </p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-700">
          <form onSubmit={handleSubmit}>
            {/* Name */}
            <div className="mb-6">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-2"
              >
                Product Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                placeholder="e.g., Savings Account"
                required
              />
            </div>

            {/* Annual Return Rate */}
            <div className="mb-6">
              <label
                htmlFor="annualReturnRate"
                className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-2"
              >
                Annual Return Rate (%)
              </label>
              <input
                type="number"
                id="annualReturnRate"
                value={formData.annualReturnRate}
                onChange={(e) =>
                  setFormData({ ...formData, annualReturnRate: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                placeholder="e.g., 5.0"
                step="0.01"
                required
              />
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Enter the annual return rate as a percentage (e.g., 5 for 5%)
              </p>
            </div>

            {/* Initial Investment */}
            <div className="mb-6">
              <label
                htmlFor="initialInvestment"
                className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-2"
              >
                Initial Investment (€)
              </label>
              <input
                type="number"
                id="initialInvestment"
                value={formData.initialInvestment}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    initialInvestment: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                placeholder="e.g., 10000"
                step="0.01"
                min="0.01"
                required
              />
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Enter amount in euros (€)
              </p>
            </div>

            {/* Investment Date */}
            <div className="mb-6">
              <label
                htmlFor="investmentDate"
                className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-2"
              >
                Investment Date
              </label>
              <input
                type="date"
                id="investmentDate"
                value={formData.investmentDate}
                onChange={(e) =>
                  setFormData({ ...formData, investmentDate: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                required
              />
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Date when the investment started
              </p>
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <label
                htmlFor="quantity"
                className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-2"
              >
                Quantity
              </label>
              <input
                type="number"
                id="quantity"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                placeholder="e.g., 1"
                step="0.01"
                min="0.01"
                required
              />
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Number of units (usually 1 for custom products)
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Adding Product...' : 'Add Product'}
              </button>
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
            How it works
          </h3>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Custom products use compound interest to calculate daily values. The
            formula is: A = P(1 + r/365)^days, where P is your initial
            investment, r is the annual return rate, and days is the number of
            days since investment.
          </p>
        </div>
      </div>
    </div>
  );
}
