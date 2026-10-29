/**
 * Loading skeleton components for dashboard sections
 * Used as Suspense fallbacks for progressive loading
 * @module components/dashboard/loading-skeletons
 */

'use client';

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
      className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.45fr)]"
    >
      <div className="balance-surface flex min-h-60 flex-col justify-between rounded-2xl p-6 sm:p-8">
        <Skeleton className="h-3 w-24 rounded-sm bg-white/15" />
        <Skeleton className="h-12 w-52 max-w-full rounded-lg bg-white/15" />
        <Skeleton className="h-3 w-36 rounded-sm bg-white/15" />
      </div>
      <div className="finance-card p-6">
        <div className="grid grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index}>
              <Skeleton className="h-3 w-14 max-w-full rounded-sm" />
              <Skeleton className="mt-5 h-7 w-24 max-w-full rounded-md" />
              <Skeleton className="mt-3 h-3 w-20 max-w-full rounded-sm" />
            </div>
          ))}
        </div>
        <div className="mt-6 border-t border-border pt-5">
          <Skeleton className="h-3 w-32 rounded-sm" />
          <Skeleton className="mt-4 h-6 w-28 rounded-md" />
        </div>
      </div>
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
    <Card aria-hidden="true" className="finance-card py-0">
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
        <Card key={i} className="finance-card py-0">
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
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <ChartLoadingSkeleton />
        <ChartLoadingSkeleton />
      </div>
      <ChartLoadingSkeleton />
    </div>
  );
}
