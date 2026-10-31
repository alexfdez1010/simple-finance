import { useState, type ComponentType } from 'react';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HoldingsWorkspace } from '@/components/workspace/holdings-workspace';
import { createHoldingsFixtures } from './holdings-fixtures';
import type {
  FinancialProduct,
  ProductWithValue,
} from '@/lib/domain/models/product.types';

const actions = vi.hoisted(() => ({ remove: vi.fn() }));
vi.mock('@/lib/actions/product-actions', () => ({
  deleteProductAction: actions.remove,
}));
vi.mock('next/dynamic', async () => {
  const { lazy, Suspense } = await import('react');
  return {
    default: (load: () => Promise<ComponentType<DialogProbeProps>>) => {
      const Loaded = lazy(async () => ({ default: await load() }));
      /** Keeps the lazy boundary local, matching Next's dynamic component behavior. */
      return function DynamicDialog(props: DialogProbeProps) {
        return (
          <Suspense fallback={null}>
            <Loaded {...props} />
          </Suspense>
        );
      };
    },
  };
});
vi.mock('@/components/products/add-product-dialog', () => ({
  AddProductDialog: (props: DialogProbeProps) => (
    <DialogProbe {...props} kind="add" />
  ),
}));
vi.mock('@/components/products/edit-product-dialog', () => ({
  EditProductDialog: (props: DialogProbeProps) => (
    <DialogProbe {...props} kind="edit" />
  ),
}));
vi.mock('@/components/products/delete-product-dialog', () => ({
  DeleteProductDialog: (props: DialogProbeProps) => (
    <DialogProbe {...props} kind="delete" />
  ),
}));
vi.mock('@/components/products/product-history-dialog', () => ({
  ProductHistoryDialog: (props: DialogProbeProps) => (
    <DialogProbe {...props} kind="history" />
  ),
}));

interface DialogProbeProps {
  kind?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: string;
  product?: FinancialProduct;
  productName?: string;
  onConfirm?: () => Promise<void>;
}

/** Models the lazy dialog boundary with real local draft state and asynchronous failure. */
function DialogProbe({
  kind,
  open,
  onOpenChange,
  defaultTab,
  product,
  productName,
  onConfirm,
}: DialogProbeProps) {
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');

  /** Exposes workspace action rejections without closing the dialog boundary. */
  async function confirm() {
    setError('');
    try {
      await onConfirm?.();
    } catch (failure) {
      setError((failure as Error).message);
    }
  }

  return (
    <section
      role="dialog"
      aria-label={`${kind} dialog`}
      hidden={!open}
      data-testid="dialog-probe"
    >
      <p>{defaultTab ?? productName ?? product?.name}</p>
      <input
        aria-label="Unsaved form value"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
      />
      <button onClick={() => onOpenChange(false)}>Close dialog</button>
      {onConfirm && <button onClick={confirm}>Confirm delete</button>}
      {error && <p role="alert">{error}</p>}
    </section>
  );
}

/** Renders real workspace controls while only replacing lazy dialog implementations. */
function renderWorkspace(
  products: ProductWithValue[] = createHoldingsFixtures(),
) {
  return render(
    <HoldingsWorkspace
      products={products}
      rates={{ EUR: 1, USD: 1, BTC: 1, ETH: 1, XAUT: 1 }}
    />,
  );
}

/** Returns a real product control or the workspace's market-product entry point. */
function opener(name: string) {
  return name === 'Yahoo Product'
    ? screen.getByRole('button', { name })
    : within(
        screen.getByRole('group', { name: 'Actions for Alpha shares' }),
      ).getByRole('button', { name });
}

beforeEach(() => {
  actions.remove.mockResolvedValue({ success: true });
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    return window.setTimeout(() => callback(0), 0);
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) =>
    window.clearTimeout(id),
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('holdings dialog lifecycle', () => {
  it.each([
    ['Yahoo Product', 'add'],
    ['Edit product', 'edit'],
    ['Delete product', 'delete'],
    ['View product history', 'history'],
  ])(
    'retains %s through close and gives the next %s session fresh state',
    async (label, kind) => {
      renderWorkspace();
      expect(screen.queryByTestId('dialog-probe')).toBeNull();
      fireEvent.click(opener(label));
      const dialog = await screen.findByRole('dialog', {
        name: `${kind} dialog`,
      });
      fireEvent.change(within(dialog).getByLabelText('Unsaved form value'), {
        target: { value: 'Unsubmitted draft' },
      });
      fireEvent.click(
        within(dialog).getByRole('button', { name: 'Close dialog' }),
      );

      expect(screen.queryByRole('dialog')).toBeNull();
      expect(screen.getByTestId('dialog-probe')).toBe(dialog);
      expect(dialog.hidden).toBe(true);

      fireEvent.click(opener(label));
      const reopened = await screen.findByRole('dialog', {
        name: `${kind} dialog`,
      });
      expect(reopened).not.toBe(dialog);
      expect(
        (
          within(reopened).getByLabelText(
            'Unsaved form value',
          ) as HTMLInputElement
        ).value,
      ).toBe('');
      expect(
        within(reopened).getByText(kind === 'add' ? 'yahoo' : 'Alpha shares'),
      ).toBeTruthy();
    },
  );

  it('routes each add entry point to its intended source after previous sessions close', async () => {
    renderWorkspace();
    for (const [entry, source] of [
      ['Yahoo Product', 'yahoo'],
      ['Custom Product', 'custom'],
    ]) {
      fireEvent.click(screen.getByRole('button', { name: entry }));
      const dialog = await screen.findByRole('dialog', { name: 'add dialog' });
      expect(within(dialog).getByText(source)).toBeTruthy();
      fireEvent.click(
        within(dialog).getByRole('button', { name: 'Close dialog' }),
      );
    }
  });

  it('opens the empty-portfolio add action on the market source', async () => {
    renderWorkspace([]);
    fireEvent.click(screen.getByRole('button', { name: 'Add Product' }));
    const dialog = await screen.findByRole('dialog', { name: 'add dialog' });
    expect(within(dialog).getByText('yahoo')).toBeTruthy();
  });

  it('keeps a failed deletion open and retains the closed dialog after successful retry', async () => {
    actions.remove.mockResolvedValueOnce({
      success: false,
      error: 'Please retry deletion',
    });
    renderWorkspace();
    fireEvent.click(opener('Delete product'));
    const dialog = await screen.findByRole('dialog', { name: 'delete dialog' });
    await act(async () =>
      fireEvent.click(
        within(dialog).getByRole('button', { name: 'Confirm delete' }),
      ),
    );

    expect(actions.remove).toHaveBeenCalledExactlyOnceWith('shares');
    expect(screen.getByRole('alert').textContent).toBe('Please retry deletion');
    expect(dialog.hidden).toBe(false);
    await act(async () =>
      fireEvent.click(
        within(dialog).getByRole('button', { name: 'Confirm delete' }),
      ),
    );

    await waitFor(() => expect(dialog.hidden).toBe(true));
    expect(actions.remove).toHaveBeenCalledTimes(2);
    expect(screen.getByTestId('dialog-probe')).toBe(dialog);
  });
});
