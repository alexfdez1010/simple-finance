/**
 * Authentication page component
 * @module app/auth/page
 */

'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { authenticateWithPassword } from '@/lib/actions/auth-actions';
import { Lock } from 'lucide-react';

/**
 * Authentication page with password input form
 *
 * @returns Auth page element
 */
export default function AuthPage() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || undefined;

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await authenticateWithPassword(password, redirectTo);
      if (!result.success) {
        setError(result.error || 'Authentication failed');
        setIsLoading(false);
      }
    } catch {
      setError('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[oklch(0.97_0.008_80)] via-[oklch(0.96_0.015_240)] to-[oklch(0.95_0.02_280)] dark:from-slate-950 dark:via-[oklch(0.15_0.02_260)] dark:to-[oklch(0.13_0.025_280)] px-4">
      <div className="w-full max-w-sm animate-fade-up">
        <div className="glass-card bg-card rounded-3xl shadow-xl p-8 border border-border">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-2xl mb-4">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <h1 className="font-serif text-2xl text-foreground mb-1">
              Simple Finance
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter password to continue
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all text-sm"
                placeholder="Enter your password"
                required
                autoFocus
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-primary text-primary-foreground font-medium rounded-xl transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isLoading ? 'Authenticating...' : 'Continue'}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-muted-foreground mt-6">
          Protected access
        </p>
      </div>
    </div>
  );
}
