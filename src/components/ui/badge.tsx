'use client';

import { Chip, type ChipProps } from '@heroui/react';
import { cn } from '@/lib/utils';

type BadgeVariant =
  'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';

interface BadgeProps extends Omit<ChipProps, 'color' | 'variant'> {
  variant?: BadgeVariant;
}

/**
 * Renders compact metadata with HeroUI Chip semantics.
 *
 * @param props - Chip props and a domain-facing visual variant.
 * @returns A small HeroUI chip for symbols, categories, and statuses.
 */
function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const danger = variant === 'destructive';
  const outlined = variant === 'outline';

  return (
    <Chip
      className={cn('font-mono text-[0.625rem] tracking-wide', className)}
      color={danger ? 'danger' : 'default'}
      size="sm"
      variant={danger ? 'soft' : outlined ? 'tertiary' : 'secondary'}
      {...props}
    />
  );
}

export { Badge };
