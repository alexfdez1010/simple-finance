/**
 * Shared form layout for product add/edit pages
 * @module components/products/form-layout
 */

import Link from 'next/link';

interface FormLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

/**
 * Consistent page layout for product forms with back navigation
 *
 * @param props - Layout props
 * @returns Form layout element
 */
export function FormLayout({ title, description, children }: FormLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[oklch(0.97_0.008_80)] via-[oklch(0.96_0.015_240)] to-[oklch(0.95_0.02_280)] dark:from-slate-950 dark:via-[oklch(0.15_0.02_260)] dark:to-[oklch(0.13_0.025_280)]">
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-lg">
        <div className="mb-6 animate-fade-up">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="font-serif text-2xl sm:text-3xl text-foreground">
            {title}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
        <div
          className="glass-card bg-card rounded-2xl shadow-sm border border-border p-5 sm:p-6 animate-fade-up"
          style={{ animationDelay: '100ms' }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
