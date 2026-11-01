'use client';

import type {
  RunwayProjection,
  RunwaySettings,
} from '@/lib/domain/models/runway.types';
import { ProjectionChart } from './projection-chart';

/** Renders the active section's chart, keeping consumption and accumulation separate. */
export function RunwayCharts({
  projection: p,
  scenario,
}: {
  projection: RunwayProjection;
  settings: RunwaySettings;
  scenario: 'runway' | 'fire';
}) {
  return scenario === 'runway' ? (
    <ProjectionChart
      title="Living off your capital"
      description=""
      data={p.runwayPoints}
    />
  ) : (
    <ProjectionChart
      title="Building toward FIRE"
      description=""
      data={p.wealthPoints}
      target
    />
  );
}
