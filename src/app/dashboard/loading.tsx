import { DashboardLoadingSkeleton } from '@/components/dashboard/loading-skeletons';

/** Renders page-local skeletons during navigation; shared navigation remains usable. */
export default function DashboardLoading() {
  return (
    <div role="status" aria-label="Loading workspace" aria-busy="true">
      <span className="sr-only">Loading workspace…</span>
      <DashboardLoadingSkeleton />
    </div>
  );
}
