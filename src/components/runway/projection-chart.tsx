'use client';

import { Line, LineChart, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { useDisplayCurrency } from '@/components/dashboard/display-currency-context';

interface ProjectionPoint {
  month: number;
  balance: number;
  fireTarget?: number;
}

/** Plots monthly nominal EUR balances and an optional FIRE target with a keyboard-readable data table. */
export function ProjectionChart({
  title,
  description,
  data,
  target = false,
}: {
  title: string;
  description: string;
  data: ProjectionPoint[];
  target?: boolean;
}) {
  const { format } = useDisplayCurrency();
  const rows = data.filter(
    (row, index) => row.month % 12 === 0 || index === data.length - 1,
  );
  return (
    <section className="finance-card p-5 sm:p-6" aria-label={title}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold">{title}</h2>
        {target && (
          <div className="flex flex-wrap gap-4 text-xs">
            <span className="font-medium text-primary">Projected wealth</span>
            <span className="font-medium text-[#946b16]">FIRE target</span>
          </div>
        )}
      </div>
      {description && (
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      )}
      <ChartContainer
        aria-label={`${title} chart`}
        className="mt-5 h-[280px] w-full aspect-auto"
        config={{
          balance: {
            label: target ? 'Projected wealth' : 'Remaining capital',
            color: 'var(--chart-1)',
          },
          fireTarget: { label: 'FIRE target', color: 'var(--chart-3)' },
        }}
      >
        <LineChart
          accessibilityLayer
          data={data}
          margin={{ top: 8, left: 0, right: 12, bottom: 8 }}
        >
          <XAxis
            dataKey="month"
            type="number"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(month: number) =>
              `${Number((month / 12).toFixed(1))}y`
            }
            axisLine={false}
            tickLine={false}
            minTickGap={25}
          />
          <YAxis
            tickFormatter={(value: number) => format(value, { compact: true })}
            width={75}
            axisLine={false}
            tickLine={false}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(_, payload) =>
                  `Month ${Number(payload[0]?.payload.month ?? 0).toFixed(1)}`
                }
                formatter={(value, name) => (
                  <span>
                    {name === 'balance'
                      ? target
                        ? 'Wealth'
                        : 'Capital'
                      : 'FIRE target'}
                    : {format(Number(value))}
                  </span>
                )}
              />
            }
          />
          <Line
            dataKey="balance"
            type="monotone"
            stroke="var(--color-balance)"
            strokeWidth={2.5}
            dot={false}
            isAnimationActive={false}
          />
          {target && (
            <Line
              dataKey="fireTarget"
              type="monotone"
              stroke="var(--color-fireTarget)"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              isAnimationActive={false}
            />
          )}
        </LineChart>
      </ChartContainer>
      <details className="mt-4 text-xs">
        <summary className="min-h-8 cursor-pointer font-medium text-primary">
          View yearly figures
        </summary>
        <div className="max-h-64 overflow-auto">
          <table className="w-full text-right tabular-nums">
            <caption className="sr-only">
              {title} in the selected display currency
            </caption>
            <thead>
              <tr>
                <th className="p-2 text-left" scope="col">
                  Year
                </th>
                <th className="p-2" scope="col">
                  Capital
                </th>
                {target && (
                  <th className="p-2" scope="col">
                    FIRE target
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.month} className="odd:bg-default/50">
                  <th scope="row" className="p-2 text-left font-normal">
                    {Number((row.month / 12).toFixed(2))}
                  </th>
                  <td className="p-2">{format(row.balance)}</td>
                  {target && (
                    <td className="p-2">{format(row.fireTarget ?? 0)}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}
