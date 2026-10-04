import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductHistoryDialog } from '@/components/products/product-history-dialog';
import {
  getProductHistoryAction,
  type ProductHistoryResult,
} from '@/lib/actions/history-actions';
import type { FinancialProduct } from '@/lib/domain/models/product.types';

vi.mock('@/lib/actions/history-actions', () => ({
  getProductHistoryAction: vi.fn(),
}));
vi.mock('@/components/dashboard/display-currency-context', () => ({
  useDisplayCurrency: () => ({ format: (value: number) => `€${value}` }),
}));
vi.mock('@/components/products/product-history-chart', () => ({
  ProductHistoryChart: () => <div aria-label="History chart" />,
}));

const loadHistory = vi.mocked(getProductHistoryAction);
const product: FinancialProduct = {
  id: 'first',
  type: 'CUSTOM',
  assetCategory: 'CASH',
  daysToLiquidity: 0,
  name: 'Savings',
  quantity: 1,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  custom: {
    id: 'custom',
    annualReturnRate: 0.02,
    currency: 'EUR',
    contributions: [],
  },
};
const history: ProductHistoryResult = {
  type: 'CUSTOM',
  expectedAnnualReturn: 0.02,
  history: [{ date: '2026-01-01', value: 120 }],
};
const onOpenChange = vi.fn();

beforeEach(() => vi.clearAllMocks());
afterEach(() => cleanup());

describe('ProductHistoryDialog', () => {
  it.each(['null', 'rejection'])(
    'offers retry after a %s response and recovers',
    async (failure) => {
      if (failure === 'null') loadHistory.mockResolvedValueOnce(null);
      else loadHistory.mockRejectedValueOnce(new Error('Unavailable'));
      loadHistory.mockResolvedValueOnce(history);
      render(
        <ProductHistoryDialog
          product={product}
          open
          onOpenChange={onOpenChange}
        />,
      );

      await screen.findByRole('alert');
      expect(screen.getByRole('alert').textContent).toBe(
        'History could not be loaded.',
      );
      fireEvent.click(screen.getByRole('button', { name: 'Retry history' }));
      await screen.findByText('€120');

      expect(loadHistory).toHaveBeenCalledTimes(2);
      expect(loadHistory).toHaveBeenLastCalledWith('first');
      expect(screen.queryByRole('alert')).toBeNull();
      expect(screen.getByLabelText('History chart')).toBeTruthy();
    },
  );

  it('ignores a late result after selecting another product', async () => {
    let finish!: (result: ProductHistoryResult) => void;
    loadHistory.mockReturnValueOnce(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    loadHistory.mockResolvedValueOnce({
      ...history,
      history: [{ date: '2026-01-01', value: 240 }],
    });
    const { rerender } = render(
      <ProductHistoryDialog
        product={product}
        open
        onOpenChange={onOpenChange}
      />,
    );
    await waitFor(() => expect(loadHistory).toHaveBeenCalledTimes(1));

    rerender(
      <ProductHistoryDialog
        product={{ ...product, id: 'second', name: 'Reserve' }}
        open
        onOpenChange={onOpenChange}
      />,
    );
    await screen.findByText('€240');
    await act(async () => finish(history));

    expect(screen.getByText('€240')).toBeTruthy();
    expect(screen.queryByText('€120')).toBeNull();
    expect(loadHistory).toHaveBeenLastCalledWith('second');
  });

  it('shows loading during retry and prevents duplicate recovery clicks', async () => {
    let finish!: (result: ProductHistoryResult) => void;
    loadHistory.mockResolvedValueOnce(null);
    loadHistory.mockReturnValueOnce(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    render(
      <ProductHistoryDialog
        product={product}
        open
        onOpenChange={onOpenChange}
      />,
    );
    const retry = await screen.findByRole('button', { name: 'Retry history' });

    fireEvent.click(retry);
    fireEvent.click(retry);
    await waitFor(() => expect(loadHistory).toHaveBeenCalledTimes(2));
    expect(
      screen.getByRole('status', { name: 'Loading product history' }),
    ).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Retry history' })).toBeNull();
    await act(async () => finish(history));
    expect(screen.getByText('€120')).toBeTruthy();
  });

  it('ignores an error after closing and loads again when reopened', async () => {
    let fail!: (reason: Error) => void;
    loadHistory.mockReturnValueOnce(
      new Promise((_resolve, reject) => {
        fail = reject;
      }),
    );
    loadHistory.mockResolvedValueOnce(history);
    const { rerender } = render(
      <ProductHistoryDialog
        product={product}
        open
        onOpenChange={onOpenChange}
      />,
    );
    await waitFor(() => expect(loadHistory).toHaveBeenCalledTimes(1));

    rerender(
      <ProductHistoryDialog
        product={product}
        open={false}
        onOpenChange={onOpenChange}
      />,
    );
    await act(async () => fail(new Error('Late failure')));
    rerender(
      <ProductHistoryDialog
        product={product}
        open
        onOpenChange={onOpenChange}
      />,
    );
    await screen.findByText('€120');

    expect(screen.queryByRole('alert')).toBeNull();
    expect(loadHistory).toHaveBeenCalledTimes(2);
  });

  it('distinguishes an empty history from a failed request', async () => {
    loadHistory.mockResolvedValueOnce({ ...history, history: [] });
    render(
      <ProductHistoryDialog
        product={product}
        open
        onOpenChange={onOpenChange}
      />,
    );

    expect(await screen.findByText(/No snapshots yet/)).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Retry history' })).toBeNull();
  });
});
