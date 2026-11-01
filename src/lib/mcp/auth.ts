import { createMcpProtectedRequestHandler } from '@better-auth/mcp';
import { authOrigin } from '@/lib/auth/config';

/** Wraps MCP with signature, issuer, audience, expiry and scope checks plus OAuth discovery challenges. */
export function protectMcp(handler: (request: Request) => Promise<Response>) {
  const origin = authOrigin();
  return createMcpProtectedRequestHandler(
    {
      issuer: `${origin}/api/auth`,
      audience: `${origin}/api/mcp/mcp`,
      jwksUrl: `${origin}/api/auth/jwks`,
      requiredScopes: ['assets:rw'],
    },
    handler,
  );
}
