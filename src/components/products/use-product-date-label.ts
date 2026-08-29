/** Client-safe date label for product cards. */
'use client';

import { useCallback, useSyncExternalStore } from 'react';
import type { FinancialProduct } from '@/lib/domain/models/product.types';

/** Provides a no-op subscription for a hydration-safe client snapshot. */
function subscribe(): () => void {
  return () => undefined;
}

/** Returns the empty server label used to avoid locale hydration mismatches. */
function getServerSnapshot(): string {
  return '';
}

/**
 * Formats a product's first relevant date after hydration.
 *
 * @param product - Product whose purchase or first contribution date is shown.
 * @returns Localized date label, or an empty string when no date exists.
 */
export function useProductDateLabel(product: FinancialProduct): string {
  const getSnapshot = useCallback(() => {
    const date =
      product.type === 'YAHOO_FINANCE'
        ? product.yahoo.purchaseDate
        : product.custom.contributions[0]?.date;

    if (!date) return '';

    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, [product]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
