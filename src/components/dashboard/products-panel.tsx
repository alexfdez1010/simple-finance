/** Searchable portfolio holdings workspace. */
'use client';

import { useState } from 'react';
import { Button, Card } from '@heroui/react';
import { Plus, MagnifyingGlass } from '@phosphor-icons/react';
import { ProductCard } from '@/components/products/product-card';
import { HoldingsToolbar } from './holdings-toolbar';
import { queryHoldings, type HoldingsSort } from './holdings-query';
import type {
  FinancialProduct,
  ProductWithValue,
} from '@/lib/domain/models/product.types';

interface ProductsPanelProps {
  products: ProductWithValue[];
  onAddProduct: () => void;
  onEditProduct: (product: FinancialProduct) => void;
  onDeleteProduct: (product: FinancialProduct) => void;
  onViewProduct: (product: FinancialProduct) => void;
}

/**
 * Renders searchable, sortable holdings without mutating the supplied collection.
 * @param props - Holdings and callbacks for add, edit, delete, and history actions.
 * @returns The product grid or actionable empty states; search/sort stay local.
 * Portfolio changes are delegated to callbacks; empty searches can be cleared.
 */
export function ProductsPanel({
  products,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onViewProduct,
}: ProductsPanelProps) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<HoldingsSort>('value');
  const filtered = queryHoldings(products, query, sort);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Your holdings
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your positions and explore their history.
          </p>
        </div>
        {products.length > 0 && (
          <Button
            className="min-h-11"
            onPress={onAddProduct}
            size="sm"
            variant="primary"
          >
            <Plus aria-hidden size={16} weight="bold" />
            Add Product
          </Button>
        )}
      </div>
      {products.length === 0 ? (
        <Card className="finance-card py-0">
          <Card.Content className="flex min-h-52 flex-col items-center justify-center gap-4 p-6 text-center">
            <h3 className="text-lg font-semibold">Build your portfolio</h3>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Your portfolio starts here. Add your first holding to unlock
              allocation and performance insights.
            </p>
            <Button
              className="min-h-11"
              onPress={onAddProduct}
              size="sm"
              variant="primary"
            >
              <Plus aria-hidden size={16} weight="bold" />
              Add Product
            </Button>
          </Card.Content>
        </Card>
      ) : (
        <>
          <HoldingsToolbar
            query={query}
            sort={sort}
            onQueryChange={setQuery}
            onSortChange={setSort}
          />
          <p
            role="status"
            aria-atomic="true"
            className="text-xs text-muted-foreground"
          >
            {filtered.length} of {products.length} holdings
            {filtered.length === 0 ? ' · No matching holdings' : ''}
          </p>
          {filtered.length === 0 ? (
            <Card className="finance-card py-0">
              <Card.Content className="flex min-h-52 flex-col items-center justify-center gap-3 p-6 text-center">
                <MagnifyingGlass
                  aria-hidden
                  size={28}
                  className="text-muted-foreground"
                />
                <h3 className="text-lg font-semibold">No matching holdings</h3>
                <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                  Try a different name, symbol, or currency to find your
                  position.
                </p>
                <Button
                  className="min-h-11"
                  variant="outline"
                  onPress={() => setQuery('')}
                >
                  Show all holdings
                </Button>
              </Card.Content>
            </Card>
          ) : (
            <section
              aria-label="Products"
              className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
            >
              {filtered.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  currentValue={product.currentValue}
                  currentValueEur={product.currentValueEur}
                  investedEur={product.investedEur}
                  expectedAnnualReturn={product.expectedAnnualReturn}
                  onEdit={onEditProduct}
                  onDelete={onDeleteProduct}
                  onView={onViewProduct}
                />
              ))}
            </section>
          )}
        </>
      )}
    </div>
  );
}
