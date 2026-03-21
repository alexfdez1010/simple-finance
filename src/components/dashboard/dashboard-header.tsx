/**
 * Dashboard header with navigation and quick actions
 * @module components/dashboard/dashboard-header
 */

import Link from 'next/link';
import { Plus } from 'lucide-react';

/**
 * Dashboard header component with title and quick action links
 *
 * @returns Header element
 */
export function DashboardHeader() {
  return (
    <header className="mb-6 sm:mb-8 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl tracking-tight text-foreground">
            Simple Finance
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Track your portfolio performance
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 sm:gap-3">
          <Link
            href="/products/add"
            className="inline-flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-medium rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Yahoo Product</span>
          </Link>
          <Link
            href="/products/add-custom"
            className="inline-flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-medium rounded-xl bg-secondary text-secondary-foreground hover:bg-accent transition-colors border border-border"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Custom Product</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
