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
    <header className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
      <div className="min-w-0">
        <h1 className="text-[28px] leading-tight font-semibold tracking-[-0.035em] sm:text-[34px]">
          {title}
        </h1>
        <p className="mt-2 max-w-prose text-[13px] leading-relaxed text-muted-foreground sm:text-sm">
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
