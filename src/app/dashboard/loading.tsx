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
    <main id="main-content" className="app-shell" aria-busy="true">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <header className="mb-6 sm:mb-8">
          <div className="h-8 w-48 animate-pulse rounded-md bg-default" />
        </header>
        <DashboardLoadingSkeleton />
      </div>
    </main>
  );
}
