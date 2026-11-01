import 'server-only';
import { getRunwaySettings } from '@/lib/infrastructure/database/runway-repository';
import { loadHoldingsPage } from './portfolio-page-data';

/**
 * Loads current valued holdings, display rates and persisted simulation assumptions.
 * @returns Serializable page inputs; null settings distinguish an unconfigured plan.
 * Runs independent reads concurrently without snapshots; errors reach the route boundary.
 */
export async function loadRunwayPage() {
  const [holdings, settings] = await Promise.all([
    loadHoldingsPage(),
    getRunwaySettings(),
  ]);
  return { ...holdings, settings };
}
