/**
 * Monthly contributions chart: per-month net deposits and withdrawals.
 * Diverging bars (positive deposits up, negative withdrawals down) plus a
 * net line so the user sees both signs and the resulting balance per month.
 * @module components/dashboard/monthly-contributions-chart
 */

'use client';

import { useMemo } from 'react';
import {
  Bar,
  CartesianGrid,
  Cell,
  Line,
  ComposedChart,
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
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { useDisplayCurrency } from '@/components/dashboard/display-currency-context';

interface MonthlyContribution {
  month: string;
  deposits: number;
  withdrawals: number;
  net: number;
}

interface MonthlyContributionsChartProps {
  data: MonthlyContribution[];
}

const chartConfig = {
  net: { label: 'Net', color: 'var(--chart-1)' },
} satisfies ChartConfig;

const GAIN_COLOR = 'oklch(0.55 0.17 155)';
const LOSS_COLOR = 'oklch(0.55 0.20 25)';

/** Format YYYY-MM as "Apr '26" for axis ticks. */
function fmtMonth(yyyymm: string): string {
  const [y, m] = yyyymm.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', {
    month: 'short',
    year: '2-digit',
  });
}

/**
 * Diverging bar chart of net contributions per month plus a net-line.
 *
 * @param props - Component props with monthly contribution aggregates
 * @returns Chart element
 */
export function MonthlyContributionsChart({
  data,
}: MonthlyContributionsChartProps) {
  const { format } = useDisplayCurrency();

  const stats = useMemo(() => {
    const totalDeposits = data.reduce((s, d) => s + d.deposits, 0);
    const totalWithdrawals = data.reduce((s, d) => s + d.withdrawals, 0);
    return {
      totalDeposits,
      totalWithdrawals,
      net: totalDeposits + totalWithdrawals,
    };
  }, [data]);

  if (data.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="font-serif text-lg">
            Monthly Contributions
          </CardTitle>
          <CardDescription>
            No contributions yet. Add deposits or withdrawals to a custom
            product.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="font-serif text-lg">
          Monthly Contributions
        </CardTitle>
        <CardDescription>Deposits and withdrawals per month</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <p
            className={`text-xl sm:text-2xl font-bold tabular-nums ${stats.net >= 0 ? 'text-gain' : 'text-loss'}`}
          >
            {stats.net >= 0 ? '+' : ''}
            {format(stats.net)}
          </p>
          <span className="text-xs font-medium text-muted-foreground tabular-nums">
            in <span className="text-gain">{format(stats.totalDeposits)}</span>{' '}
            · out{' '}
            <span className="text-loss">{format(stats.totalWithdrawals)}</span>
          </span>
        </div>
        <ChartContainer config={chartConfig} className="h-[240px] w-full">
          <ComposedChart
            data={data}
            margin={{ left: 4, right: 4 }}
            stackOffset="sign"
          >
            <CartesianGrid vertical={false} strokeOpacity={0.3} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 11 }}
              tickFormatter={fmtMonth}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={60}
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => format(Number(v), { compact: true })}
            />
            <ReferenceLine y={0} stroke="var(--border)" />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(v) => fmtMonth(v as string)}
                  formatter={(v, n) => {
                    const label =
                      n === 'deposits'
                        ? 'Deposits'
                        : n === 'withdrawals'
                          ? 'Withdrawals'
                          : 'Net';
                    const num = Number(v);
                    const sign = num > 0 ? '+' : '';
                    return [`${sign}${format(num)}`, label];
                  }}
                />
              }
            />
            <Bar dataKey="deposits" stackId="net" radius={[4, 4, 0, 0]}>
              {data.map((d, i) => (
                <Cell key={`d-${i}`} fill={GAIN_COLOR} fillOpacity={0.85} />
              ))}
            </Bar>
            <Bar dataKey="withdrawals" stackId="net" radius={[0, 0, 4, 4]}>
              {data.map((d, i) => (
                <Cell key={`w-${i}`} fill={LOSS_COLOR} fillOpacity={0.85} />
              ))}
            </Bar>
            <Line
              type="monotone"
              dataKey="net"
              stroke="var(--foreground)"
              strokeWidth={1.5}
              strokeDasharray="3 3"
              dot={{ r: 2.5, fill: 'var(--foreground)' }}
              activeDot={{ r: 4 }}
            />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
