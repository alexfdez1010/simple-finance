import { Skeleton as HeroSkeleton, type SkeletonProps } from '@heroui/react';
import { cn } from '@/lib/utils';

/**
 * Renders a quiet HeroUI loading placeholder.
 *
 * @param props - HeroUI skeleton properties.
 * @returns An accessible loading placeholder with restrained motion.
 */
function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <HeroSkeleton
      animationType="pulse"
      className={cn('rounded-md bg-surface-secondary', className)}
      {...props}
    />
  );
}

export { Skeleton };
