'use client';

import { Label as HeroLabel, type LabelProps } from '@heroui/react';
import { cn } from '@/lib/utils';

/** Renders a HeroUI form label with the shared compact typography. */
function Label({ className, ...props }: LabelProps) {
  return (
    <HeroLabel className={cn('text-xs font-medium', className)} {...props} />
  );
}

export { Label };
