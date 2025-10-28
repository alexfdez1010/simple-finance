/**
 * Add Yahoo Finance product page
 * @module app/products/add/page
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { validateYahooSymbol } from '@/lib/actions/product-actions';
import { type YahooQuote } from '@/lib/infrastructure/yahoo-finance/server-client';
import { createYahooProduct } from '@/lib/actions/product-actions';

/**
 * Add Yahoo Finance product page component
 *
 * @returns Form page element
 */
export default function AddYahooProductPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    quantity: '',
    purchasePrice: '',
    purchaseDate: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [symbolValidated, setSymbolValidated] = useState(false);
  const [quoteData, setQuoteData] = useState<YahooQuote | null>(null);
  const [symbolValidationLoading, setSymbolValidationLoading] = useState(false);

  const handleSymbolBlur = async () => {
    if (!formData.symbol.trim()) {
      setSymbolValidated(false);
      setQuoteData(null);
      return;
    }

    setSymbolValidationLoading(true);
    setError(null);

    try {
      const quote = await validateYahooSymbol(formData.symbol.toUpperCase());
      if (quote) {
        setSymbolValidated(true);
        setQuoteData(quote);
        // Auto-fill name and purchase price if empty
        if (!formData.name) {
          setFormData({
            ...formData,
            name: quote.shortName || quote.symbol,
            purchasePrice: quote.regularMarketPrice.toString(),
          });
        } else if (!formData.purchasePrice) {
          setFormData({
            ...formData,
            purchasePrice: quote.regularMarketPrice.toString(),
          });
        }
      } else {
        setSymbolValidated(false);
        setQuoteData(null);
        setError('Invalid symbol');
      }
    } catch (err) {
      setSymbolValidated(false);
      setQuoteData(null);
      setError(
        err instanceof Error ? err.message : 'Failed to validate symbol',
      );
    } finally {
      setSymbolValidationLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!symbolValidated) {
      setError('Please validate the stock symbol first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await createYahooProduct(
        formData.name,
        formData.symbol.toUpperCase(),
        parseFloat(formData.quantity),
        parseFloat(formData.purchasePrice),
        new Date(formData.purchaseDate),
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
            Add Yahoo Finance Product
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Track real stocks and assets using Yahoo Finance data
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
                placeholder="e.g., Apple Stock"
                required
              />
            </div>

            {/* Symbol */}
            <div className="mb-6">
              <label
                htmlFor="symbol"
                className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-2"
              >
                Stock Symbol
              </label>
              <input
                type="text"
                id="symbol"
                value={formData.symbol}
                onChange={(e) => {
                  setFormData({ ...formData, symbol: e.target.value });
                  setSymbolValidated(false);
                }}
                onBlur={handleSymbolBlur}
                disabled={symbolValidationLoading}
                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-500 focus:border-transparent uppercase disabled:opacity-50 ${
                  symbolValidated
                    ? 'border-green-500 dark:border-green-500'
                    : 'border-slate-300 dark:border-slate-600'
                }`}
                placeholder="e.g., AAPL"
                required
              />
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Enter the ticker symbol and press Tab to validate (e.g., AAPL
                for Apple, GOOGL for Google)
              </p>
              {symbolValidationLoading && (
                <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">
                  Validating symbol...
                </p>
              )}
              {symbolValidated && quoteData && (
                <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    ✓ Valid symbol: {quoteData.symbol}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Current price: €{quoteData.regularMarketPrice.toFixed(2)}
                  </p>
                </div>
              )}
            </div>

            {/* Purchase Price */}
            <div className="mb-6">
              <label
                htmlFor="purchasePrice"
                className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-2"
              >
                Purchase Price (€)
              </label>
              <input
                type="number"
                id="purchasePrice"
                value={formData.purchasePrice}
                onChange={(e) =>
                  setFormData({ ...formData, purchasePrice: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                placeholder="e.g., 150.25"
                step="0.01"
                min="0.01"
                required
              />
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Price per share in euros (€)
              </p>
            </div>

            {/* Purchase Date */}
            <div className="mb-6">
              <label
                htmlFor="purchaseDate"
                className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-2"
              >
                Purchase Date
              </label>
              <input
                type="date"
                id="purchaseDate"
                value={formData.purchaseDate}
                onChange={(e) =>
                  setFormData({ ...formData, purchaseDate: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                required
              />
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Date when you purchased the shares
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
                placeholder="e.g., 10.5"
                step="0.0000001"
                min="0.0000001"
                required
              />
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Fractional shares are supported
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
      </div>
    </div>
  );
}
