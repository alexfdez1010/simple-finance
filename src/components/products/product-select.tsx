/**
 * Accessible HeroUI select shared by product forms.
 * @module components/products/product-select
 */

'use client';

import { Label, ListBox, Select } from '@heroui/react';

export interface ProductSelectOption<T extends string> {
  value: T;
  label: string;
}

interface ProductSelectProps<T extends string> {
  id: string;
  label: string;
  value: T;
  options: readonly ProductSelectOption<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
}

/**
 * Renders a required single-choice select with consistent product styling.
 *
 * @param props - Field identity, current value, options, and change callback.
 * @returns A keyboard-accessible HeroUI select.
 */
export function ProductSelect<T extends string>({
  id,
  label,
  value,
  options,
  onChange,
  disabled = false,
}: ProductSelectProps<T>) {
  return (
    <Select
      id={id}
      className="w-full"
      isDisabled={disabled}
      isRequired
      value={value}
      onChange={(key) => onChange(String(key) as T)}
      variant="secondary"
    >
      <Label className="text-xs font-medium text-foreground">{label}</Label>
      <Select.Trigger className="min-h-10 rounded-md">
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover placement="bottom">
        <ListBox items={options}>
          {(option) => (
            <ListBox.Item id={option.value} textValue={option.label}>
              {option.label}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          )}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}
