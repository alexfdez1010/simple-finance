/**
 * Numeric input for the asset's liquidity horizon — how many days it takes
 * to convert the asset to cash. Used by every create/edit form so the field
 * is consistent.
 * @module components/products/days-to-liquidity-field
 */

'use client';

import { Input } from '@/components/ui/input';
import { Field, FieldLabel } from '@/components/ui/field';

interface DaysToLiquidityFieldProps {
  id: string;
  value: string;
  onChange: (next: string) => void;
}

/** Required days-to-liquidity input (label + number field). */
export function DaysToLiquidityField({
  id,
  value,
  onChange,
}: DaysToLiquidityFieldProps) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>Days to Liquidity</FieldLabel>
      <Input
        id={id}
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
        step="1"
        min="0"
        aria-describedby={`${id}-description`}
        required
      />
      <p id={`${id}-description`} className="text-xs text-muted-foreground">
        0 means immediately available.
      </p>
    </Field>
  );
}
