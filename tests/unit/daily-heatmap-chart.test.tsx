import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { DailyHeatmapChart } from '@/components/dashboard/daily-heatmap-chart';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('daily return history viewport', () => {
  it('opens at recent observations and exposes keyboard history navigation', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-11T12:00:00Z'));
    vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(900);
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(280);
    render(
      <DailyHeatmapChart
        data={[
          { date: '2026-10-09', value: 100 },
          { date: '2026-10-10', value: 110 },
          { date: '2026-10-11', value: 99 },
        ]}
      />,
    );
    const history = screen.getByRole('region', {
      name: 'Daily return history',
    });
    expect(history.scrollLeft).toBe(620);
    expect(history.tabIndex).toBe(0);
    expect(
      screen.getByText(/arrow keys to explore earlier weeks/),
    ).toBeTruthy();
    expect(
      screen.getByRole('group', { name: /1 gain days and 1 loss days/ }),
    ).toBeTruthy();
  });
  it('keeps an empty series explanatory and free of unnecessary scrolling', () => {
    render(<DailyHeatmapChart data={[]} />);
    expect(screen.getByText(/No daily snapshots yet/)).toBeTruthy();
    expect(
      screen.queryByRole('region', { name: 'Daily return history' }),
    ).toBeNull();
  });
});
