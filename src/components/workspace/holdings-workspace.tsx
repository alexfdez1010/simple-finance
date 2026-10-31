'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Plus } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { ProductsPanel } from '@/components/dashboard/products-panel';
import { CurrencyWorkspace } from './currency-workspace';
import { useDialogFocus } from './use-dialog-focus';
import { deleteProductAction } from '@/lib/actions/product-actions';
import type {
  FinancialProduct,
  ProductWithValue,
} from '@/lib/domain/models/product.types';
import type { DisplayCurrency } from '@/lib/utils/format-currency';

type HoldingsDialog =
  | { kind: 'add'; source: 'yahoo' | 'custom' }
  | { kind: 'edit' | 'delete' | 'history'; product: FinancialProduct };

const AddProductDialog = dynamic(() =>
  import('@/components/products/add-product-dialog').then(
    (module) => module.AddProductDialog,
  ),
);
const EditProductDialog = dynamic(() =>
  import('@/components/products/edit-product-dialog').then(
    (module) => module.EditProductDialog,
  ),
);
const DeleteProductDialog = dynamic(() =>
  import('@/components/products/delete-product-dialog').then(
    (module) => module.DeleteProductDialog,
  ),
);
const ProductHistoryDialog = dynamic(() =>
  import('@/components/products/product-history-dialog').then(
    (module) => module.ProductHistoryDialog,
  ),
);

/**
 * Owns product management state exclusively inside the holdings route.
 * @param props - Server-valued products and display rates.
 * @returns Searchable holdings and lazily loaded dialogs with complete exit motion.
 * Only confirmed deletion mutates data; failures stay in the confirmation dialog.
 */
export function HoldingsWorkspace({
  products,
  rates,
}: {
  products: ProductWithValue[];
  rates: Record<DisplayCurrency, number>;
}) {
  const [dialog, setDialog] = useState<HoldingsDialog | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState(0);
  const rememberTrigger = useDialogFocus(isOpen);

  /**
   * Opens a fresh form while retaining the previous dialog through its exit.
   * @param target - The requested form or holding detail; never mutates its data.
   * @returns Nothing; resets local form state through a new session key.
   */
  function showDialog(target: HoldingsDialog): void {
    rememberTrigger(setDialog, target);
    setSession((previous) => previous + 1);
    setIsOpen(true);
  }

  /** Deletes the selected holding; rejects failures so the dialog permits retry. */
  async function confirmDelete() {
    if (dialog?.kind !== 'delete') return;
    const result = await deleteProductAction(dialog.product.id);
    if (!result.success)
      throw new Error(result.error || 'Could not delete this holding');
    setIsOpen(false);
  }

  return (
    <CurrencyWorkspace
      rates={rates}
      title="Your holdings"
      description="Manage positions, contributions, and individual investment history"
      actions={
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            className="min-h-11"
            onPress={() => showDialog({ kind: 'add', source: 'yahoo' })}
          >
            <Plus aria-hidden size={16} />
            Yahoo Product
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="min-h-11"
            onPress={() => showDialog({ kind: 'add', source: 'custom' })}
          >
            <Plus aria-hidden size={16} />
            Custom Product
          </Button>
        </div>
      }
    >
      <ProductsPanel
        products={products}
        showHeading={false}
        onAddProduct={() => showDialog({ kind: 'add', source: 'yahoo' })}
        onEditProduct={(product) => showDialog({ kind: 'edit', product })}
        onDeleteProduct={(product) => showDialog({ kind: 'delete', product })}
        onViewProduct={(product) => showDialog({ kind: 'history', product })}
      />
      {dialog?.kind === 'add' && (
        <AddProductDialog
          key={session}
          open={isOpen}
          defaultTab={dialog.source}
          onOpenChange={setIsOpen}
        />
      )}
      {dialog?.kind === 'edit' && (
        <EditProductDialog
          key={session}
          open={isOpen}
          product={dialog.product}
          onOpenChange={setIsOpen}
        />
      )}
      {dialog?.kind === 'delete' && (
        <DeleteProductDialog
          key={session}
          open={isOpen}
          productName={dialog.product.name}
          onConfirm={confirmDelete}
          onOpenChange={setIsOpen}
        />
      )}
      {dialog?.kind === 'history' && (
        <ProductHistoryDialog
          key={session}
          open={isOpen}
          product={dialog.product}
          onOpenChange={setIsOpen}
        />
      )}
    </CurrencyWorkspace>
  );
}
