'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Plus } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { ProductsPanel } from '@/components/dashboard/products-panel';
import { CurrencyWorkspace } from './currency-workspace';
import { deleteProductAction } from '@/lib/actions/product-actions';
import type {
  FinancialProduct,
  ProductWithValue,
} from '@/lib/domain/models/product.types';
import type { DisplayCurrency } from '@/lib/utils/format-currency';

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
 * @returns Searchable holdings and lazily loaded, conditionally mounted dialogs.
 * Only confirmed deletion mutates data; failures stay in the confirmation dialog.
 */
export function HoldingsWorkspace({
  products,
  rates,
}: {
  products: ProductWithValue[];
  rates: Record<DisplayCurrency, number>;
}) {
  const [addSource, setAddSource] = useState<'yahoo' | 'custom' | null>(null);
  const [editProduct, setEditProduct] = useState<FinancialProduct | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FinancialProduct | null>(
    null,
  );
  const [historyTarget, setHistoryTarget] = useState<FinancialProduct | null>(
    null,
  );

  /** Deletes the selected holding; rejects failures so the dialog permits retry. */
  async function confirmDelete() {
    if (!deleteTarget) return;
    const result = await deleteProductAction(deleteTarget.id);
    if (!result.success)
      throw new Error(result.error || 'Could not delete this holding');
    setDeleteTarget(null);
  }

  return (
    <CurrencyWorkspace
      rates={rates}
      title="Your holdings"
      description="Manage positions, contributions, and individual investment history."
      actions={
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            className="min-h-11"
            onPress={() => setAddSource('yahoo')}
          >
            <Plus aria-hidden size={16} />
            Yahoo Product
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="min-h-11"
            onPress={() => setAddSource('custom')}
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
        onAddProduct={() => setAddSource('yahoo')}
        onEditProduct={setEditProduct}
        onDeleteProduct={setDeleteTarget}
        onViewProduct={setHistoryTarget}
      />
      {addSource && (
        <AddProductDialog
          open
          defaultTab={addSource}
          onOpenChange={(open) => !open && setAddSource(null)}
        />
      )}
      {editProduct && (
        <EditProductDialog
          open
          product={editProduct}
          onOpenChange={(open) => !open && setEditProduct(null)}
        />
      )}
      {deleteTarget && (
        <DeleteProductDialog
          open
          productName={deleteTarget.name}
          onConfirm={confirmDelete}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
        />
      )}
      {historyTarget && (
        <ProductHistoryDialog
          open
          product={historyTarget}
          onOpenChange={(open) => !open && setHistoryTarget(null)}
        />
      )}
    </CurrencyWorkspace>
  );
}
