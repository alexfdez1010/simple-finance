/**
 * Dialog for adding new products with tabbed Yahoo/Custom forms
 * @module components/products/add-product-dialog
 */

'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { YahooProductForm } from '@/components/products/yahoo-product-form';
import { CustomProductForm } from '@/components/products/custom-product-form';

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: 'yahoo' | 'custom';
}

/**
 * Add product dialog with tabbed interface for Yahoo and Custom products
 *
 * @param props - Dialog props with open state and tab selection
 * @returns Dialog element
 */
export function AddProductDialog({
  open,
  onOpenChange,
  defaultTab = 'yahoo',
}: AddProductDialogProps) {
  const handleSuccess = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Add Product</DialogTitle>
          <DialogDescription>
            Track stocks from Yahoo Finance or custom fixed-rate investments.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={defaultTab}>
          <TabsList className="w-full">
            <TabsTrigger value="yahoo" className="flex-1">
              Yahoo Finance
            </TabsTrigger>
            <TabsTrigger value="custom" className="flex-1">
              Custom Product
            </TabsTrigger>
          </TabsList>

          <TabsContent value="yahoo" className="mt-4">
            <YahooProductForm onSuccess={handleSuccess} />
          </TabsContent>

          <TabsContent value="custom" className="mt-4">
            <CustomProductForm onSuccess={handleSuccess} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
