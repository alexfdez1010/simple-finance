import { act, cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { PortfolioStats } from '@/components/dashboard/portfolio-stats';
import { DisplayCurrencyProvider } from '@/components/dashboard/display-currency-context';
import { calculateProfitRatesSync } from '@/lib/domain/services/profit-rate-calculator';

afterEach(() => {
  cleanup();
  localStorage.clear();
});

const defaultStats = {
  totalValue: 12000,
  totalInvestment: 10000,
  totalReturn: 2000,
  totalReturnPercentage: 20,
  productCount: 3,
  dailyChange: 75,
  profitRates: calculateProfitRatesSync([
    { currentValueEur: 12000, expectedAnnualReturn: 0.04 },
  ]),
};

/**
 * Renders summary figures with deterministic display rates and optional overrides.
 * @param overrides - Changes to the summary fixture, including missing snapshots.
 * @returns Testing Library's rendered tree; no data fetching or mutation.
 */
function renderSummary(
  overrides: Partial<Parameters<typeof PortfolioStats>[0]> = {},
) {
  return render(
    <DisplayCurrencyProvider
      rates={{ EUR: 1, USD: 2, BTC: 1, ETH: 1, XAUT: 1 }}
    >
      <PortfolioStats {...defaultStats} {...overrides} />
    </DisplayCurrencyProvider>,
  );
}

/** Returns the accessible summary group for one labelled financial metric. */
function metric(name: string) {
  return within(screen.getByRole('group', { name }));
}

describe('portfolio summary financial states', () => {
  it('identifies lifetime returns and a single holding without altering percentages', () => {
    renderSummary({ productCount: 1 });
    const balance = metric('Total Value');
    expect(balance.getByText('1 holding')).toBeTruthy();
    expect(balance.getByText('+20.00% all time')).toBeTruthy();
    expect(
      metric('Return').getByText('+20.00% on invested capital'),
    ).toBeTruthy();
  });

  it('preserves an unknown latest change instead of inventing a zero', () => {
    renderSummary();
    const latest = metric('Latest change');
    expect(latest.getByText('—')).toBeTruthy();
    expect(latest.getByText('Awaiting snapshots')).toBeTruthy();
    expect(latest.queryByText(/75,00/)).toBeNull();
    expect(metric('Total Value').getByText(/12\.000,00/)).toBeTruthy();
    expect(metric('Return').getByText(/\+20.00%/)).toBeTruthy();
  });

  it('keeps known zero snapshots distinct from missing history', () => {
    renderSummary({ dailyChange: 0, latestChangeDate: '2026-10-29' });
    const latest = metric('Latest change');
    expect(latest.getByText(/0,00/)).toBeTruthy();
    expect(latest.queryByText('—')).toBeNull();
    expect(latest.queryByText('Awaiting snapshots')).toBeNull();
  });

  it('retains signed losses and descriptive return percentages', () => {
    renderSummary({
      totalValue: 9000,
      totalReturn: -1000,
      totalReturnPercentage: -10,
      dailyChange: -75,
      latestChangeDate: '2026-10-29',
    });
    expect(metric('Return').getByText(/-1000,00/).className).toContain(
      'text-loss',
    );
    expect(metric('Return').getByText(/-10.00%/)).toBeTruthy();
    expect(metric('Latest change').getByText(/-75,00/).className).toContain(
      'text-loss',
    );
  });

  it('updates every monetary metric without changing financial percentages', () => {
    renderSummary({ latestChangeDate: '2026-10-29' });
    act(() => {
      localStorage.setItem('display-currency', 'USD');
      window.dispatchEvent(new Event('storage'));
    });
    expect(metric('Total Value').getByText(/24\.000,00 \$/)).toBeTruthy();
    expect(metric('Invested').getByText(/20\.000,00 \$/)).toBeTruthy();
    expect(metric('Return').getByText(/4000,00 \$/)).toBeTruthy();
    expect(metric('Return').getByText(/\+20.00%/)).toBeTruthy();
    expect(metric('Latest change').getByText(/150,00 \$/)).toBeTruthy();
  });
});
