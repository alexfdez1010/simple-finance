/**
 * Dialog for adding new products with tabbed Yahoo/Custom forms
 * @module components/products/add-product-dialog
 */

'use client';

import { Modal, Tabs } from '@heroui/react';
import { ChartLineUp, Vault } from '@phosphor-icons/react';
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
  /** Closes after a confirmed save; the backdrop retains its exit lifecycle. */
  const handleSuccess = () => {
    onOpenChange(false);
  };

  return (
    <Modal>
      <Modal.Backdrop
        className="finance-dialog-backdrop"
        isOpen={open}
        onOpenChange={onOpenChange}
        variant="opaque"
      >
        <Modal.Container
          className="finance-dialog-motion"
          placement="center"
          scroll="inside"
          size="md"
        >
          <Modal.Dialog className="rounded-xl">
            <Modal.CloseTrigger aria-label="Close" />
            <Modal.Header className="pb-2">
              <Modal.Heading className="font-serif text-xl tracking-tight">
                Add Product
              </Modal.Heading>
              <p className="max-w-md text-sm text-muted-foreground">
                Choose a market asset or a fixed-rate investment
              </p>
            </Modal.Header>
            <Modal.Body className="pt-2">
              <Tabs
                key={defaultTab}
                className="w-full"
                defaultSelectedKey={defaultTab}
                variant="secondary"
              >
                <Tabs.List aria-label="Product type" className="w-full">
                  <Tabs.Tab
                    id="yahoo"
                    className="flex-1 px-2 text-xs sm:text-sm"
                  >
                    <span className="flex items-center justify-center gap-2 whitespace-nowrap">
                      <ChartLineUp
                        aria-hidden
                        size={18}
                        weight="duotone"
                        className="shrink-0 max-[359px]:hidden"
                      />
                      Yahoo Finance
                    </span>
                  </Tabs.Tab>
                  <Tabs.Tab
                    id="custom"
                    className="flex-1 px-2 text-xs sm:text-sm"
                  >
                    <span className="flex items-center justify-center gap-2 whitespace-nowrap">
                      <Vault
                        aria-hidden
                        size={18}
                        weight="duotone"
                        className="shrink-0 max-[359px]:hidden"
                      />
                      Custom Product
                    </span>
                  </Tabs.Tab>
                </Tabs.List>
                <Tabs.Panel id="yahoo" className="pt-5">
                  <YahooProductForm onSuccess={handleSuccess} />
                </Tabs.Panel>
                <Tabs.Panel id="custom" className="pt-5">
                  <CustomProductForm onSuccess={handleSuccess} />
                </Tabs.Panel>
              </Tabs>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
