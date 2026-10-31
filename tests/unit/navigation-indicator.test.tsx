import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WorkspaceNavigation } from '@/components/workspace/workspace-navigation';
import { AnalyticsNavigation } from '@/components/workspace/analytics-navigation';

const route = vi.hoisted(() => ({ pathname: '/dashboard' }));
vi.mock('next/navigation', () => ({ usePathname: () => route.pathname }));

let resize: ResizeObserverCallback;
let geometry: Record<
  string,
  { x: number; y: number; width: number; height: number }
>;
let frames: Map<number, FrameRequestCallback>;
const disconnect = vi.fn();
const observe = vi.fn();

/** Flushes the browser boundary without relying on real animation timing. */
function paint() {
  act(() => {
    const callbacks = [...frames.values()];
    frames.clear();
    callbacks.forEach((callback) => callback(0));
  });
}

beforeEach(() => {
  frames = new Map();
  let frame = 0;
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frames.set(++frame, callback);
    return frame;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id));
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(callback: ResizeObserverCallback) {
        resize = callback;
      }
      observe = observe;
      disconnect = disconnect;
    },
  );
  geometry = {
    '/dashboard': { x: 0, y: 0, width: 180, height: 48 },
    '/dashboard/portfolio': { x: 0, y: 54, width: 180, height: 48 },
    '/dashboard/analytics/cash-flow': { x: 180, y: 0, width: 100, height: 44 },
  };
  const dimensions = {
    offsetLeft: 'x',
    offsetTop: 'y',
    offsetWidth: 'width',
    offsetHeight: 'height',
  } as const;
  for (const property of Object.keys(dimensions) as Array<
    keyof typeof dimensions
  >) {
    const dimension = dimensions[property];
    vi.spyOn(HTMLElement.prototype, property, 'get').mockImplementation(
      function (this: HTMLElement) {
        return geometry[this.getAttribute('href') ?? '']?.[dimension] ?? 0;
      },
    );
  }
  route.pathname = '/dashboard';
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('navigation selection continuity', () => {
  it('places selection at the first destination and retargets the same surface after navigation', () => {
    const { rerender } = render(<WorkspaceNavigation />);
    const nav = screen.getByRole('navigation', { name: 'Main navigation' });
    const surface = nav.querySelector('.navigation-indicator');
    expect(nav.dataset.indicatorReady).toBe('true');
    expect(nav.style.getPropertyValue('--indicator-y')).toBe('0px');
    expect(nav.dataset.indicatorAnimate).toBeUndefined();
    paint();
    expect(nav.dataset.indicatorAnimate).toBe('true');

    route.pathname = '/dashboard/portfolio';
    rerender(<WorkspaceNavigation />);
    expect(nav.querySelector('.navigation-indicator')).toBe(surface);
    expect(nav.style.getPropertyValue('--indicator-y')).toBe('54px');
    expect(nav.style.getPropertyValue('--indicator-height')).toBe('48px');
    expect(nav.dataset.indicatorAnimate).toBe('true');
    expect(
      screen
        .getByRole('link', { name: 'Holdings' })
        .getAttribute('aria-current'),
    ).toBe('page');
  });

  it('tracks horizontal analytics links using their actual dimensions', () => {
    route.pathname = '/dashboard/analytics/cash-flow';
    render(<AnalyticsNavigation />);
    const nav = screen.getByRole('navigation', { name: 'Analytics views' });
    expect(nav.style.getPropertyValue('--indicator-x')).toBe('180px');
    expect(nav.style.getPropertyValue('--indicator-width')).toBe('100px');
    expect(nav.style.getPropertyValue('--indicator-height')).toBe('44px');
  });

  it('remeasures breakpoint changes immediately without sweeping across the layout', () => {
    render(<WorkspaceNavigation />);
    const nav = screen.getByRole('navigation', { name: 'Main navigation' });
    paint();
    geometry['/dashboard'] = { x: 8, y: 8, width: 80, height: 56 };
    act(() => window.dispatchEvent(new Event('resize')));
    expect(nav.style.getPropertyValue('--indicator-width')).toBe('80px');
    expect(nav.style.getPropertyValue('--indicator-x')).toBe('8px');
    expect(nav.dataset.indicatorAnimate).toBeUndefined();
    paint();
    expect(nav.dataset.indicatorAnimate).toBeUndefined();
    paint();
    expect(nav.dataset.indicatorAnimate).toBe('true');
    geometry['/dashboard'].width = 92;
    act(() => resize([], {} as ResizeObserver));
    expect(nav.style.getPropertyValue('--indicator-width')).toBe('92px');
  });

  it('preserves the selected link fallback when layout is unavailable or no route matches', () => {
    geometry = {};
    const { rerender } = render(<WorkspaceNavigation />);
    const nav = screen.getByRole('navigation', { name: 'Main navigation' });
    expect(nav.dataset.indicatorReady).toBeUndefined();
    expect(
      screen.getByRole('link', { name: 'Home' }).getAttribute('aria-current'),
    ).toBe('page');
    route.pathname = '/dashboard/portfolio-old';
    rerender(<WorkspaceNavigation />);
    expect(nav.dataset.indicatorReady).toBeUndefined();
  });

  it('disconnects measurement and cancels outstanding work when unmounted', () => {
    const removeListener = vi.spyOn(window, 'removeEventListener');
    const { unmount } = render(<WorkspaceNavigation />);
    expect(observe).toHaveBeenCalledTimes(5);
    expect(frames.size).toBe(1);
    unmount();
    expect(disconnect).toHaveBeenCalledOnce();
    expect(frames.size).toBe(0);
    expect(removeListener).toHaveBeenCalledWith('resize', expect.any(Function));
  });
});
