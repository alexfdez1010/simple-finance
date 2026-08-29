/**
 * Form action buttons for product forms
 * @module components/products/form-actions
 */

import Link from 'next/link';
import type { ReactNode } from 'react';
import { Spinner } from '@heroui/react';
import { Button, type ButtonProps } from '@/components/ui/button';

interface FormActionsProps {
  loading: boolean;
  loadingText?: string;
  submitText?: string;
}

/**
 * Submit and cancel button pair for product forms
 *
 * @param props - Action button props
 * @returns Form actions element
 */
export function FormActions({
  loading,
  loadingText = 'Saving...',
  submitText = 'Add Product',
}: FormActionsProps) {
  return (
    <div className="flex gap-3 pt-2">
      <LoadingButton
        type="submit"
        loading={loading}
        loadingText={loadingText}
        className="flex-1"
      >
        {submitText}
      </LoadingButton>
      <Link
        href="/dashboard"
        className="inline-flex min-h-10 items-center rounded-md px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Cancel
      </Link>
    </div>
  );
}

/**
 * Error message display for forms
 *
 * @param props - Error props
 * @returns Error element or null
 */
export function FormError({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <p
      className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
      role="alert"
      aria-live="assertive"
    >
      {error}
    </p>
  );
}

interface LoadingButtonProps extends Omit<ButtonProps, 'children'> {
  children: ReactNode;
  loading: boolean;
  loadingText: string;
}

/**
 * Renders a HeroUI-backed action button with a consistent pending state.
 *
 * @param props - Button props plus pending state and its accessible label.
 * @returns A button that blocks duplicate submissions while work is pending.
 */
export function LoadingButton({
  loading,
  loadingText,
  disabled,
  children,
  ...props
}: LoadingButtonProps) {
  return (
    <Button aria-busy={loading} disabled={disabled || loading} {...props}>
      {loading && <Spinner aria-hidden size="sm" />}
      <span aria-live="polite">{loading ? loadingText : children}</span>
    </Button>
  );
}
