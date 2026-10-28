import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { DisplayCurrencyProvider } from '@/components/dashboard/display-currency-context';
import { ProductCard } from '@/components/products/product-card';
import {
  calculateProductProfitRates,
  calculateProfitRatesSync,
} from '@/lib/domain/services/profit-rate-calculator';
import { createHoldingsFixtures } from './holdings-fixtures';
import type { ProductWithValue } from '@/lib/domain/models/product.types';

afterEach(() => {
  cleanup();
  localStorage.clear();
});

/** Renders real cards with deterministic conversion rates; no market requests. */
function renderCards(products: ProductWithValue[]) {
  return render(
    <DisplayCurrencyProvider
      rates={{ EUR: 1, USD: 2, BTC: 1, ETH: 1, XAUT: 1 }}
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          {...{
            currentValue: product.currentValue,
            currentValueEur: product.currentValueEur,
            investedEur: product.investedEur,
            expectedAnnualReturn: product.expectedAnnualReturn,
          }}
        />
      ))}
    </DisplayCurrencyProvider>,
  );
}

/** Returns one holding's accessible estimate region. */
function estimate(name: string) {
  return within(
    screen.getByRole('group', { name: `Estimated profit for ${name}` }),
  );
}

describe('individual product profit estimates', () => {
  it.each([0, 1])(
    'uses exactly the global formula for product type %i',
    (index) => {
      const product = {
        ...createHoldingsFixtures()[index],
        expectedAnnualReturn: 0.365,
      };
      const snapshot = structuredClone(product);
      expect(calculateProductProfitRates(product)).toEqual(
        calculateProfitRatesSync([product]),
      );
      expect(product).toEqual(snapshot);
    },
  );

  it.each([
    { currentValueEur: 1000, expectedAnnualReturn: null },
    { currentValueEur: 1000, expectedAnnualReturn: NaN },
    { currentValueEur: 1000, expectedAnnualReturn: Infinity },
    { currentValueEur: NaN, expectedAnnualReturn: 0.1 },
    { currentValueEur: Infinity, expectedAnnualReturn: 0.1 },
    { currentValueEur: 0, expectedAnnualReturn: 0.1 },
    { currentValueEur: -1000, expectedAnnualReturn: 0.1 },
  ])('leaves unusable inputs unavailable: %j', (input) => {
    expect(calculateProductProfitRates(input)).toBeNull();
  });

  it('starts daily, cycles all periods independently, and uses total EUR value', () => {
    const products = createHoldingsFixtures()
      .slice(0, 2)
      .map((product) => ({
        ...product,
        quantity: 3,
        currentValue: 0.2,
        currentValueEur: 3650,
        expectedAnnualReturn: 0.365,
      }));
    renderCards(products);
    const first = estimate(products[0].name);
    const second = estimate(products[1].name);
    expect(first.getByText('Estimated daily profit')).toBeTruthy();
    expect(first.getByText(/\+3,65/)).toBeTruthy();
    expect(first.getByText('+0.10%')).toBeTruthy();
    for (const [next, amount, pct] of [
      ['weekly', '25,55', '+0.70%'],
      ['monthly', '109,50', '+3.00%'],
      ['annual', '1332,25', '+36.50%'],
      ['daily', '3,65', '+0.10%'],
    ]) {
      fireEvent.click(
        first.getByRole('button', { name: `Show ${next} profit` }),
      );
      expect(first.getByText(`Estimated ${next} profit`)).toBeTruthy();
      expect(first.getByText(new RegExp(`\\+${amount}`))).toBeTruthy();
      expect(first.getByText(pct)).toBeTruthy();
      expect(second.getByText('Estimated daily profit')).toBeTruthy();
    }
  });

  it('distinguishes unknown estimates from known zero rates and losses', () => {
    const products = createHoldingsFixtures().map((product, index) => ({
      ...product,
      currentValueEur: 3650,
      expectedAnnualReturn: [null, 0, -0.365][index],
    }));
    renderCards(products);
    expect(
      estimate(products[0].name).getByText(/Return estimate unavailable/),
    ).toBeTruthy();
    expect(estimate(products[1].name).getByText('+0.00%')).toBeTruthy();
    const loss = estimate(products[2].name);
    expect(loss.getByText(/-3,65/).className).toContain('text-loss');
    expect(loss.getByText('-0.10%')).toBeTruthy();
  });

  it('converts amounts with the global currency without changing percentages or period', () => {
    const product = {
      ...createHoldingsFixtures()[0],
      currentValueEur: 3650,
      expectedAnnualReturn: 0.365,
    };
    renderCards([product]);
    const region = estimate(product.name);
    fireEvent.click(region.getByRole('button', { name: 'Show weekly profit' }));
    act(() => {
      localStorage.setItem('display-currency', 'USD');
      window.dispatchEvent(new Event('storage'));
    });
    expect(region.getByText(/\+51,10 \$/)).toBeTruthy();
    expect(region.getByText('+0.70%')).toBeTruthy();
    expect(region.getByText('Estimated weekly profit')).toBeTruthy();
  });
});
