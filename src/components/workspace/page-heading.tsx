import type { ReactNode } from 'react';

/**
 * Renders a workspace title, explanation, and optional actions.
 * @param props - Plain-language title, description, and independent controls.
 * @returns A responsive header; long text wraps without hiding actions.
 * Pure presentation with no data fetching or state.
 */
export function PageHeading({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      )}
    </header>
  );
}
