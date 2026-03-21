/**
 * Symbol validation feedback display
 * @module components/products/symbol-validator
 */

'use client';

import { type YahooQuote } from '@/lib/infrastructure/yahoo-finance/server-client';

interface SymbolValidatorProps {
  loading: boolean;
  validated: boolean;
  quoteData: YahooQuote | null;
}

/**
 * Displays symbol validation status feedback
 *
 * @param props - Validation state props
 * @returns Validation feedback element or null
 */
export function SymbolValidator({
  loading,
  validated,
  quoteData,
}: SymbolValidatorProps) {
  if (loading) {
    return <p className="mt-2 text-xs text-primary">Validating symbol...</p>;
  }

  if (validated && quoteData) {
    return (
      <div className="mt-2 p-3 bg-gain/10 border border-gain/20 rounded-xl">
        <p className="text-xs font-medium text-gain">
          Valid symbol: {quoteData.symbol}
        </p>
        <p className="text-xs text-gain/80">
          Current price: &euro;{quoteData.regularMarketPrice.toFixed(2)}
        </p>
      </div>
    );
  }

  return null;
}
