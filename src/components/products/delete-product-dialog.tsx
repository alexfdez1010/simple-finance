/**
 * Confirmation dialog for product deletion
 * @module components/products/delete-product-dialog
 */

'use client';

import { useState } from 'react';
import { AlertDialog } from '@heroui/react';
import { Trash } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/products/form-actions';

interface DeleteProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  onConfirm: () => void | Promise<void>;
}

/**
 * Alert dialog confirming product deletion
 *
 * @param props - Dialog props with product name and confirm callback
 * @returns AlertDialog element
 */
export function DeleteProductDialog({
  open,
  onOpenChange,
  productName,
  onConfirm,
}: DeleteProductDialogProps) {
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  /** Runs the destructive action while exposing its pending state. */
  const handleConfirm = async () => {
    setDeleteError(null);
    setDeleting(true);
    try {
      await onConfirm();
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : 'Failed to delete product.',
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialog.Backdrop
        isOpen={open}
        onOpenChange={onOpenChange}
        variant="opaque"
      >
        <AlertDialog.Container placement="center" size="sm">
          <AlertDialog.Dialog className="rounded-xl">
            <AlertDialog.Header>
              <AlertDialog.Icon status="danger">
                <Trash aria-hidden size={24} weight="duotone" />
              </AlertDialog.Icon>
              <AlertDialog.Heading className="font-serif tracking-tight">
                Delete Product
              </AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete &quot;{productName}&quot;? This
                action cannot be undone.
              </p>
              {deleteError && (
                <p className="mt-3 text-sm text-destructive" role="alert">
                  {deleteError}
                </p>
              )}
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button slot="close" variant="ghost" disabled={deleting}>
                Cancel
              </Button>
              <LoadingButton
                loading={deleting}
                loadingText="Deleting..."
                variant="destructive"
                onClick={handleConfirm}
              >
                Delete
              </LoadingButton>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>
  );
}
