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
    <div>
      <dt className="mb-0.5 text-xs text-muted-foreground">{label}</dt>
      <dd
        className={`text-sm font-medium tabular-nums ${className ?? 'text-foreground'}`}
      >
        {value}
      </dd>
    </div>
  );
}
