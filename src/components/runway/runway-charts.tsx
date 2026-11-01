'use client';

import type {
  RunwayProjection,
  RunwaySettings,
} from '@/lib/domain/models/runway.types';
import { ProjectionChart } from './projection-chart';

/** Keeps drawdown and accumulation in distinct charts so income and planned savings cannot be double-counted. */
export function RunwayCharts({
  projection: p,
  settings: s,
}: {
  projection: RunwayProjection;
  settings: RunwaySettings;
}) {
  return (
    <div className="grid items-start gap-6 xl:grid-cols-2">
      <ProjectionChart
        title="Living off your capital"
        description="Remaining balance after monthly costs, income, returns and inflation"
        data={p.runwayPoints}
      />
      <ProjectionChart
        title="Building toward FIRE"
        description={`Nominal wealth and inflation-adjusted target over ${s.targetYears} years`}
        data={p.wealthPoints}
        target
      />
    </div>
  );
}
