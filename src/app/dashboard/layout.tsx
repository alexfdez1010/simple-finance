import type { ReactNode } from 'react';
import { WorkspaceNavigation } from '@/components/workspace/workspace-navigation';

/**
 * Keeps navigation mounted while each child route loads its own data.
 * @param props - The active workspace supplied by Next.js.
 * @returns Protected dashboard chrome; authentication remains in the root guard.
 * No portfolio or agent reads happen in this layout.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-background">
      <WorkspaceNavigation />
      <main
        id="main-content"
        tabIndex={-1}
        className="min-w-0 pb-[calc(6.5rem+env(safe-area-inset-bottom))] focus:outline-none lg:ml-60 lg:pb-0"
      >
        <div className="mx-auto max-w-[1480px] px-4 py-7 sm:px-8 sm:py-10 xl:px-12 xl:py-12">
          {children}
        </div>
      </main>
    </div>
  );
}
