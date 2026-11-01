import { getAuth } from '@/lib/auth/config';

/** Forwards standards-based discovery URLs to the Better Auth OAuth provider. */
export function GET(request: Request): Promise<Response> {
  return getAuth().handler(request);
}
