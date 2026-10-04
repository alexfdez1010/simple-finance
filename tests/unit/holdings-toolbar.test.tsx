import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HoldingsToolbar } from '@/components/dashboard/holdings-toolbar';

afterEach(cleanup);

describe('HoldingsToolbar', () => {
  it('associates the visible search label with its input', () => {
    render(
      <HoldingsToolbar
        query=""
        sort="value"
        onQueryChange={vi.fn()}
        onSortChange={vi.fn()}
      />,
    );

    const input = screen.getByRole('searchbox', { name: 'Search holdings' });
    const label = screen.getByText('Search holdings');
    expect(label.getAttribute('for')).toBe(input.id);
    expect(screen.getByLabelText('Search holdings')).toBe(input);
  });

  it('clears search and returns focus to its input without changing the sort', () => {
    const onQueryChange = vi.fn();
    const onSortChange = vi.fn();
    render(
      <HoldingsToolbar
        query="savings"
        sort="gain"
        onQueryChange={onQueryChange}
        onSortChange={onSortChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(onQueryChange).toHaveBeenCalledWith('');
    expect(onSortChange).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(screen.getByRole('searchbox'));
  });
});
