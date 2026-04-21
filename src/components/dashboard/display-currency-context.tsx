/**
 * Client context for the globally-selected display currency.
 * Persists the choice to localStorage; exposes a `format` helper that
 * converts EUR-stored values into the chosen currency using server-fetched
 * rates.
 * @module components/dashboard/display-currency-context
 */

'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  formatInCurrency,
  type DisplayCurrency,
  type FormatOptions,
} from '@/lib/utils/format-currency';

const STORAGE_KEY = 'display-currency';
const SUPPORTED: DisplayCurrency[] = ['EUR', 'USD', 'BTC', 'ETH', 'XAUT'];

interface DisplayCurrencyContextValue {
  currency: DisplayCurrency;
  setCurrency: (c: DisplayCurrency) => void;
  rate: number;
  format: (eurAmount: number, opts?: FormatOptions) => string;
  supported: readonly DisplayCurrency[];
}

const Ctx = createContext<DisplayCurrencyContextValue | null>(null);

interface ProviderProps {
  rates: Record<DisplayCurrency, number>;
  children: ReactNode;
}

/**
 * Wraps a subtree with display-currency state.
 *
 * @param props - Initial rates fetched server-side and children
 * @returns Provider element
 */
export function DisplayCurrencyProvider({ rates, children }: ProviderProps) {
  const [currency, setCurrencyState] = useState<DisplayCurrency>('EUR');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as DisplayCurrency | null;
    if (saved && SUPPORTED.includes(saved)) setCurrencyState(saved);
  }, []);

  const setCurrency = useCallback((c: DisplayCurrency) => {
    setCurrencyState(c);
    try {
      localStorage.setItem(STORAGE_KEY, c);
    } catch {
      // Ignore storage failures (private mode, quota, etc.)
    }
  }, []);

  const value = useMemo<DisplayCurrencyContextValue>(() => {
    const rate = rates[currency] ?? 1;
    return {
      currency,
      setCurrency,
      rate,
      format: (eur, opts) => formatInCurrency(eur, currency, rate, opts),
      supported: SUPPORTED,
    };
  }, [currency, rates, setCurrency]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/**
 * Access the active display currency and its formatter.
 *
 * @returns Context value
 * @throws If called outside a DisplayCurrencyProvider
 */
export function useDisplayCurrency(): DisplayCurrencyContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error(
      'useDisplayCurrency must be used within a DisplayCurrencyProvider',
    );
  }
  return ctx;
}
