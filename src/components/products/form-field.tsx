/**
 * Reusable form field component for product forms
 * @module components/products/form-field
 */

interface FormFieldProps {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}

/**
 * Form field wrapper with label and optional hint text
 *
 * @param props - Field props
 * @returns Form field element
 */
export function FormField({ id, label, hint, children }: FormFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2"
      >
        {label}
      </label>
      {children}
      {hint && (
        <p className="mt-1.5 text-[11px] text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

/** Shared input class string for consistent styling */
export const inputClass =
  'w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all text-sm';
