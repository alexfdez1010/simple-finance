/**
 * Lazy-loaded chart components to reduce initial bundle size
 * @module components/dashboard/lazy-charts
 */

import dynamic from 'next/dynamic';
import { ChartLoadingSkeleton } from '@/components/dashboard/loading-skeletons';

/** Monthly wealth bar chart */
export const MonthlyWealthChart = dynamic(
  () =>
    import('@/components/dashboard/monthly-wealth-chart').then(
      (m) => m.MonthlyWealthChart,
    ),
  { loading: () => <ChartLoadingSkeleton />, ssr: false },
);

/** Portfolio evolution area chart */
export const PortfolioEvolutionChart = dynamic(
  () =>
    import('@/components/dashboard/portfolio-evolution-chart').then(
      (m) => m.PortfolioEvolutionChart,
    ),
  { loading: () => <ChartLoadingSkeleton />, ssr: false },
);

/** Daily changes bar chart */
export const DailyChangesChart = dynamic(
  () =>
    import('@/components/dashboard/daily-changes-chart').then(
      (m) => m.DailyChangesChart,
    ),
  { loading: () => <ChartLoadingSkeleton />, ssr: false },
);

/** Portfolio allocation donut chart */
export const PortfolioAllocationChart = dynamic(
  () =>
    import('@/components/dashboard/portfolio-allocation-chart').then(
      (m) => m.PortfolioAllocationChart,
    ),
  { loading: () => <ChartLoadingSkeleton />, ssr: false },
);

/** Top/bottom performers ranking */
export const TopPerformers = dynamic(
  () =>
    import('@/components/dashboard/top-performers').then(
      (m) => m.TopPerformers,
    ),
  { loading: () => <ChartLoadingSkeleton />, ssr: false },
);

/** Contribution to return diverging bar chart */
export const ContributionChart = dynamic(
  () =>
    import('@/components/dashboard/contribution-chart').then(
      (m) => m.ContributionChart,
    ),
  { loading: () => <ChartLoadingSkeleton />, ssr: false },
);

/** Drawdown area chart */
export const DrawdownChart = dynamic(
  () =>
    import('@/components/dashboard/drawdown-chart').then(
      (m) => m.DrawdownChart,
    ),
  { loading: () => <ChartLoadingSkeleton />, ssr: false },
);
