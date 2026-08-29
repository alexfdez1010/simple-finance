/**
 * Required dropdown for choosing the asset category. Used by every
 * create/edit form so the field is consistent.
 * @module components/products/asset-category-select
 */

'use client';

import { ProductSelect } from '@/components/products/product-select';
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
  const options = ASSET_CATEGORIES.map((category) => ({
    value: category,
    label: assetCategoryLabel(category),
  }));

  return (
    <ProductSelect
      id={id}
      label="Category"
      value={value}
      options={options}
      onChange={onChange}
    />
  );
}
