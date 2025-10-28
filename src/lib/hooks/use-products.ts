/**
 * React hook for managing financial products
 * @module hooks/use-products
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { FinancialProduct } from '@/lib/domain/models/product.types';

/**
 * Hook state interface
 */
interface UseProductsState {
  products: FinancialProduct[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook return interface
 */
interface UseProductsReturn extends UseProductsState {
  refetch: () => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
}

/**
 * Custom hook for fetching and managing products
 *
 * @returns Products state and actions
 */
export function useProducts(): UseProductsReturn {
  const [state, setState] = useState<UseProductsState>({
    products: [],
    loading: true,
    error: null,
  });

  const fetchProducts = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await fetch('/api/products');

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();

      setState({
        products: data.products || [],
        loading: false,
        error: null,
      });
    } catch (error) {
      setState({
        products: [],
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, []);

  const deleteProduct = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(`/api/products/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete product');
        }

        await fetchProducts();
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error ? error.message : 'Failed to delete product',
        }));
      }
    },
    [fetchProducts],
  );

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  return {
    ...state,
    refetch: fetchProducts,
    deleteProduct,
  };
}
