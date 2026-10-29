import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AllocationByCategoryChart } from '@/components/dashboard/allocation-by-category-chart';
import { DisplayCurrencyProvider } from '@/components/dashboard/display-currency-context';

type AllocationItem = Parameters<
  typeof AllocationByCategoryChart
>[0]['data'][number];

beforeEach(() => {
  // JSDOM has no layout; chart structure is checked here and plotted pixels in E2E.
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(
    new DOMRect(0, 0, 192, 192),
  );
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

/** Renders actual category presentation with stable EUR conversion and no data reads. */
function renderAllocation(data: AllocationItem[]) {
  return render(
    <DisplayCurrencyProvider
      rates={{ EUR: 1, USD: 2, BTC: 1, ETH: 1, XAUT: 1 }}
    >
      <AllocationByCategoryChart data={data} />
    </DisplayCurrencyProvider>,
  );
}

/** Finds the complete category ledger row using its public category label. */
function category(name: string) {
  const row = screen.getByText(name).closest('li');
  expect(row).not.toBeNull();
  return within(row!);
}

describe('category allocation truthful proportions', () => {
  it('shows readable labels, amounts and proportions without mutating input', () => {
    const data: AllocationItem[] = [
      { category: 'STOCKS', value: 750 },
      { category: 'CASH', value: 250 },
    ];
    const original = structuredClone(data);
    data.forEach(Object.freeze);
    Object.freeze(data);
    renderAllocation(data);
    expect(
      screen.getByRole('img', { name: 'Allocation by asset category' }),
    ).toBeTruthy();
    expect(category('Stocks').getByText('750 €')).toBeTruthy();
    expect(category('Stocks').getByText('75.0%')).toBeTruthy();
    expect(category('Cash').getByText('250 €')).toBeTruthy();
    expect(category('Cash').getByText('25.0%')).toBeTruthy();
    expect(data).toEqual(original);
  });

  it('keeps zero-valued categories in a valid positive portfolio', () => {
    renderAllocation([
      { category: 'BONDS_LOANS', value: 1000 },
      { category: 'REAL_ESTATE', value: 0 },
    ]);
    expect(category('Bonds & Loans').getByText('100.0%')).toBeTruthy();
    expect(category('Real Estate').getByText('0 €')).toBeTruthy();
    expect(category('Real Estate').getByText('0.0%')).toBeTruthy();
    expect(screen.queryByText(/Percentage breakdown unavailable/)).toBeNull();
  });

  it.each([
    [100, -25],
    [25, -100],
    [0, 0],
  ])(
    'keeps signed/zero amounts %s, %s while omitting misleading proportions',
    (stockValue, cashValue) => {
      renderAllocation([
        { category: 'STOCKS', value: stockValue },
        { category: 'CASH', value: cashValue },
      ]);
      expect(
        screen.queryByRole('img', { name: 'Allocation by asset category' }),
      ).toBeNull();
      expect(
        screen.getByText(
          /Percentage breakdown unavailable for zero or signed valuations/,
        ),
      ).toBeTruthy();
      expect(category('Stocks').getByText(`${stockValue} €`)).toBeTruthy();
      expect(category('Cash').getByText(`${cashValue} €`)).toBeTruthy();
      expect(category('Stocks').getByText('—')).toBeTruthy();
      expect(category('Cash').getByText('—')).toBeTruthy();
      expect(screen.queryByText(/\d+\.\d+%/)).toBeNull();
    },
  );

  it('offers first-holding guidance instead of an empty ring', () => {
    renderAllocation([]);
    expect(
      screen.getByText('Add a product to see your asset-class split.'),
    ).toBeTruthy();
    expect(
      screen.queryByRole('img', { name: 'Allocation by asset category' }),
    ).toBeNull();
    expect(screen.queryByRole('list', { name: 'Category values' })).toBeNull();
  });
});
