/**
 * Dialog for editing existing products
 * @module components/products/edit-product-dialog
 */

'use client';

import { Modal } from '@heroui/react';
import { Badge } from '@/components/ui/badge';
import { EditYahooForm } from '@/components/products/edit-yahoo-form';
import { EditCustomForm } from '@/components/products/edit-custom-form';
import type { FinancialProduct } from '@/lib/domain/models/product.types';

interface EditProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: FinancialProduct | null;
}

/**
 * Edit product dialog that renders the appropriate form based on product type
 *
 * @param props - Dialog props with product data
 * @returns Dialog element
 */
export function EditProductDialog({
  open,
  onOpenChange,
  product,
}: EditProductDialogProps) {
  if (!product) return null;

  const handleSuccess = () => {
    onOpenChange(false);
  };

  const isYahoo = product.type === 'YAHOO_FINANCE';

  return (
    <Modal>
      <Modal.Backdrop
        isOpen={open}
        onOpenChange={onOpenChange}
        variant="opaque"
      >
        <Modal.Container placement="center" scroll="inside" size="md">
          <Modal.Dialog className="rounded-xl">
            <Modal.CloseTrigger aria-label="Close" />
            <Modal.Header className="pb-2">
              <div className="flex items-center gap-2">
                <Modal.Heading className="font-serif text-xl tracking-tight">
                  Edit Product
                </Modal.Heading>
                <Badge variant="secondary">
                  {isYahoo ? 'Yahoo Finance' : 'Custom'}
                </Badge>
              </div>
              <p className="truncate text-sm text-muted-foreground">
                {product.name}
              </p>
            </Modal.Header>
            <Modal.Body className="pt-3">
              {isYahoo ? (
                <EditYahooForm product={product} onSuccess={handleSuccess} />
              ) : (
                <EditCustomForm product={product} onSuccess={handleSuccess} />
              )}
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
