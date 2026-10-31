'use client';

import { useLayoutEffect, useRef } from 'react';

/**
 * Positions a decorative selection surface without changing navigation semantics.
 * @param activeKey - Route identity; changing it retargets the current CSS transition.
 * @returns A ref for a positioned nav containing links and a navigation-indicator span.
 * Observes layout and font changes, cleans up on unmount, and keeps native selected
 * backgrounds when measurement is unavailable or no link matches the current route.
 */
export function useNavigationIndicator(activeKey: string) {
  const navigationRef = useRef<HTMLElement>(null);
  const updateRef = useRef<(animate: boolean) => void>(() => undefined);

  useLayoutEffect(() => {
    const navigation = navigationRef.current;
    if (!navigation) return;
    const track: HTMLElement = navigation;
    let frame = 0;
    let disposed = false;

    /** Measures untransformed link geometry; resize jumps avoid cross-breakpoint sweeps. */
    function update(animate: boolean) {
      if (disposed) return;
      cancelAnimationFrame(frame);
      const active = track.querySelector<HTMLElement>('a[aria-current="page"]');
      if (!active || !active.offsetWidth || !active.offsetHeight) {
        delete track.dataset.indicatorReady;
        delete track.dataset.indicatorAnimate;
        return;
      }

      if (!animate) delete track.dataset.indicatorAnimate;
      track.style.setProperty('--indicator-x', `${active.offsetLeft}px`);
      track.style.setProperty('--indicator-y', `${active.offsetTop}px`);
      track.style.setProperty('--indicator-width', `${active.offsetWidth}px`);
      track.style.setProperty('--indicator-height', `${active.offsetHeight}px`);
      track.dataset.indicatorReady = 'true';
      frame = requestAnimationFrame(() => {
        if (disposed) return;
        if (animate) track.dataset.indicatorAnimate = 'true';
        else {
          // Keep resize snaps transition-free for a painted frame before rearming.
          frame = requestAnimationFrame(() => {
            if (!disposed) track.dataset.indicatorAnimate = 'true';
          });
        }
      });
    }

    /** Reconciles layout immediately after resize, breakpoint, or font changes. */
    function updateLayout() {
      update(false);
    }

    updateRef.current = update;
    update(false);
    const observer =
      typeof ResizeObserver === 'undefined'
        ? undefined
        : new ResizeObserver(updateLayout);
    observer?.observe(navigation);
    navigation.querySelectorAll('a').forEach((link) => observer?.observe(link));
    window.addEventListener('resize', updateLayout);
    document.fonts?.addEventListener('loadingdone', updateLayout);
    void document.fonts?.ready.then(updateLayout);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener('resize', updateLayout);
      document.fonts?.removeEventListener('loadingdone', updateLayout);
    };
  }, []);

  useLayoutEffect(() => {
    updateRef.current(true);
  }, [activeKey]);

  return navigationRef;
}
