import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DeleteProductDialog } from '@/components/products/delete-product-dialog';

afterEach(cleanup);

describe('DeleteProductDialog', () => {
  it('cancels without deleting the product', () => {
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <DeleteProductDialog
        open
        productName="Savings"
        onConfirm={onConfirm}
        onOpenChange={onOpenChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('blocks repeat deletion, cancellation and keyboard dismissal while pending', async () => {
    let finish!: () => void;
    const onConfirm = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    const onOpenChange = vi.fn();
    render(
      <DeleteProductDialog
        open
        productName="Savings"
        onConfirm={onConfirm}
        onOpenChange={onOpenChange}
      />,
    );

    const remove = screen.getByRole('button', { name: 'Delete' });
    fireEvent.click(remove);
    fireEvent.click(remove);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    fireEvent.keyDown(screen.getByRole('alertdialog'), { key: 'Escape' });
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(
      (screen.getByRole('button', { name: 'Deleting...' }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    expect(
      (screen.getByRole('button', { name: 'Cancel' }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);

    await act(async () => finish());
    expect(
      (screen.getByRole('button', { name: 'Delete' }) as HTMLButtonElement)
        .disabled,
    ).toBe(false);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('exposes a failed deletion and allows retry', async () => {
    const onConfirm = vi
      .fn()
      .mockRejectedValueOnce(new Error('Product could not be deleted.'))
      .mockResolvedValueOnce(undefined);
    render(
      <DeleteProductDialog
        open
        productName="Savings"
        onConfirm={onConfirm}
        onOpenChange={vi.fn()}
      />,
    );

    await act(async () =>
      fireEvent.click(screen.getByRole('button', { name: 'Delete' })),
    );
    expect(screen.getByRole('alert').textContent).toBe(
      'Product could not be deleted.',
    );
    await act(async () =>
      fireEvent.click(screen.getByRole('button', { name: 'Delete' })),
    );
    expect(onConfirm).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('resets failure feedback when the selected product key changes', async () => {
    const onConfirm = vi
      .fn()
      .mockRejectedValueOnce(new Error('Savings could not be deleted.'));
    const { rerender } = render(
      <DeleteProductDialog
        key="savings"
        open
        productName="Savings"
        onConfirm={onConfirm}
        onOpenChange={vi.fn()}
      />,
    );
    await act(async () =>
      fireEvent.click(screen.getByRole('button', { name: 'Delete' })),
    );
    expect(screen.getByRole('alert')).toBeTruthy();

    rerender(
      <DeleteProductDialog
        key="reserve"
        open
        productName="Reserve"
        onConfirm={onConfirm}
        onOpenChange={vi.fn()}
      />,
    );
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByText(/delete "Reserve"/)).toBeTruthy();
  });
});
