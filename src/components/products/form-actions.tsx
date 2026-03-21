/**
 * Form action buttons for product forms
 * @module components/products/form-actions
 */

import Link from 'next/link';

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
      <button
        type="submit"
        disabled={loading}
        className="flex-1 py-3 px-4 bg-primary text-primary-foreground font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        {loading ? loadingText : submitText}
      </button>
      <Link
        href="/dashboard"
        className="px-5 py-3 bg-secondary text-secondary-foreground font-medium rounded-xl hover:bg-accent transition-colors text-sm text-center"
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
    <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20">
      <p className="text-sm text-destructive">{error}</p>
    </div>
  );
}
