import 'server-only';
import { computeDashboardData } from '@/lib/domain/services/dashboard-data';
import { calculateProfitRatesSync } from '@/lib/domain/services/profit-rate-calculator';
import { computeMonthlyInvestmentGains } from '@/lib/domain/services/monthly-investment-gains';
import {
  getMonthlyContributions,
  getInvestedSeries,
} from '@/lib/domain/services/contributions-data';
import {
  loadPortfolioProducts,
  loadPortfolioHistory,
  loadDisplayRates,
} from './portfolio-queries';

/**
 * Loads only holdings and display rates for portfolio management.
 * @returns Valued holdings and rates; no snapshot, contribution, or agent queries.
 * Performs independent reads concurrently; upstream failures propagate.
 */
export async function loadHoldingsPage() {
  const [products, rates] = await Promise.all([
    loadPortfolioProducts(),
    loadDisplayRates(),
  ]);
  return { products, rates };
}

/**
 * Loads the landing overview without analytics contribution aggregation or secrets.
 * @returns Summary, a 90-day evolution, allocation, holdings, and display rates.
 * Reads products, recent snapshots, and rates concurrently; empty portfolios stay valid.
 */
export async function loadOverviewPage() {
  const [holdings, history] = await Promise.all([
    loadHoldingsPage(),
    loadPortfolioHistory(90),
  ]);
  const data = computeDashboardData(holdings.products, history.dailyChanges);
  const totalReturn = data.stats.totalValue - data.stats.totalInvestment;
  return {
    ...holdings,
    evolutionData: history.evolutionData,
    allocationData: data.categoryAllocation,
    stats: {
      ...data.stats,
      totalReturn,
      totalReturnPercentage:
        data.stats.totalInvestment > 0
          ? (totalReturn / data.stats.totalInvestment) * 100
          : 0,
      profitRates: calculateProfitRatesSync(holdings.products),
      dailyChange: data.dailyChange,
      latestChangeDate: history.dailyChanges.at(-1)?.date,
    },
  };
}

/**
 * Loads detailed growth analytics, including cash-flow-adjusted monthly gains.
 * @returns Overview chart datasets and rates; no agent configuration.
 * Reads one year of snapshots then computes contributions against their dates.
 */
export async function loadGrowthPage() {
  const [holdings, history] = await Promise.all([
    loadHoldingsPage(),
    loadPortfolioHistory(),
  ]);
  const invested = await getInvestedSeries(
    holdings.products,
    history.allEvolutionData.map((point) => point.date),
  );
  return {
    rates: holdings.rates,
    evolutionData: history.evolutionData,
    monthlyWealthData: history.monthlyWealthData,
    investedSeries: invested.slice(-90),
    performersData: computeDashboardData(holdings.products, []).performersData,
    monthlyInvestmentGains: computeMonthlyInvestmentGains(
      history.allEvolutionData,
      invested,
      new Date().toISOString().slice(0, 10),
    ),
  };
}

/** Loads allocation from holdings alone; returns datasets/rates without historical reads. */
export async function loadAllocationPage() {
  const { products, rates } = await loadHoldingsPage();
  return { rates, ...computeDashboardData(products, []) };
}

/** Loads contributions and liquidity only; no snapshot or agent configuration reads. */
export async function loadCashFlowPage() {
  const { products, rates } = await loadHoldingsPage();
  return {
    rates,
    monthlyContributions: await getMonthlyContributions(products),
    liquidityCurve: computeDashboardData(products, []).liquidityCurve,
  };
}

/** Loads snapshot-based risk and rates only; no holdings or contribution enrichment. */
export async function loadRiskPage() {
  const [history, rates] = await Promise.all([
    loadPortfolioHistory(),
    loadDisplayRates(),
  ]);
  return {
    rates,
    evolutionData: history.evolutionData,
    dailyChanges: history.dailyChanges,
  };
}
