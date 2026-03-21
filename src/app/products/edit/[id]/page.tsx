/**
 * Edit product page - loads product and renders appropriate form
 * @module app/products/edit/[id]/page
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getProduct } from '@/lib/actions/product-actions';
import { EditYahooForm } from '@/components/products/edit-yahoo-form';
import { EditCustomForm } from '@/components/products/edit-custom-form';
import { Skeleton } from '@/components/ui/skeleton';
import type { FinancialProduct } from '@/lib/domain/models/product.types';

/**
 * Edit product page component
 *
 * @returns Edit page element
 */
export default function EditProductPage() {
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<FinancialProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProduct() {
      try {
        const fetched = await getProduct(productId);
        if (!fetched) {
          setError('Product not found');
        } else {
          setProduct(fetched);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [productId]);

  const pageShell = (children: React.ReactNode) => (
    <div className="min-h-screen bg-gradient-to-br from-[oklch(0.97_0.008_80)] via-[oklch(0.96_0.015_240)] to-[oklch(0.95_0.02_280)] dark:from-slate-950 dark:via-[oklch(0.15_0.02_260)] dark:to-[oklch(0.13_0.025_280)]">
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-lg">
        {children}
      </div>
    </div>
  );

  if (loading) {
    return pageShell(
      <div className="space-y-4 animate-fade-up">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-9 w-48" />
        <div className="glass-card bg-card rounded-2xl border border-border p-6 space-y-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="h-3 w-20 mb-2" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>,
    );
  }

  if (error && !product) {
    return pageShell(
      <div className="animate-fade-up">
        <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 mb-4">
          <p className="text-destructive text-sm">{error}</p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to Dashboard
        </Link>
      </div>,
    );
  }

  if (!product) return null;

  const subtitle =
    product.type === 'YAHOO_FINANCE'
      ? `Yahoo Finance — ${product.yahoo.symbol}`
      : 'Custom Product';

  return pageShell(
    <>
      <div className="mb-6 animate-fade-up">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          ← Back to Dashboard
        </Link>
        <h1 className="font-serif text-2xl sm:text-3xl text-foreground">
          Edit Product
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      </div>
      <div
        className="glass-card bg-card rounded-2xl shadow-sm border border-border p-5 sm:p-6 animate-fade-up"
        style={{ animationDelay: '100ms' }}
      >
        {product.type === 'YAHOO_FINANCE' ? (
          <EditYahooForm product={product} />
        ) : (
          <EditCustomForm product={product} />
        )}
      </div>
    </>,
  );
}
