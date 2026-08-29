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
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import {
  formatInCurrency,
  type DisplayCurrency,
  type FormatOptions,
} from '@/lib/utils/format-currency';

const STORAGE_KEY = 'display-currency';
const CURRENCY_CHANGE_EVENT = 'simple-finance:currency-change';
const SUPPORTED: DisplayCurrency[] = ['EUR', 'USD', 'BTC', 'ETH', 'XAUT'];

interface DisplayCurrencyContextValue {
  currency: DisplayCurrency;
  setCurrency: (c: DisplayCurrency) => void;
  rate: number;
  format: (eurAmount: number, opts?: FormatOptions) => string;
  supported: readonly DisplayCurrency[];
}

const Ctx = createContext<DisplayCurrencyContextValue | null>(null);

/** Reads a valid locally persisted currency, falling back to EUR. */
function readStoredCurrency(): DisplayCurrency {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as DisplayCurrency | null;
    return saved && SUPPORTED.includes(saved) ? saved : 'EUR';
  } catch {
    return 'EUR';
  }
}

/** Returns the deterministic server snapshot used during hydration. */
function readServerCurrency(): DisplayCurrency {
  return 'EUR';
}

/** Subscribes to currency changes in this tab and in other browser tabs. */
function subscribeToCurrency(callback: () => void): () => void {
  window.addEventListener('storage', callback);
  window.addEventListener(CURRENCY_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(CURRENCY_CHANGE_EVENT, callback);
  };
}

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
  const currency = useSyncExternalStore(
    subscribeToCurrency,
    readStoredCurrency,
    readServerCurrency,
  );

  const setCurrency = useCallback((c: DisplayCurrency) => {
    try {
      localStorage.setItem(STORAGE_KEY, c);
      window.dispatchEvent(new Event(CURRENCY_CHANGE_EVENT));
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
