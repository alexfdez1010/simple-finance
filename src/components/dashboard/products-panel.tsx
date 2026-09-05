/** Searchable portfolio holdings workspace. */
'use client';
import { useState } from 'react';
import { Button, Card } from '@heroui/react';
import { Plus, MagnifyingGlass } from '@phosphor-icons/react';
import { ProductCard } from '@/components/products/product-card';
import type { DashboardTabsProps } from './dashboard-tabs';

/**
 * Renders searchable, sortable holdings without mutating the supplied collection.
 * @param props - Holdings and callbacks for add, edit, delete, and history actions.
 * @returns The product grid or an actionable empty state; search and sort stay local.
 */
export function ProductsPanel({
  products,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onViewProduct,
}: Pick<
  DashboardTabsProps,
  | 'products'
  | 'onAddProduct'
  | 'onEditProduct'
  | 'onDeleteProduct'
  | 'onViewProduct'
>) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('value');
  const search = query.trim().toLocaleLowerCase();
  const filtered = products
    .filter((product) =>
      `${product.name} ${product.type === 'YAHOO_FINANCE' ? product.yahoo.symbol : product.custom.currency}`
        .toLocaleLowerCase()
        .includes(search),
    )
    .sort((a, b) =>
      sort === 'name'
        ? a.name.localeCompare(b.name)
        : sort === 'gain'
          ? b.currentValueEur -
            b.investedEur -
            (a.currentValueEur - a.investedEur)
          : b.currentValueEur - a.currentValueEur,
    );
  if (products.length === 0) {
    return (
      <Card className="finance-card py-0">
        <Card.Content className="flex min-h-52 flex-col items-center justify-center gap-4 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Your portfolio starts here. Add your first holding to unlock
            allocation and performance insights.
          </p>
          <Button onPress={onAddProduct} size="sm" variant="primary">
            <Plus aria-hidden size={16} weight="bold" />
            Add Product
          </Button>
        </Card.Content>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-3">
        <label className="min-w-48 flex-1 text-xs font-medium text-muted-foreground">
          Search holdings
          <span className="finance-card mt-2 flex items-center gap-2 rounded-xl px-3">
            <MagnifyingGlass aria-hidden size={18} />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Name, symbol, or currency"
              className="min-w-0 flex-1 bg-transparent py-3 text-sm text-foreground outline-offset-2"
            />
          </span>
        </label>
        <label className="text-xs font-medium text-muted-foreground">
          Sort holdings
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="finance-card mt-2 block rounded-xl px-3 py-3 text-sm text-foreground"
          >
            <option value="value">Highest value</option>
            <option value="gain">Highest gain</option>
            <option value="name">Name A–Z</option>
          </select>
        </label>
      </div>
      <p role="status" className="text-xs text-muted-foreground">
        {filtered.length} of {products.length} holdings
        {filtered.length === 0
          ? ' · No matching holdings. Try a different search.'
          : ''}
      </p>
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
    </div>
  );
}
