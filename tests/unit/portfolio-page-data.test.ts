import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createHoldingsFixtures } from './holdings-fixtures';

const queries = vi.hoisted(() => ({
  products: vi.fn(),
  history: vi.fn(),
  rates: vi.fn(),
  contributions: vi.fn(),
  invested: vi.fn(),
}));
vi.mock('@/lib/server/portfolio-queries', () => ({
  loadPortfolioProducts: queries.products,
  loadPortfolioHistory: queries.history,
  loadDisplayRates: queries.rates,
}));
vi.mock('@/lib/domain/services/contributions-data', () => ({
  getMonthlyContributions: queries.contributions,
  getInvestedSeries: queries.invested,
}));
import {
  loadHoldingsPage,
  loadOverviewPage,
  loadGrowthPage,
  loadAllocationPage,
  loadCashFlowPage,
  loadRiskPage,
} from '@/lib/server/portfolio-page-data';

beforeEach(() => {
  vi.clearAllMocks();
  queries.products.mockResolvedValue(createHoldingsFixtures());
  queries.rates.mockResolvedValue({
    EUR: 1,
    USD: 1.2,
    BTC: 0.00001,
    ETH: 0.0002,
    XAUT: 0.0003,
  });
  queries.history.mockResolvedValue({
    allEvolutionData: [{ date: '2026-09-30', value: 250 }],
    evolutionData: [{ date: '2026-09-30', value: 250 }],
    monthlyWealthData: [{ month: '2026-09', value: 250 }],
    dailyChanges: [{ date: '2026-09-30', change: -10 }],
  });
  queries.contributions.mockResolvedValue([]);
  queries.invested.mockResolvedValue([{ date: '2026-09-30', invested: 100 }]);
});

describe('route-specific portfolio reads', () => {
  it('management and allocation never load historical or cash-flow datasets', async () => {
    const holdings = await loadHoldingsPage();
    const allocation = await loadAllocationPage();
    expect(holdings.products).toHaveLength(3);
    expect(allocation.allocationData).toHaveLength(3);
    expect(queries.history).not.toHaveBeenCalled();
    expect(queries.contributions).not.toHaveBeenCalled();
    expect(queries.invested).not.toHaveBeenCalled();
  });
  it('home loads only recent history and computes summary on the server', async () => {
    const overview = await loadOverviewPage();
    expect(queries.history).toHaveBeenCalledExactlyOnceWith(90);
    expect(overview.stats.dailyChange).toBe(-10);
    expect(overview.stats.latestChangeDate).toBe('2026-09-30');
    expect(overview.stats.productCount).toBe(3);
    expect(queries.invested).not.toHaveBeenCalled();
    expect(queries.contributions).not.toHaveBeenCalled();
    expect(overview).not.toHaveProperty('skill');
  });
  it('cash flow uses contributions and never reads snapshots', async () => {
    await loadCashFlowPage();
    expect(queries.contributions).toHaveBeenCalledExactlyOnceWith(
      createHoldingsFixtures(),
    );
    expect(queries.history).not.toHaveBeenCalled();
  });
  it('risk never enriches holdings or aggregates contributions', async () => {
    const risk = await loadRiskPage();
    expect(risk.dailyChanges[0].change).toBe(-10);
    expect(queries.products).not.toHaveBeenCalled();
    expect(queries.contributions).not.toHaveBeenCalled();
    expect(queries.invested).not.toHaveBeenCalled();
  });
  it('growth aligns cost basis with the complete snapshot history', async () => {
    const growth = await loadGrowthPage();
    expect(queries.history).toHaveBeenCalledExactlyOnceWith();
    expect(queries.invested).toHaveBeenCalledExactlyOnceWith(
      createHoldingsFixtures(),
      ['2026-09-30'],
    );
    expect(growth.monthlyInvestmentGains).toEqual([]);
    expect(queries.contributions).not.toHaveBeenCalled();
  });
  it('propagates failed reads so route boundaries offer retry rather than an empty portfolio', async () => {
    queries.products.mockRejectedValueOnce(new Error('Database unavailable'));
    await expect(loadHoldingsPage()).rejects.toThrow('Database unavailable');
  });
  it('handles a genuinely empty portfolio without dividing by zero', async () => {
    queries.products.mockResolvedValueOnce([]);
    const overview = await loadOverviewPage();
    expect(overview.stats.totalReturnPercentage).toBe(0);
    expect(overview.stats.totalValue).toBe(0);
  });
});
