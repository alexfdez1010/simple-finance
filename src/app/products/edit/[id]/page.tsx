/**
 * Edit product page
 * @module app/products/edit/[id]/page
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  getProduct,
  updateYahooProductAction,
  updateCustomProductAction,
} from '@/lib/actions/product-actions';
import type { FinancialProduct } from '@/lib/domain/models/product.types';

/**
 * Edit product page component
 *
 * @returns Form page element
 */
export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<FinancialProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Yahoo Finance form data
  const [yahooFormData, setYahooFormData] = useState({
    name: '',
    quantity: '',
    purchasePrice: '',
    purchaseDate: '',
  });

  // Custom product form data
  const [customFormData, setCustomFormData] = useState({
    name: '',
    quantity: '',
    annualReturnRate: '',
    initialInvestment: '',
    investmentDate: '',
  });

  useEffect(() => {
    async function loadProduct() {
      try {
        const fetchedProduct = await getProduct(productId);
        if (!fetchedProduct) {
          setError('Product not found');
          setLoading(false);
          return;
        }

        setProduct(fetchedProduct);

        if (fetchedProduct.type === 'YAHOO_FINANCE') {
          setYahooFormData({
            name: fetchedProduct.name,
            quantity: fetchedProduct.quantity.toString(),
            purchasePrice: fetchedProduct.yahoo.purchasePrice.toString(),
            purchaseDate: new Date(fetchedProduct.yahoo.purchaseDate)
              .toISOString()
              .split('T')[0],
          });
        } else {
          setCustomFormData({
            name: fetchedProduct.name,
            quantity: fetchedProduct.quantity.toString(),
            annualReturnRate: (
              fetchedProduct.custom.annualReturnRate * 100
            ).toString(),
            initialInvestment:
              fetchedProduct.custom.initialInvestment.toString(),
            investmentDate: new Date(fetchedProduct.custom.investmentDate)
              .toISOString()
              .split('T')[0],
          });
        }

        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load product');
        setLoading(false);
      }
    }

    loadProduct();
  }, [productId]);

  const handleYahooSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const result = await updateYahooProductAction(
        productId,
        yahooFormData.name,
        parseFloat(yahooFormData.quantity),
        parseFloat(yahooFormData.purchasePrice),
        new Date(yahooFormData.purchaseDate),
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to update product');
      }

      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product');
      setSubmitting(false);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const result = await updateCustomProductAction(
        productId,
        customFormData.name,
        parseFloat(customFormData.quantity),
        parseFloat(customFormData.annualReturnRate) / 100,
        parseFloat(customFormData.initialInvestment),
        new Date(customFormData.investmentDate),
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to update product');
      }

      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
        <div className="max-w-2xl mx-auto">
          <p className="text-center text-slate-600 dark:text-slate-400">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
          <Link
            href="/dashboard"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Edit Product
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            {product.type === 'YAHOO_FINANCE'
              ? `Yahoo Finance - ${product.yahoo.symbol}`
              : 'Custom Product'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Yahoo Finance Form */}
        {product.type === 'YAHOO_FINANCE' && (
          <form
            onSubmit={handleYahooSubmit}
            className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 space-y-6"
          >
            {/* Symbol (Read-only) */}
            <div>
              <label
                htmlFor="symbol"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                Stock Symbol
              </label>
              <input
                type="text"
                id="symbol"
                value={product.yahoo.symbol}
                disabled
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed"
              />
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Symbol cannot be changed
              </p>
            </div>

            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                Product Name
              </label>
              <input
                type="text"
                id="name"
                value={yahooFormData.name}
                onChange={(e) =>
                  setYahooFormData({ ...yahooFormData, name: e.target.value })
                }
                required
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
              />
            </div>

            {/* Quantity */}
            <div>
              <label
                htmlFor="quantity"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                Quantity
              </label>
              <input
                type="number"
                id="quantity"
                value={yahooFormData.quantity}
                onChange={(e) =>
                  setYahooFormData({
                    ...yahooFormData,
                    quantity: e.target.value,
                  })
                }
                step="0.01"
                min="0.01"
                required
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
              />
            </div>

            {/* Purchase Price */}
            <div>
              <label
                htmlFor="purchasePrice"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                Purchase Price (€)
              </label>
              <input
                type="number"
                id="purchasePrice"
                value={yahooFormData.purchasePrice}
                onChange={(e) =>
                  setYahooFormData({
                    ...yahooFormData,
                    purchasePrice: e.target.value,
                  })
                }
                step="0.01"
                min="0.01"
                required
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
              />
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Price per share in euros
              </p>
            </div>

            {/* Purchase Date */}
            <div>
              <label
                htmlFor="purchaseDate"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                Purchase Date
              </label>
              <input
                type="date"
                id="purchaseDate"
                value={yahooFormData.purchaseDate}
                onChange={(e) =>
                  setYahooFormData({
                    ...yahooFormData,
                    purchaseDate: e.target.value,
                  })
                }
                required
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {submitting ? 'Updating...' : 'Update Product'}
              </button>
              <Link
                href="/dashboard"
                className="flex-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100 font-medium py-2 px-4 rounded-lg transition-colors text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        )}

        {/* Custom Product Form */}
        {product.type === 'CUSTOM' && (
          <form
            onSubmit={handleCustomSubmit}
            className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 space-y-6"
          >
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                Product Name
              </label>
              <input
                type="text"
                id="name"
                value={customFormData.name}
                onChange={(e) =>
                  setCustomFormData({ ...customFormData, name: e.target.value })
                }
                required
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
              />
            </div>

            {/* Quantity */}
            <div>
              <label
                htmlFor="quantity"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                Quantity
              </label>
              <input
                type="number"
                id="quantity"
                value={customFormData.quantity}
                onChange={(e) =>
                  setCustomFormData({
                    ...customFormData,
                    quantity: e.target.value,
                  })
                }
                step="0.01"
                min="0.01"
                required
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
              />
            </div>

            {/* Annual Return Rate */}
            <div>
              <label
                htmlFor="annualReturnRate"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                Annual Return Rate (%)
              </label>
              <input
                type="number"
                id="annualReturnRate"
                value={customFormData.annualReturnRate}
                onChange={(e) =>
                  setCustomFormData({
                    ...customFormData,
                    annualReturnRate: e.target.value,
                  })
                }
                step="0.01"
                min="0"
                max="100"
                required
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
              />
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Expected annual return percentage
              </p>
            </div>

            {/* Initial Investment */}
            <div>
              <label
                htmlFor="initialInvestment"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                Initial Investment (€)
              </label>
              <input
                type="number"
                id="initialInvestment"
                value={customFormData.initialInvestment}
                onChange={(e) =>
                  setCustomFormData({
                    ...customFormData,
                    initialInvestment: e.target.value,
                  })
                }
                step="0.01"
                min="0.01"
                required
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
              />
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Enter amount in euros (€)
              </p>
            </div>

            {/* Investment Date */}
            <div>
              <label
                htmlFor="investmentDate"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                Investment Date
              </label>
              <input
                type="date"
                id="investmentDate"
                value={customFormData.investmentDate}
                onChange={(e) =>
                  setCustomFormData({
                    ...customFormData,
                    investmentDate: e.target.value,
                  })
                }
                required
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
              />
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Note:</strong> Custom products use compound interest
                calculated daily based on the annual return rate.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {submitting ? 'Updating...' : 'Update Product'}
              </button>
              <Link
                href="/dashboard"
                className="flex-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100 font-medium py-2 px-4 rounded-lg transition-colors text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
