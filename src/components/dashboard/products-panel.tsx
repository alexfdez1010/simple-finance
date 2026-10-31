/** Searchable portfolio holdings workspace. */
'use client';

import { useState } from 'react';
import { Button, Card } from '@heroui/react';
import { Plus, MagnifyingGlass } from '@phosphor-icons/react';
import { ProductCard } from '@/components/products/product-card';
import { PortfolioArtwork } from '@/components/visuals/portfolio-artwork';
import { HoldingsToolbar } from './holdings-toolbar';
import { queryHoldings, type HoldingsSort } from './holdings-query';
import type {
  FinancialProduct,
  ProductWithValue,
} from '@/lib/domain/models/product.types';

interface ProductsPanelProps {
  products: ProductWithValue[];
  showHeading?: boolean;
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
  showHeading = true,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onViewProduct,
}: ProductsPanelProps) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<HoldingsSort>('value');
  const filtered = queryHoldings(products, query, sort);

  return (
    <div className="space-y-6">
      {showHeading && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Your holdings
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your positions and explore their history
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
      )}
      {products.length === 0 ? (
        <Card className="finance-card py-0">
          <Card.Content className="flex min-h-96 flex-col items-center justify-center gap-4 px-6 py-12 text-center">
            <PortfolioArtwork />
            <h3 className="text-2xl font-semibold tracking-tight">
              Build your portfolio
            </h3>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Add your first holding to unlock allocation and performance
              insights
            </p>
            <Button
              className="mt-2 min-h-11 rounded-xl px-5"
              onPress={onAddProduct}
              size="sm"
              variant="primary"
            >
              <Plus aria-hidden size={16} weight="bold" />
              Add Product
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">
              Market assets and custom investments, in one place
            </p>
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
            className="flex items-center gap-2 text-xs font-medium text-muted-foreground"
          >
            {filtered.length} of {products.length} holdings
            {filtered.length === 0 ? ' · No matching holdings' : ''}
          </p>
          {filtered.length === 0 ? (
            <Card className="finance-card py-0">
              <Card.Content className="flex min-h-72 flex-col items-center justify-center gap-4 p-8 text-center">
                <span className="mb-1 flex size-14 items-center justify-center rounded-2xl bg-surface-secondary text-muted-foreground">
                  <MagnifyingGlass aria-hidden size={25} />
                </span>
                <h3 className="text-xl font-semibold tracking-tight">
                  No matching holdings
                </h3>
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
              className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3"
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
