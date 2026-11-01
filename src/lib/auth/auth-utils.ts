import { headers } from 'next/headers';
import { getAuth } from './config';

/** Validates the database-backed Better Auth session from the current request cookies. */
export async function isAuthenticated(): Promise<boolean> {
  return Boolean(await getAuth().api.getSession({ headers: await headers() }));
}

/** Rejects unauthenticated server actions before they read or mutate portfolio data. */
export async function requireAuthentication(): Promise<void> {
  if (!(await isAuthenticated())) throw new Error('Unauthorized');
}
