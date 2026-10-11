'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChartLineUp,
  SquaresFour,
  Wallet,
  PlugsConnected,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

const destinations = [
  { href: '/dashboard', label: 'Home', icon: SquaresFour },
  { href: '/dashboard/portfolio', label: 'Holdings', icon: Wallet },
  { href: '/dashboard/analytics', label: 'Analytics', icon: ChartLineUp },
  { href: '/dashboard/skill', label: 'Agent setup', icon: PlugsConnected },
];

/**
 * Renders the persistent route navigation with a single active destination.
 * @returns Responsive, keyboard-accessible links; nested analytics inherit selection.
 * Uses the current pathname; links defer data fetching until navigation.
 */
export function WorkspaceNavigation() {
  const pathname = usePathname();
  return (
    <aside className="border-b border-border bg-surface-secondary lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-56 lg:flex-col lg:border-r lg:border-b-0">
      <Link
        href="/dashboard"
        prefetch={false}
        className="flex min-h-20 items-center gap-3 px-5 text-foreground lg:px-6"
        aria-label="Simple Finance home"
      >
        <ChartLineUp aria-hidden size={24} className="text-primary" />
        <span className="text-base font-semibold tracking-tight">
          Simple Finance
        </span>
      </Link>
      <nav
        aria-label="Main navigation"
        className="grid grid-cols-4 gap-1 px-3 pb-3 lg:grid-cols-1 lg:gap-2 lg:px-4 lg:pt-6"
      >
        {destinations.map(({ href, label, icon: Icon }) => {
          const active =
            href === '/dashboard'
              ? pathname === href
              : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              prefetch={false}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex min-h-12 min-w-0 flex-col items-center justify-center gap-1 rounded-lg px-1 py-2 text-[11px] font-medium transition-colors hover:bg-default hover:text-foreground lg:flex-row lg:justify-start lg:gap-3 lg:px-3 lg:text-sm',
                active ? 'bg-primary/10 text-primary' : 'text-muted-foreground',
              )}
            >
              <Icon
                aria-hidden
                size={19}
                weight={active ? 'fill' : 'regular'}
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto hidden border-t border-border px-6 py-6 lg:block">
        <p className="text-xs font-medium">Your private portfolio</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Every position, in perspective.
        </p>
      </div>
    </aside>
  );
}
