import { getAuth } from '@/lib/auth/config';

/** Serves Better Auth sessions, registration and OAuth endpoints for this request. */
function handle(request: Request): Promise<Response> {
  return getAuth().handler(request);
}

export { handle as GET, handle as POST };
