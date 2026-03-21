/**
 * Dashboard loading state - shown instantly while page data streams in
 * @module app/dashboard/loading
 */

import { DashboardLoadingSkeleton } from '@/components/dashboard/loading-skeletons';

/**
 * Loading component for the dashboard route
 * Displays skeleton UI while server data is being fetched
 *
 * @returns Loading skeleton element
 */
export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
        {/* Header skeleton */}
        <header className="mb-6 sm:mb-8">
          <div className="h-9 w-48 bg-muted animate-pulse rounded-lg mb-2" />
          <div className="h-4 w-72 bg-muted animate-pulse rounded-lg" />
        </header>
        <DashboardLoadingSkeleton />
      </div>
    </div>
  );
}
