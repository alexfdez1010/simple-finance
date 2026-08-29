'use client';

import * as React from 'react';

const THEMES = { light: '', dark: '.dark' } as const;

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
>;

interface ChartContextValue {
  config: ChartConfig;
}

export const ChartContext = React.createContext<ChartContextValue | null>(null);

/** Returns the configuration owned by the nearest chart container. */
export function useChart(): ChartContextValue {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error('useChart must be used within a <ChartContainer />');
  }
  return context;
}

/** Resolves the matching visual configuration from a Recharts payload item. */
export function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string,
) {
  if (typeof payload !== 'object' || payload === null) return undefined;

  const nested =
    'payload' in payload &&
    typeof payload.payload === 'object' &&
    payload.payload !== null
      ? payload.payload
      : undefined;
  let resolvedKey = key;

  if (
    key in payload &&
    typeof payload[key as keyof typeof payload] === 'string'
  ) {
    resolvedKey = payload[key as keyof typeof payload] as string;
  } else if (
    nested &&
    key in nested &&
    typeof nested[key as keyof typeof nested] === 'string'
  ) {
    resolvedKey = nested[key as keyof typeof nested] as string;
  }

  return resolvedKey in config ? config[resolvedKey] : config[key];
}

/** Injects chart-scoped color variables from the declarative chart config. */
export function ChartStyle({
  id,
  config,
}: {
  id: string;
  config: ChartConfig;
}) {
  const colorConfig = Object.entries(config).filter(
    ([, item]) => item.theme || item.color,
  );
  if (!colorConfig.length) return null;

  const css = Object.entries(THEMES)
    .map(([theme, prefix]) => {
      const variables = colorConfig
        .map(([key, item]) => {
          const color =
            item.theme?.[theme as keyof typeof item.theme] || item.color;
          return color ? `  --color-${key}: ${color};` : null;
        })
        .filter(Boolean)
        .join('\n');
      return `${prefix} [data-chart=${id}] {\n${variables}\n}`;
    })
    .join('\n');

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
