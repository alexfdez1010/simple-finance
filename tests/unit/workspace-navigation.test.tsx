import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { WorkspaceNavigation } from '@/components/workspace/workspace-navigation';
import { AnalyticsNavigation } from '@/components/workspace/analytics-navigation';

const route = vi.hoisted(() => ({ pathname: '/dashboard' }));
vi.mock('next/navigation', () => ({ usePathname: () => route.pathname }));
afterEach(cleanup);

describe('workspace route navigation', () => {
  it('selects home and exposes actual URLs rather than tabs', () => {
    route.pathname = '/dashboard';
    render(<WorkspaceNavigation />);
    expect(
      screen.getByRole('link', { name: 'Home' }).getAttribute('aria-current'),
    ).toBe('page');
    expect(
      screen.getByRole('link', { name: 'Holdings' }).getAttribute('href'),
    ).toBe('/dashboard/portfolio');
    expect(screen.queryByRole('tablist')).toBeNull();
    expect(
      screen
        .getAllByRole('link')
        .filter((link) => link.getAttribute('aria-current') === 'page'),
    ).toHaveLength(1);
  });
  it('keeps analytics selected for deep links and identifies the exact thematic view', () => {
    route.pathname = '/dashboard/analytics/cash-flow';
    render(
      <>
        <WorkspaceNavigation />
        <AnalyticsNavigation />
      </>,
    );
    expect(
      screen
        .getByRole('link', { name: 'Analytics' })
        .getAttribute('aria-current'),
    ).toBe('page');
    expect(
      screen
        .getByRole('link', { name: 'Cash flow' })
        .getAttribute('aria-current'),
    ).toBe('page');
    expect(
      screen
        .getByRole('link', { name: 'Overview' })
        .getAttribute('aria-current'),
    ).toBeNull();
  });
  it('does not select unrelated prefix collisions', () => {
    route.pathname = '/dashboard/portfolio-old';
    render(<WorkspaceNavigation />);
    expect(
      screen
        .getAllByRole('link')
        .every((link) => !link.hasAttribute('aria-current')),
    ).toBe(true);
  });
});
