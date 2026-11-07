'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChartLineUp,
  ShieldCheck,
  SquaresFour,
  Wallet,
  PlugsConnected,
  HourglassSimple,
} from '@phosphor-icons/react';
import { SignOutButton } from '@/components/auth/sign-out-button';
import { cn } from '@/lib/utils';
import { useNavigationIndicator } from './use-navigation-indicator';

const destinations = [
  { href: '/dashboard', label: 'Home', icon: SquaresFour },
  { href: '/dashboard/portfolio', label: 'Holdings', icon: Wallet },
  { href: '/dashboard/analytics', label: 'Analytics', icon: ChartLineUp },
  { href: '/dashboard/runway', label: 'Runway', icon: HourglassSimple },
  { href: '/dashboard/skill', label: 'Agent setup', icon: PlugsConnected },
];

/**
 * Renders the persistent route navigation with a single active destination.
 * @returns Responsive, keyboard-accessible links; nested analytics inherit selection.
 * Uses the current pathname; links defer data fetching until navigation.
 */
export function WorkspaceNavigation() {
  const pathname = usePathname();
  const navigationRef = useNavigationIndicator(pathname);
  return (
    <aside className="relative z-40 bg-card lg:fixed lg:bottom-[env(safe-area-inset-bottom)] lg:left-[env(safe-area-inset-left)] lg:top-[env(safe-area-inset-top)] lg:flex lg:w-60 lg:flex-col">
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
            Portfolio & performance
          </span>
        </span>
      </Link>
      <nav
        ref={navigationRef}
        aria-label="Main navigation"
        className="navigation-track workspace-navigation mobile-dock fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-[max(0.75rem,env(safe-area-inset-left))] right-[max(0.75rem,env(safe-area-inset-right))] grid grid-cols-5 gap-1 rounded-2xl bg-card/95 p-2 shadow-[0_8px_40px_rgb(25_36_60/0.12)] backdrop-blur-xl lg:relative lg:inset-auto lg:mx-4 lg:mt-4 lg:grid-cols-1 lg:gap-1.5 lg:rounded-none lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none"
      >
        <span aria-hidden className="navigation-indicator" />
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
                'navigation-link group flex min-h-12 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[10px] font-medium lg:flex-row lg:justify-start lg:gap-3 lg:px-4 lg:text-[13px]',
                active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:bg-default hover:text-foreground',
              )}
            >
              <Icon
                aria-hidden
                size={19}
                className="navigation-icon shrink-0"
                weight={active ? 'duotone' : 'regular'}
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="absolute right-4 top-5 lg:static lg:mt-auto lg:px-6 lg:pb-6 lg:pt-12">
        <div className="flex items-center gap-1 lg:flex-col lg:items-stretch">
          <Link
            href="/dashboard/security"
            prefetch={false}
            aria-label="Account security"
            aria-current={
              pathname === '/dashboard/security' ? 'page' : undefined
            }
            className="flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg px-2 text-sm text-muted-foreground hover:bg-default hover:text-foreground lg:justify-start"
          >
            <ShieldCheck aria-hidden size={18} />
            <span className="hidden lg:inline">Account security</span>
          </Link>
          <SignOutButton />
        </div>
      </div>
    </aside>
  );
}
