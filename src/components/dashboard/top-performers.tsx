/**
 * Top and bottom performers display component
 * @module components/dashboard/top-performers
 */

'use client';

import { TrendDown, TrendUp } from '@phosphor-icons/react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDisplayCurrency } from '@/components/dashboard/display-currency-context';

interface PerformerData {
  name: string;
  symbol: string;
  returnPct: number;
  returnValue: number;
  type: 'YAHOO_FINANCE' | 'CUSTOM';
}

interface TopPerformersProps {
  performers: PerformerData[];
}

/**
 * Top and bottom performers ranked by return percentage
 *
 * @param props - Component props with performer data
 * @returns Performers list element
 */
export function TopPerformers({ performers }: TopPerformersProps) {
  const { format } = useDisplayCurrency();
  const formatSigned = (value: number): string => {
    const formatted = format(value, { absolute: true });
    return value >= 0 ? `+${formatted}` : `-${formatted}`;
  };

  if (performers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">Top Performers</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[200px] items-center justify-center text-sm text-muted">
          No products yet.
        </CardContent>
      </Card>
    );
  }

  const sorted = [...performers].sort((a, b) => b.returnPct - a.returnPct);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif text-lg">
          Performance Ranking
        </CardTitle>
      </CardHeader>
      <CardContent className="flex max-h-[300px] flex-col gap-1 overflow-y-auto">
        {sorted.map((item, i) => {
          const isPositive = item.returnPct >= 0;
          return (
            <div
              key={item.name}
              className="flex items-center gap-3 border-b border-border px-1 py-2.5 last:border-0"
            >
              <span className="text-xs font-bold text-muted-foreground w-5 tabular-nums">
                #{i + 1}
              </span>
              {isPositive ? (
                <TrendUp className="size-4 shrink-0 text-gain" weight="bold" />
              ) : (
                <TrendDown
                  className="size-4 shrink-0 text-loss"
                  weight="bold"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {item.name}
                </p>
                <Badge variant="ghost" className="text-[9px] px-0">
                  {item.symbol}
                </Badge>
              </div>
              <div className="text-right shrink-0">
                <p
                  className={`text-sm font-bold tabular-nums ${isPositive ? 'text-gain' : 'text-loss'}`}
                >
                  {isPositive ? '+' : ''}
                  {item.returnPct.toFixed(2)}%
                </p>
                <p
                  className={`text-[10px] tabular-nums ${isPositive ? 'text-gain' : 'text-loss'}`}
                >
                  {formatSigned(item.returnValue)}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
