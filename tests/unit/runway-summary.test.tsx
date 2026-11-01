import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { RunwaySummary } from '@/components/runway/runway-summary';

vi.mock('@/components/dashboard/display-currency-context', () => ({
  useDisplayCurrency: () => ({ format: (amount: number) => String(amount) }),
}));
afterEach(cleanup);

describe('dashboard FIRE timing', () => {
  it('does not invent an eventual date when a finite target is not reached', () => {
    render(
      <RunwaySummary
        products={[{ currentValueEur: 1, expectedAnnualReturn: 0.05 }]}
        settings={{
          monthlyExpenses: 1000,
          annualInflation: 0.02,
          monthlyContribution: 0,
        }}
      />,
    );
    expect(screen.getByText('Not reached within 50 years')).toBeTruthy();
  });
});
