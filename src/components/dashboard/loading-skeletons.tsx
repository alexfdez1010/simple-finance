/**
 * Loading skeleton components for dashboard sections
 * Used as Suspense fallbacks for progressive loading
 * @module components/dashboard/loading-skeletons
 */

import { Card, Skeleton } from '@heroui/react';

/**
 * Skeleton for the portfolio stats section
 *
 * @returns Stats skeleton element
 */
export function StatsLoadingSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-12"
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <Card
          key={i}
          className={`${i === 0 ? 'col-span-2 h-full rounded-xl md:col-span-4 lg:col-span-4 lg:row-span-2' : i === 5 ? 'col-span-2 rounded-xl md:col-span-4 lg:col-span-8' : 'rounded-lg md:col-span-2 lg:col-span-2'} min-h-32 border border-border py-0 shadow-none`}
        >
          <Card.Content className="flex h-full flex-col justify-between p-4 sm:p-5">
            <Skeleton className="h-3 w-20 rounded-sm" />
            <Skeleton className="h-8 w-28 rounded-sm" />
          </Card.Content>
        </Card>
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
    <Card aria-hidden="true" className="border border-border py-0 shadow-none">
      <Card.Content className="p-5 sm:p-6">
        <Skeleton className="mb-2 h-5 w-40 rounded-sm" />
        <Skeleton className="mb-6 h-3 w-60 max-w-full rounded-sm" />
        <Skeleton className="h-[250px] w-full rounded-md" />
      </Card.Content>
    </Card>
  );
}

/**
 * Skeleton for the products grid
 *
 * @returns Products grid skeleton element
 */
export function ProductsLoadingSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
    >
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="border border-border py-0 shadow-none">
          <Card.Content className="p-5">
            <div className="mb-6 flex justify-between">
              <div>
                <Skeleton className="mb-2 h-5 w-32 rounded-sm" />
                <Skeleton className="h-3 w-20 rounded-sm" />
              </div>
              <Skeleton className="h-8 w-16 rounded-md" />
            </div>
            <Skeleton className="mb-5 h-8 w-36 rounded-sm" />
            <div className="flex justify-between">
              <Skeleton className="h-6 w-24 rounded-sm" />
              <Skeleton className="h-6 w-20 rounded-sm" />
            </div>
          </Card.Content>
        </Card>
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
