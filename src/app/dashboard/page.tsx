/**
 * Dashboard page - Server Component with parallel data fetching
 * Uses Suspense boundaries for progressive streaming
 * @module app/dashboard/page
 */

import { Suspense } from 'react';
import { headers } from 'next/headers';
import { getProducts } from '@/lib/actions/product-actions';
import { DashboardClient } from '@/components/dashboard/dashboard-client';
import { enrichProductsWithEurValues } from '@/lib/domain/services/product-enrichment';
import { getDisplayRates } from '@/lib/domain/services/display-rates';
import { getPortfolioSnapshotsLastNDays } from '@/lib/infrastructure/database/portfolio-snapshot-repository';
import {
  getMonthlyContributions,
  getInvestedSeries,
} from '@/lib/domain/services/contributions-data';
import {
  StatsLoadingSkeleton,
  ChartLoadingSkeleton,
  ProductsLoadingSkeleton,
} from '@/components/dashboard/loading-skeletons';
import { expectedMcpToken } from '@/lib/mcp/auth';
import { TOKEN_ENV_VAR, buildMcpJson } from '@/lib/mcp/skill';
import type { ProductWithValue } from '@/lib/domain/models/product.types';

export const revalidate = 60;

/**
 * Fetches products with their current values (all in EUR)
 *
 * @returns Sorted array of products with current values
 */
async function getProductsWithValues(): Promise<ProductWithValue[]> {
  const products = await getProducts();
  const enriched = await enrichProductsWithEurValues(products);
  enriched.sort((a, b) => b.currentValueEur - a.currentValueEur);
  return enriched;
}

/**
 * Fetches and processes portfolio snapshot data
 *
 * @returns Object with evolution, monthly, and daily change data
 */
async function getSnapshotData() {
  const snapshots = await getPortfolioSnapshotsLastNDays(365);

  const evolutionData = snapshots.slice(-90).map((s) => ({
    date: s.date.toISOString().split('T')[0],
    value: s.value,
  }));

  const monthlyMap = new Map<string, number>();
  snapshots.forEach((s) => {
    const d = new Date(s.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthlyMap.set(key, s.value);
  });

  const monthlyWealthData = Array.from(monthlyMap.entries())
    .map(([month, value]) => ({ month, value }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const dailyChanges = [];
  for (let i = 1; i < snapshots.length; i++) {
    dailyChanges.push({
      date: snapshots[i].date.toISOString().split('T')[0],
      change: snapshots[i].value - snapshots[i - 1].value,
    });
  }

  return { evolutionData, monthlyWealthData, dailyChanges };
}

/**
 * Resolve the public MCP server URL from request headers.
 *
 * @returns Absolute URL of the MCP HTTP endpoint
 */
async function getSkillProps() {
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  const proto =
    h.get('x-forwarded-proto') ??
    (host.startsWith('localhost') ? 'http' : 'https');
  const serverUrl = `${proto}://${host}/api/mcp/mcp`;
  const token = expectedMcpToken();
  return {
    serverUrl,
    token,
    mcpJson: buildMcpJson(serverUrl),
    tokenEnvVar: TOKEN_ENV_VAR,
  };
}

async function DashboardContent() {
  const [productsWithValues, snapshotData, displayRates, skill] =
    await Promise.all([
      getProductsWithValues(),
      getSnapshotData(),
      getDisplayRates(),
      getSkillProps(),
    ]);

  const [monthlyContributions, investedSeries] = await Promise.all([
    getMonthlyContributions(productsWithValues),
    getInvestedSeries(
      productsWithValues,
      snapshotData.evolutionData.map((p) => p.date),
    ),
  ]);

  return (
    <DashboardClient
      productsWithValues={productsWithValues}
      evolutionData={snapshotData.evolutionData}
      monthlyWealthData={snapshotData.monthlyWealthData}
      dailyChanges={snapshotData.dailyChanges}
      monthlyContributions={monthlyContributions}
      investedSeries={investedSeries}
      displayRates={displayRates}
      skill={skill}
    />
  );
}

/**
 * Dashboard page component with streaming Suspense boundaries
 *
 * @returns Dashboard page element
 */
export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[oklch(0.97_0.008_80)] via-[oklch(0.96_0.015_240)] to-[oklch(0.95_0.02_280)] dark:from-slate-950 dark:via-[oklch(0.15_0.02_260)] dark:to-[oklch(0.13_0.025_280)]">
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
        <Suspense
          fallback={
            <div className="space-y-6 sm:space-y-8">
              <StatsLoadingSkeleton />
              <ChartLoadingSkeleton />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <ChartLoadingSkeleton />
                <ChartLoadingSkeleton />
              </div>
              <ProductsLoadingSkeleton />
            </div>
          }
        >
          <DashboardContent />
        </Suspense>
      </div>
    </div>
  );
}
