/**
 * Returns distribution histogram: bins arithmetic daily % returns on a
 * symmetric-log (asinh) axis so tail outliers don't stretch the central
 * bins. Highlights mean + 5th-percentile (VaR₅).
 * @module components/dashboard/returns-distribution-chart
 */

'use client';

import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts';
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

interface ReturnsDistributionChartProps {
  data: Array<{ date: string; value: number }>;
}

const chartConfig = {
  count: { label: 'Days', color: 'var(--chart-1)' },
} satisfies ChartConfig;

const GAIN_COLOR = 'oklch(0.55 0.17 155)';
const LOSS_COLOR = 'oklch(0.55 0.20 25)';
const BIN_COUNT = 51;

interface Bin {
  label: string;
  count: number;
  mid: number;
}

/** Day-over-day arithmetic % returns from a value series. */
function dailyPcts(series: Array<{ date: string; value: number }>): number[] {
  const out: number[] = [];
  for (let i = 1; i < series.length; i++) {
    const prev = series[i - 1].value;
    if (prev > 0) out.push(((series[i].value - prev) / prev) * 100);
  }
  return out;
}

/** Below this |%| the symlog scale is ~linear; beyond it grows logarithmic. */
const LINTHRESH = 0.5;
const fwd = (r: number): number => Math.asinh(r / LINTHRESH);
const inv = (t: number): number => LINTHRESH * Math.sinh(t);

/** Format a return midpoint compactly: 1 dp under 10%, 0 dp above. */
function fmtPct(v: number): string {
  const sign = v >= 0 ? '+' : '';
  return `${sign}${Math.abs(v) >= 10 ? v.toFixed(0) : v.toFixed(1)}%`;
}

/** Symmetric symlog binning: edges uniform in asinh-space, labels in real %. */
function toBins(pcts: number[]): Bin[] {
  if (pcts.length === 0) return [];
  const tMax = Math.max(...pcts.map((p) => Math.abs(fwd(p))), fwd(0.01));
  const width = (tMax * 2) / BIN_COUNT;
  const counts = new Array<number>(BIN_COUNT).fill(0);
  for (const p of pcts) {
    let idx = Math.floor((fwd(p) + tMax) / width);
    if (idx < 0) idx = 0;
    if (idx >= BIN_COUNT) idx = BIN_COUNT - 1;
    counts[idx] += 1;
  }
  return Array.from({ length: BIN_COUNT }, (_, i) => {
    const tMid = -tMax + (i + 0.5) * width;
    const mid = inv(tMid);
    return { label: fmtPct(mid), count: counts[i], mid };
  });
}

/** Percentile (linear, 0..1) from an unsorted sample. */
function percentile(arr: number[], p: number): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.min(
    Math.max(Math.floor(sorted.length * p), 0),
    sorted.length - 1,
  );
  return sorted[idx];
}

/**
 * Histogram of daily percent returns with tail-risk metrics.
 *
 * @param props - Component props with daily portfolio evolution data
 * @returns Chart element
 */
export function ReturnsDistributionChart({
  data,
}: ReturnsDistributionChartProps) {
  const { bins, mean, var5, hitRate, sample } = useMemo(() => {
    const pcts = dailyPcts(data);
    if (pcts.length === 0) {
      return { bins: [], mean: 0, var5: 0, hitRate: 0, sample: 0 };
    }
    const m = pcts.reduce((s, x) => s + x, 0) / pcts.length;
    const v = percentile(pcts, 0.05);
    const up = pcts.filter((x) => x > 0).length;
    return {
      bins: toBins(pcts),
      mean: m,
      var5: v,
      hitRate: (up / pcts.length) * 100,
      sample: pcts.length,
    };
  }, [data]);

  if (sample < 5) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="font-serif text-lg">
            Returns Distribution
          </CardTitle>
          <CardDescription>
            Needs at least 5 daily snapshots to build a distribution.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="font-serif text-lg">
          Returns Distribution
        </CardTitle>
        <CardDescription>
          Shape of daily % returns · symlog scale
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <p
            className={`text-xl sm:text-2xl font-bold tabular-nums ${hitRate >= 50 ? 'text-gain' : 'text-loss'}`}
          >
            {hitRate.toFixed(0)}% hit-rate
          </p>
          <span className="text-xs font-medium text-muted-foreground tabular-nums">
            μ {mean >= 0 ? '+' : ''}
            {mean.toFixed(2)}% · VaR₅{' '}
            <span className="text-loss">{var5.toFixed(2)}%</span> · n={sample}
          </span>
        </div>
        <ChartContainer config={chartConfig} className="h-[220px] w-full">
          <BarChart data={bins} margin={{ left: 4, right: 4 }}>
            <CartesianGrid vertical={false} strokeOpacity={0.3} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10 }}
              interval={2}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={30}
              tick={{ fontSize: 11 }}
              allowDecimals={false}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(v) => [`${v} days`, 'Count']}
                />
              }
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {bins.map((b, i) => (
                <Cell
                  key={`cell-${i}`}
                  fill={b.mid >= 0 ? GAIN_COLOR : LOSS_COLOR}
                  fillOpacity={0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
