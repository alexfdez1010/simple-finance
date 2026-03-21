/**
 * Dialog for editing existing products
 * @module components/products/edit-product-dialog
 */

'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle className="font-serif text-xl">
              Edit Product
            </DialogTitle>
            <Badge variant="secondary">
              {isYahoo ? 'Yahoo Finance' : 'Custom'}
            </Badge>
          </div>
          <DialogDescription>{product.name}</DialogDescription>
        </DialogHeader>

        {isYahoo ? (
          <EditYahooForm product={product} onSuccess={handleSuccess} />
        ) : (
          <EditCustomForm product={product} onSuccess={handleSuccess} />
        )}
      </DialogContent>
    </Dialog>
  );
}
