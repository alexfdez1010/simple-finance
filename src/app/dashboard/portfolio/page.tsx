import type { Metadata } from 'next';
import { HoldingsWorkspace } from '@/components/workspace/holdings-workspace';
import { loadHoldingsPage } from '@/lib/server/portfolio-page-data';

export const metadata: Metadata = { title: 'Holdings · Simple Finance' };
export const revalidate = 60;

/** Loads product management only; returns the interactive holdings workspace. */
export default async function HoldingsPage() {
  return <HoldingsWorkspace {...await loadHoldingsPage()} />;
}
