'use client';

import { Card as HeroCard } from '@heroui/react';
import { cn } from '@/lib/utils';

/** Renders an opaque financial surface; accepts card props and children without side effects. */
function Card({ className, ...props }: React.ComponentProps<typeof HeroCard>) {
  return (
    <HeroCard
      className={cn('finance-card py-0 text-foreground', className)}
      variant="default"
      {...props}
    />
  );
}

/** Renders the structured header of a financial card. */
function CardHeader({
  className,
  ...props
}: React.ComponentProps<typeof HeroCard.Header>) {
  return (
    <HeroCard.Header
      className={cn('gap-1.5 p-5 pb-3 sm:p-6 sm:pb-3', className)}
      {...props}
    />
  );
}

/** Renders a semantic HeroUI card heading. */
function CardTitle({
  className,
  ...props
}: React.ComponentProps<typeof HeroCard.Title>) {
  return (
    <HeroCard.Title
      className={cn('text-[15px] font-semibold tracking-[-0.02em]', className)}
      {...props}
    />
  );
}

/** Renders secondary explanatory text within a card header. */
function CardDescription({
  className,
  ...props
}: React.ComponentProps<typeof HeroCard.Description>) {
  return (
    <HeroCard.Description
      className={cn('text-xs text-muted', className)}
      {...props}
    />
  );
}

/** Renders the main content region of a HeroUI card. */
function CardContent({
  className,
  ...props
}: React.ComponentProps<typeof HeroCard.Content>) {
  return (
    <HeroCard.Content
      className={cn('px-5 pb-5 sm:px-6 sm:pb-6', className)}
      {...props}
    />
  );
}

/** Renders an aligned footer region for card actions. */
function CardFooter({
  className,
  ...props
}: React.ComponentProps<typeof HeroCard.Footer>) {
  return (
    <HeroCard.Footer
      className={cn('px-5 pb-5 sm:px-6 sm:pb-6', className)}
      {...props}
    />
  );
}

/** Renders a right-aligned card action without adding another surface. */
function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('ml-auto self-start', className)} {...props} />;
}

export {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
};
