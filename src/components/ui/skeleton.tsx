/**
 * Skeleton loading component for progressive UI loading
 * @module components/ui/skeleton
 */

import { cn } from '@/lib/utils';

/**
 * Skeleton component for loading placeholders
 *
 * @param props - Standard div props with optional className
 * @returns Animated skeleton placeholder element
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  );
}

export { Skeleton };
