'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowUpRight,
  ChartLineUp,
  LockSimple,
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
    <aside className="relative z-40 bg-card lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-60 lg:flex-col lg:border-r lg:border-border">
      <Link
        href="/dashboard"
        prefetch={false}
        className="flex min-h-20 items-center gap-3 px-5 text-foreground lg:min-h-28 lg:px-7"
        aria-label="Simple Finance home"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-foreground text-white">
          <ChartLineUp aria-hidden size={23} weight="bold" />
        </span>
        <span className="text-[17px] font-semibold tracking-[-0.03em]">
          Simple Finance
          <span className="mt-0.5 block text-[11px] font-normal tracking-normal text-muted-foreground">
            Every position, in perspective
          </span>
        </span>
      </Link>
      <nav
        aria-label="Main navigation"
        className="mobile-dock fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] grid grid-cols-4 gap-1 rounded-2xl border border-white/70 bg-card/95 p-2 shadow-[0_8px_40px_rgb(25_36_60/0.12)] backdrop-blur-xl lg:static lg:mx-4 lg:mt-4 lg:grid-cols-1 lg:gap-1.5 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none"
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
                'navigation-link group flex min-h-12 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[10px] font-medium hover:bg-default lg:flex-row lg:justify-start lg:gap-3 lg:px-4 lg:text-[13px]',
                active
                  ? 'bg-primary/8 text-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon
                aria-hidden
                size={19}
                className="navigation-icon shrink-0"
                weight={active ? 'fill' : 'regular'}
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto hidden px-5 pb-6 pt-12 lg:block">
        <Link
          href="/dashboard/analytics"
          prefetch={false}
          className="group block rounded-2xl bg-surface-secondary p-4"
        >
          <ChartLineUp size={22} className="mb-4 text-primary" aria-hidden />
          <p className="text-sm font-medium">See the bigger picture</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Explore what shapes your portfolio
          </p>
          <span className="mt-4 flex items-center gap-2 text-xs font-medium text-primary">
            Explore analytics{' '}
            <ArrowUpRight
              aria-hidden
              size={14}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </span>
        </Link>
        <div className="mt-6 flex items-center gap-2.5 px-2 text-muted-foreground">
          <LockSimple aria-hidden size={16} />
          <span className="text-xs">Your private portfolio</span>
        </div>
      </div>
    </aside>
  );
}
