/**
 * Dashboard header with title and dialog-based quick actions
 * @module components/dashboard/dashboard-header
 */

'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CurrencySelector } from '@/components/dashboard/currency-selector';

interface DashboardHeaderProps {
  onAddYahoo: () => void;
  onAddCustom: () => void;
}

/**
 * Dashboard header component with title and add product buttons
 *
 * @param props - Callbacks for opening add product dialogs
 * @returns Header element
 */
export function DashboardHeader({
  onAddYahoo,
  onAddCustom,
}: DashboardHeaderProps) {
  return (
    <header className="mb-8 sm:mb-12 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
        <div>
          <p className="eyebrow mb-3">Portfolio · Private Wealth</p>
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl tracking-tight gradient-text leading-[0.95] gold-underline">
            Simple Finance
          </h1>
          <p className="text-muted-foreground mt-4 text-sm sm:text-base italic font-serif">
            A considered view of your capital, compounded.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <CurrencySelector />
          <Button onClick={onAddYahoo} size="sm" className="rounded-xl">
            <Plus data-icon="inline-start" />
            <span>Yahoo Product</span>
          </Button>
          <Button
            onClick={onAddCustom}
            variant="outline"
            size="sm"
            className="rounded-xl"
          >
            <Plus data-icon="inline-start" />
            <span>Custom Product</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
