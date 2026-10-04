/**
 * Small labeled detail row for product cards
 * @module components/products/detail-item
 */

interface DetailItemProps {
  label: string;
  value: string;
  className?: string;
}

/**
 * Displays a compact definition pair for a product metric.
 *
 * @param props - label, value, optional className for value color
 * @returns Detail item element
 */
export function DetailItem({ label, value, className }: DetailItemProps) {
  return (
    <div className="min-w-0">
      <dt className="mb-0.5 text-xs text-muted-foreground">{label}</dt>
      <dd
        className={`display-number text-sm font-medium tracking-normal ${className ?? 'text-foreground'}`}
      >
        {value}
      </dd>
    </div>
  );
}
