import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import { ProductsPanel } from '@/components/dashboard/products-panel';
import { DisplayCurrencyProvider } from '@/components/dashboard/display-currency-context';
import type { ProductWithValue } from '@/lib/domain/models/product.types';
import { createHoldingsFixtures } from './holdings-fixtures';

afterEach(cleanup);

/**
 * Renders the real holdings workspace with deterministic currency rates and callbacks.
 * @param products - Holdings to render, including an empty collection.
 * @returns Callback spies and the RTL render result; rendering mounts the provider.
 */
function renderWorkspace(
  products: ProductWithValue[] = createHoldingsFixtures(),
) {
  const callbacks = {
    onAddProduct: vi.fn(),
    onEditProduct: vi.fn(),
    onDeleteProduct: vi.fn(),
    onViewProduct: vi.fn(),
  };
  const view = render(
    <DisplayCurrencyProvider
      rates={{ EUR: 1, USD: 1, BTC: 1, ETH: 1, XAUT: 1 }}
    >
      <ProductsPanel products={products} {...callbacks} />
    </DisplayCurrencyProvider>,
  );
  return { ...callbacks, ...view };
}

describe('ProductsPanel', () => {
  it('filters real cards and restores them through no-result recovery', () => {
    renderWorkspace();
    const search = screen.getByLabelText('Search holdings');
    expect(screen.getAllByTestId('product-card')).toHaveLength(3);
    fireEvent.change(search, { target: { value: 'not-a-holding' } });

    expect(screen.queryAllByTestId('product-card')).toHaveLength(0);
    expect(screen.getByRole('status').textContent).toContain(
      '0 of 3 holdings · No matching holdings',
    );
    expect(
      screen.getByRole('heading', { name: 'No matching holdings' }),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Show all holdings' }));

    expect((search as HTMLInputElement).value).toBe('');
    expect(screen.getAllByTestId('product-card')).toHaveLength(3);
    expect(screen.getByRole('status').textContent).toBe('3 of 3 holdings');
  });

  it('clears the search and returns keyboard focus to its input', () => {
    renderWorkspace();
    const search = screen.getByLabelText('Search holdings');
    expect(screen.queryByRole('button', { name: 'Clear search' })).toBeNull();
    fireEvent.change(search, { target: { value: 'btc' } });
    expect(screen.getAllByTestId('product-card')).toHaveLength(1);
    const clear = screen.getByRole('button', { name: 'Clear search' });
    act(() => clear.focus());
    fireEvent.click(clear);

    expect((search as HTMLInputElement).value).toBe('');
    expect(document.activeElement).toBe(search);
    expect(screen.queryByRole('button', { name: 'Clear search' })).toBeNull();
    expect(screen.getAllByTestId('product-card')).toHaveLength(3);
  });

  it('delegates add, edit, delete and history without changing holdings', () => {
    const holdings = createHoldingsFixtures();
    const snapshot = structuredClone(holdings);
    const callbacks = renderWorkspace(holdings);
    const actions = within(
      screen.getByRole('group', { name: 'Actions for Alpha shares' }),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Add Product' }));
    fireEvent.click(actions.getByRole('button', { name: 'Edit product' }));
    fireEvent.click(actions.getByRole('button', { name: 'Delete product' }));
    fireEvent.click(
      actions.getByRole('button', { name: 'View product history' }),
    );

    expect(callbacks.onAddProduct).toHaveBeenCalledOnce();
    expect(callbacks.onEditProduct).toHaveBeenCalledExactlyOnceWith(
      holdings[1],
    );
    expect(callbacks.onDeleteProduct).toHaveBeenCalledExactlyOnceWith(
      holdings[1],
    );
    expect(callbacks.onViewProduct).toHaveBeenCalledExactlyOnceWith(
      holdings[1],
    );
    expect(holdings).toEqual(snapshot);
  });

  it('offers a first-holding action without irrelevant search controls', () => {
    const { onAddProduct } = renderWorkspace([]);
    expect(
      screen.getByRole('heading', { name: 'Build your portfolio' }),
    ).toBeTruthy();
    expect(screen.queryByLabelText('Search holdings')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Add Product' }));
    expect(onAddProduct).toHaveBeenCalledOnce();
  });
});
