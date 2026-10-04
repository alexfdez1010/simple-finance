/**
 * Dashboard header with title and dialog-based quick actions
 * @module components/dashboard/dashboard-header
 */

'use client';

import { Button } from '@heroui/react';
import { Plus, ChartLineUp } from '@phosphor-icons/react';
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
    <header className="animate-fade-up mb-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="finance-card flex size-12 items-center justify-center rounded-2xl text-primary">
            <ChartLineUp aria-hidden size={27} weight="duotone" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Simple Finance
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Your wealth, in perspective.
            </p>
          </div>
        </div>

        <div className="glass-toolbar grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
          <div className="col-span-2 flex items-center justify-between gap-3 px-1 pb-1 sm:contents">
            <span className="text-xs text-muted-foreground sm:hidden">
              Display currency
            </span>
            <CurrencySelector />
          </div>
          <Button
            className="min-h-11"
            onPress={onAddYahoo}
            size="sm"
            variant="primary"
          >
            <Plus aria-hidden size={16} weight="bold" />
            <span>Yahoo Product</span>
          </Button>
          <Button
            className="min-h-11"
            onPress={onAddCustom}
            variant="outline"
            size="sm"
          >
            <Plus aria-hidden size={16} weight="bold" />
            <span>Custom Product</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
