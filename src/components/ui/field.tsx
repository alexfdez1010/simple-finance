'use client';

import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

/** Renders one labelled form-control group. */
function Field({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex w-full flex-col gap-1.5', className)}
      data-slot="field"
      role="group"
      {...props}
    />
  );
}

/** Renders a compact HeroUI label inside a field. */
function FieldLabel({
  className,
  ...props
}: React.ComponentProps<typeof Label>) {
  return (
    <Label
      className={cn('text-xs font-medium text-foreground', className)}
      data-slot="field-label"
      {...props}
    />
  );
}

/** Renders a vertically spaced collection of related fields. */
function FieldGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex w-full flex-col gap-5', className)}
      data-slot="field-group"
      {...props}
    />
  );
}

export { Field, FieldGroup, FieldLabel };
