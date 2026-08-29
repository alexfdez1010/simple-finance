/**
 * Dashboard header with title and dialog-based quick actions
 * @module components/dashboard/dashboard-header
 */

'use client';

import { Button } from '@heroui/react';
import { Plus } from '@phosphor-icons/react';
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
    <header className="animate-fade-up mb-10 border-b border-separator pb-5 sm:mb-12">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-serif text-3xl leading-none tracking-tight text-foreground sm:text-4xl">
          Simple Finance
        </h1>

        <div className="flex flex-wrap items-center gap-2">
          <CurrencySelector />
          <Button onPress={onAddYahoo} size="sm" variant="primary">
            <Plus aria-hidden size={16} weight="bold" />
            <span>Yahoo Product</span>
          </Button>
          <Button onPress={onAddCustom} variant="outline" size="sm">
            <Plus aria-hidden size={16} weight="bold" />
            <span>Custom Product</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
