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
 * Displays a labeled value with uppercase tracking label
 *
 * @param props - label, value, optional className for value color
 * @returns Detail item element
 */
export function DetailItem({ label, value, className }: DetailItemProps) {
  return (
    <div className="text-center">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
        {label}
      </p>
      <p
        className={`text-sm font-semibold tabular-nums ${className ?? 'text-foreground'}`}
      >
        {value}
      </p>
    </div>
  );
}
