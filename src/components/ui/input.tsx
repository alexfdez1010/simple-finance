'use client';

import { Input as HeroInput, type InputProps } from '@heroui/react';
import { cn } from '@/lib/utils';

/**
 * Renders a full-width HeroUI input for finance forms.
 *
 * @param props - Standard HeroUI and HTML input properties.
 * @returns A compact secondary HeroUI input.
 */
function Input({ className, ...props }: InputProps) {
  return (
    <HeroInput
      className={cn('h-10 w-full rounded-md tabular-nums', className)}
      fullWidth
      variant="secondary"
      {...props}
    />
  );
}

export { Input };
