import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ContributionFormRow } from '@/components/products/contribution-form-row';
import { ContributionRow } from '@/components/products/contribution-row';
import type { CustomContribution } from '@/lib/domain/models/product.types';

afterEach(cleanup);

const form = { amount: '150', date: '2026-09-01', note: 'Monthly deposit' };
const movement: CustomContribution = {
  id: 'movement-1',
  amount: 123456789012345.67,
  amountEur: 123456789012345.67,
  date: new Date('2026-09-01T12:00:00Z'),
  note: 'ReferenceWithoutSpaces'.repeat(20),
  createdAt: new Date('2026-09-01T12:00:00Z'),
  updatedAt: new Date('2026-09-01T12:00:00Z'),
};

describe('ContributionFormRow', () => {
  it('associates each label with its field and uses unique IDs across editors', () => {
    const props = {
      form,
      setForm: vi.fn(),
      symbol: '€',
      onCancel: vi.fn(),
      onSave: vi.fn(),
      busy: false,
    };
    render(
      <>
        <ContributionFormRow {...props} />
        <ContributionFormRow {...props} />
      </>,
    );

    const amounts = screen.getAllByLabelText('Amount (€)');
    const dates = screen.getAllByLabelText('Date');
    const notes = screen.getAllByLabelText('Note (optional)');
    const fields = [...amounts, ...dates, ...notes];

    expect(fields).toHaveLength(6);
    expect(new Set(fields.map((field) => field.id)).size).toBe(6);
    expect(amounts[0].getAttribute('type')).toBe('number');
    expect(dates[0].getAttribute('type')).toBe('date');
  });

  it('sends immutable field updates and invokes save and cancel callbacks', () => {
    const setForm = vi.fn();
    const onSave = vi.fn();
    const onCancel = vi.fn();
    render(
      <ContributionFormRow
        form={form}
        setForm={setForm}
        symbol="€"
        onCancel={onCancel}
        onSave={onSave}
        busy={false}
      />,
    );

    fireEvent.change(screen.getByLabelText('Amount (€)'), {
      target: { value: '-100' },
    });
    fireEvent.change(screen.getByLabelText('Date'), {
      target: { value: '2026-08-31' },
    });
    fireEvent.change(screen.getByLabelText('Note (optional)'), {
      target: { value: '' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(setForm.mock.calls).toEqual([
      [{ ...form, amount: '-100' }],
      [{ ...form, date: '2026-08-31' }],
      [{ ...form, note: '' }],
    ]);
    expect(form.amount).toBe('150');
    expect(onSave).toHaveBeenCalledOnce();
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('disables all inputs and actions while saving', () => {
    const onSave = vi.fn();
    const onCancel = vi.fn();
    render(
      <ContributionFormRow
        form={form}
        setForm={vi.fn()}
        symbol="€"
        onCancel={onCancel}
        onSave={onSave}
        busy
      />,
    );

    for (const label of ['Amount (€)', 'Date', 'Note (optional)']) {
      expect((screen.getByLabelText(label) as HTMLInputElement).disabled).toBe(
        true,
      );
    }
    const save = screen.getByRole('button', { name: 'Saving...' });
    const cancel = screen.getByRole('button', { name: 'Cancel' });
    expect((save as HTMLButtonElement).disabled).toBe(true);
    expect((cancel as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(save);
    fireEvent.click(cancel);
    expect(onSave).not.toHaveBeenCalled();
    expect(onCancel).not.toHaveBeenCalled();
  });

  it.each(['amount', 'date'] as const)(
    'blocks saving when %s is empty',
    (field) => {
      render(
        <ContributionFormRow
          form={{ ...form, [field]: '' }}
          setForm={vi.fn()}
          symbol="€"
          onCancel={vi.fn()}
          onSave={vi.fn()}
          busy={false}
        />,
      );
      expect(
        (screen.getByRole('button', { name: 'Save' }) as HTMLButtonElement)
          .disabled,
      ).toBe(true);
    },
  );
});

describe('ContributionRow', () => {
  it('preserves the complete amount, currency, date and long note', () => {
    render(
      <ContributionRow
        contribution={movement}
        symbol="€"
        busy={false}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText(`+${movement.amount} €`)).toBeTruthy();
    expect(screen.getByText(`2026-09-01 · ${movement.note}`)).toBeTruthy();
  });

  it('invokes edit and delete callbacks using named controls', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    render(
      <ContributionRow
        contribution={{ ...movement, amount: -100, note: null }}
        symbol="€"
        busy={false}
        onEdit={onEdit}
        onDelete={onDelete}
      />,
    );
    expect(screen.getByText('-100 €')).toBeTruthy();
    expect(screen.getByText('2026-09-01')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Edit movement' }));
    fireEvent.click(screen.getByRole('button', { name: 'Delete movement' }));
    expect(onEdit).toHaveBeenCalledOnce();
    expect(onDelete).toHaveBeenCalledOnce();
  });

  it('blocks both movement actions while a mutation is pending', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    render(
      <ContributionRow
        contribution={movement}
        symbol="€"
        busy
        onEdit={onEdit}
        onDelete={onDelete}
      />,
    );
    const edit = screen.getByRole('button', { name: 'Edit movement' });
    const remove = screen.getByRole('button', { name: 'Delete movement' });
    expect((edit as HTMLButtonElement).disabled).toBe(true);
    expect((remove as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(edit);
    fireEvent.click(remove);
    expect(onEdit).not.toHaveBeenCalled();
    expect(onDelete).not.toHaveBeenCalled();
  });
});
