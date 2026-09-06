import React from 'react';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DailyHeatmapChart } from '@/components/dashboard/daily-heatmap-chart';
import { computePortfolioRisk } from '@/lib/domain/services/portfolio-risk';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

/** Renders fixed recent dates so the calendar includes each regression fixture. */
function renderHeatmap(values: number[], bases: number[]) {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-09-06T12:00:00Z'));
  const risk = computePortfolioRisk(
    values.map((value, i) => ({ date: `2026-09-0${i + 1}`, value })),
    bases.map((invested, i) => ({ date: `2026-09-0${i + 1}`, invested })),
  );
  return render(<DailyHeatmapChart data={risk.performance} />);
}

describe('daily heatmap return details', () => {
  it('opens an adjusted numeric return on click and dismisses with Escape', async () => {
    renderHeatmap([100, 160], [100, 150]);
    const button = screen.getByRole('button', {
      name: /Sep 2, 2026: \+10.00% return/,
    });
    fireEvent.click(button);
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('+10.00%')).toBeTruthy();
    expect(
      within(dialog).getByText('Return excluding contributions'),
    ).toBeTruthy();
    fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });
  it('shows a loss with its sign', async () => {
    renderHeatmap([100, 140], [100, 150]);
    fireEvent.click(screen.getByRole('button', { name: /-10.00% return/ }));
    expect(
      within(await screen.findByRole('dialog')).getByText('-10.00%'),
    ).toBeTruthy();
  });
  it('keeps all-flat deposit-only histories visible and clickable', async () => {
    renderHeatmap([100, 150], [100, 150]);
    expect(screen.getAllByRole('button')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: /\+0.00% return/ }));
    expect(
      within(await screen.findByRole('dialog')).getByText('+0.00%'),
    ).toBeTruthy();
  });
});
