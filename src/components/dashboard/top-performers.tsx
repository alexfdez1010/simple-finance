/**
 * Top and bottom performers display component
 * @module components/dashboard/top-performers
 */

'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
 * Formats currency value in EUR with sign
 *
 * @param value - Value to format
 * @returns Formatted currency string
 */
function formatCurrency(value: number): string {
  const formatted = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(Math.abs(value));
  return value >= 0 ? `+${formatted}` : `-${formatted}`;
}

/**
 * Top and bottom performers ranked by return percentage
 *
 * @param props - Component props with performer data
 * @returns Performers list element
 */
export function TopPerformers({ performers }: TopPerformersProps) {
  if (performers.length === 0) {
    return (
      <div className="glass-card rounded-2xl bg-card p-5 shadow-sm">
        <h3 className="font-serif text-lg text-foreground mb-4">
          Top Performers
        </h3>
        <div className="h-[200px] flex items-center justify-center">
          <p className="text-muted-foreground text-sm">No products yet.</p>
        </div>
      </div>
    );
  }

  const sorted = [...performers].sort((a, b) => b.returnPct - a.returnPct);

  return (
    <div className="glass-card rounded-2xl bg-card shadow-sm px-4 sm:px-6 pt-5 pb-4">
      <h3 className="font-serif text-lg text-foreground mb-3 px-1">
        Performance Ranking
      </h3>
      <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
        {sorted.map((item, i) => {
          const isPositive = item.returnPct >= 0;
          return (
            <div
              key={item.name}
              className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-accent/50 transition-colors"
            >
              <span className="text-xs font-bold text-muted-foreground w-5 tabular-nums">
                #{i + 1}
              </span>
              {isPositive ? (
                <TrendingUp className="w-3.5 h-3.5 text-gain shrink-0" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-loss shrink-0" />
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
                  {formatCurrency(item.returnValue)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
