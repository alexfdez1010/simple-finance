'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { useDisplayCurrency } from './display-currency-context';
import type { MonthlyInvestmentGain } from '@/lib/domain/services/monthly-investment-gains';

/**
 * Renders the accounting breakdown for a hovered month without side effects.
 * @param props - Recharts active payload and the display-currency formatter.
 * @returns Breakdown, or null when no month is selected.
 */
function GainTooltip({
  active,
  payload,
  format,
}: {
  active?: boolean;
  payload?: Array<{ payload: MonthlyInvestmentGain }>;
  format: (value: number) => string;
}) {
  const row = payload?.[0]?.payload;
  if (!active || !row) return null;
  return (
    <div className="rounded-md border border-border bg-overlay p-3 text-xs shadow-sm">
      <p className="mb-2 font-semibold">{row.month}</p>
      <p>Previous close: {format(row.openingValue)}</p>
      <p>Month close: {format(row.closingValue)}</p>
      <p>Net contributions: {format(row.netContributions)}</p>
      <p className="mt-2 font-semibold">Investment gain: {format(row.gain)}</p>
    </div>
  );
}

/**
 * Displays monthly monetary gains excluding signed cash flows, without mutation.
 * @param props - Completed monthly EUR gains, computed on the server.
 * @returns Chart and accessible data table; explains insufficient history.
 */
export function MonthlyInvestmentGainsChart({
  data,
}: {
  data: MonthlyInvestmentGain[];
}) {
  const { format } = useDisplayCurrency();
  return (
    <Card aria-label="Monthly investment gains" className="min-w-0">
      <CardHeader>
        <CardTitle className="font-serif text-lg">
          Monthly Investment Gains
        </CardTitle>
        <CardDescription>
          Month close − previous close − net contributions (deposits minus
          withdrawals). Completed months with both closing snapshots only.
        </CardDescription>
      </CardHeader>
      <CardContent className="min-w-0">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Not enough history yet. Two consecutive month-end snapshots are
            required.
          </p>
        ) : (
          <>
            <ChartContainer
              aria-label="Investment gains by month"
              config={{
                gain: { label: 'Investment gain', color: 'var(--chart-1)' },
              }}
              className="h-[280px] w-full"
            >
              <BarChart data={data} accessibilityLayer maxBarSize={64}>
                <CartesianGrid vertical={false} strokeOpacity={0.15} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  width={75}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(value) =>
                    format(Number(value), { compact: true })
                  }
                />
                <ReferenceLine y={0} stroke="var(--border)" />
                <ChartTooltip content={<GainTooltip format={format} />} />
                <Bar dataKey="gain" isAnimationActive={false} radius={4}>
                  {data.map((row) => (
                    <Cell
                      key={row.month}
                      fill={row.gain >= 0 ? 'var(--gain)' : 'var(--loss)'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
            <details className="mt-3 text-xs">
              <summary className="cursor-pointer text-muted-foreground">
                View monthly breakdown
              </summary>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-right tabular-nums">
                  <caption className="sr-only">
                    Monthly investment gains breakdown
                  </caption>
                  <thead>
                    <tr>
                      {[
                        'Month',
                        'Previous close',
                        'Month close',
                        'Net contributions',
                        'Investment gain',
                      ].map((label) => (
                        <th
                          key={label}
                          scope="col"
                          className="p-2 whitespace-nowrap"
                        >
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row) => (
                      <tr key={row.month} className="border-t border-separator">
                        <th scope="row" className="p-2">
                          {row.month}
                        </th>
                        {[
                          row.openingValue,
                          row.closingValue,
                          row.netContributions,
                          row.gain,
                        ].map((value, index) => (
                          <td key={index} className="p-2 whitespace-nowrap">
                            {format(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </>
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          Based on recorded valuations and contributions, including Yahoo
          purchases. Missing month-end snapshots are omitted.
        </p>
      </CardContent>
    </Card>
  );
}
