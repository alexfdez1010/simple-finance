/**
 * Loading skeleton components for dashboard sections
 * Used as Suspense fallbacks for progressive loading
 * @module components/dashboard/loading-skeletons
 */

import { Skeleton } from '@/components/ui/skeleton';

/**
 * Skeleton for the portfolio stats section
 *
 * @returns Stats skeleton element
 */
export function StatsLoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-center sm:gap-4 lg:gap-6 rounded-2xl bg-card p-4 sm:p-6 shadow-sm border border-border">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex-1 min-w-[120px] p-3 sm:p-4 rounded-xl">
          <Skeleton className="h-3 w-20 mb-2" />
          <Skeleton className="h-7 w-28" />
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton for a chart card
 *
 * @returns Chart skeleton element
 */
export function ChartLoadingSkeleton() {
  return (
    <div className="rounded-2xl bg-card p-4 sm:p-6 shadow-sm border border-border">
      <Skeleton className="h-5 w-40 mb-2" />
      <Skeleton className="h-3 w-60 mb-6" />
      <Skeleton className="h-[250px] w-full rounded-lg" />
    </div>
  );
}

/**
 * Skeleton for the products grid
 *
 * @returns Products grid skeleton element
 */
export function ProductsLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl bg-card p-5 shadow-sm border border-border"
        >
          <div className="flex justify-between mb-4">
            <div>
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-8 w-16 rounded-lg" />
          </div>
          <Skeleton className="h-8 w-36 mb-3" />
          <div className="flex justify-between">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Full dashboard loading skeleton
 *
 * @returns Complete dashboard skeleton element
 */
export function DashboardLoadingSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <StatsLoadingSkeleton />
      <ChartLoadingSkeleton />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <ChartLoadingSkeleton />
        <ChartLoadingSkeleton />
      </div>
      <ProductsLoadingSkeleton />
    </div>
  );
}
