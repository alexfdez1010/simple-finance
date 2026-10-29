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
      className="mb-8 grid grid-cols-4 gap-1 rounded-2xl bg-default/70 p-1.5 sm:inline-flex"
    >
      {views.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          prefetch={false}
          aria-current={pathname === href ? 'page' : undefined}
          className={cn(
            'navigation-link inline-flex min-h-11 items-center justify-center rounded-xl px-2 text-center text-xs font-medium sm:px-5 sm:text-sm',
            pathname === href
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-default hover:text-foreground',
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
