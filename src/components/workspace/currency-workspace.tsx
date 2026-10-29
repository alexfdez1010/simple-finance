'use client';

import type { ReactNode } from 'react';
import { DisplayCurrencyProvider } from '@/components/dashboard/display-currency-context';
import { CurrencySelector } from '@/components/dashboard/currency-selector';
import { PageHeading } from './page-heading';
import type { DisplayCurrency } from '@/lib/utils/format-currency';

/**
 * Composes page-local currency formatting and heading around server/client children.
 * @param props - Rates for this route, text, optional actions, and workspace content.
 * @returns A currency-aware workspace; selection persists across navigations.
 * Never queries data or mounts unrelated page modules.
 */
export function CurrencyWorkspace({
  rates,
  title,
  description,
  actions,
  children,
}: {
  rates: Record<DisplayCurrency, number>;
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <DisplayCurrencyProvider rates={rates}>
      <div key={title} className="workspace-content space-y-6 sm:space-y-8">
        <PageHeading
          title={title}
          description={description}
          actions={
            <>
              <CurrencySelector />
              {actions}
            </>
          }
        />
        {children}
      </div>
    </DisplayCurrencyProvider>
  );
}
