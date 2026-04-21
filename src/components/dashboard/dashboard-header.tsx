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
    <header className="mb-6 sm:mb-8 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl tracking-tight gradient-text">
            Simple Finance
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Track your portfolio performance
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
