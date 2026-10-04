/** Focused search and sort controls for the holdings workspace. */
'use client';

import { useId } from 'react';
import {
  Button,
  Input,
  Label,
  ListBox,
  Select,
  TextField,
} from '@heroui/react';
import { MagnifyingGlass, X } from '@phosphor-icons/react';
import type { HoldingsSort } from './holdings-query';

interface HoldingsToolbarProps {
  query: string;
  sort: HoldingsSort;
  onQueryChange: (query: string) => void;
  onSortChange: (sort: HoldingsSort) => void;
}

/**
 * Renders labelled search, clear and sort controls using the existing UI system.
 * @param props - Controlled search/sort state and focused change callbacks.
 * @returns Responsive controls; clearing preserves input focus and the sort.
 * Changes are reported through callbacks; no fetching or portfolio mutation.
 */
export function HoldingsToolbar({
  query,
  sort,
  onQueryChange,
  onSortChange,
}: HoldingsToolbarProps) {
  const inputId = useId();
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <TextField
        className="min-w-0 flex-1"
        name="holdings-search"
        type="search"
      >
        <Label className="text-xs font-medium text-muted-foreground">
          Search holdings
        </Label>
        <div className="relative">
          <MagnifyingGlass
            aria-hidden
            size={18}
            className="pointer-events-none absolute top-1/2 left-3 z-10 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id={inputId}
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Name, symbol, or currency"
            variant="secondary"
            className="min-h-11 w-full rounded-xl pr-12 pl-10 [&::-webkit-search-cancel-button]:appearance-none"
          />
          {query && (
            <Button
              aria-label="Clear search"
              className="absolute top-0 right-0 min-h-11 min-w-11"
              isIconOnly
              variant="ghost"
              onPress={() => {
                onQueryChange('');
                document.getElementById(inputId)?.focus();
              }}
            >
              <X aria-hidden size={16} />
            </Button>
          )}
        </div>
      </TextField>
      <Select
        aria-label="Sort holdings"
        className="w-full sm:w-44"
        variant="secondary"
        value={sort}
        onChange={(value) => {
          if (value === 'value' || value === 'gain' || value === 'name')
            onSortChange(value);
        }}
      >
        <Label className="text-xs font-medium text-muted-foreground">
          Sort holdings
        </Label>
        <Select.Trigger className="min-h-11 rounded-xl">
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox aria-label="Sort options" selectionMode="single">
            {[
              ['value', 'Highest value'],
              ['gain', 'Highest gain'],
              ['name', 'Name A–Z'],
            ].map(([id, label]) => (
              <ListBox.Item key={id} id={id} textValue={label}>
                {label}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>
    </div>
  );
}
