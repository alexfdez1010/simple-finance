'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const views = [
  { href: '/dashboard/analytics', label: 'Overview' },
  { href: '/dashboard/analytics/allocation', label: 'Allocation' },
  { href: '/dashboard/analytics/cash-flow', label: 'Cash flow' },
  { href: '/dashboard/analytics/risk', label: 'Risk' },
];

/**
 * Navigates between independently loaded analytics routes.
 * @returns Accessible route links with current-page state; no background data reads.
 * Long labels wrap inside four equal columns on narrow screens.
 */
export function AnalyticsNavigation() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Analytics views"
      className="mb-7 grid grid-cols-4 gap-1 border-b border-border pb-3 sm:flex sm:gap-2"
    >
      {views.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          prefetch={false}
          aria-current={pathname === href ? 'page' : undefined}
          className={cn(
            'inline-flex min-h-11 items-center justify-center rounded-lg px-2 text-center text-xs font-medium transition-colors sm:px-4 sm:text-sm',
            pathname === href
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-default hover:text-foreground',
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
