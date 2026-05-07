/**
 * Required dropdown for choosing the asset category. Used by every
 * create/edit form so the field is consistent.
 * @module components/products/asset-category-select
 */

'use client';

import { Field, FieldLabel } from '@/components/ui/field';
import {
  ASSET_CATEGORIES,
  assetCategoryLabel,
  type AssetCategory,
} from '@/lib/domain/models/asset-category';

interface AssetCategorySelectProps {
  id: string;
  value: AssetCategory;
  onChange: (next: AssetCategory) => void;
}

/** Required category dropdown wrapper (label + select). */
export function AssetCategorySelect({
  id,
  value,
  onChange,
}: AssetCategorySelectProps) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>Category</FieldLabel>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as AssetCategory)}
        className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        required
      >
        {ASSET_CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>
            {assetCategoryLabel(cat)}
          </option>
        ))}
      </select>
    </Field>
  );
}
