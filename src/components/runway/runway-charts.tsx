'use client';

import type {
  RunwayProjection,
  RunwaySettings,
} from '@/lib/domain/models/runway.types';
import { ProjectionChart } from './projection-chart';

/** Keeps drawdown and accumulation in distinct charts so income and planned savings cannot be double-counted. */
export function RunwayCharts({
  projection: p,
}: {
  projection: RunwayProjection;
  settings: RunwaySettings;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <ProjectionChart
        title="Living off your capital"
        description=""
        data={p.runwayPoints}
      />
      <ProjectionChart
        title="Building toward FIRE"
        description=""
        data={p.wealthPoints}
        target
      />
    </div>
  );
}
