import type { ReactNode } from 'react';
import { AnalyticsNavigation } from '@/components/workspace/analytics-navigation';

/** Keeps thematic analytics links mounted without loading child-route data. */
export default function AnalyticsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AnalyticsNavigation />
      {children}
    </>
  );
}
