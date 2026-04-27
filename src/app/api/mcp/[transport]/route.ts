/**
 * MCP HTTP transport route.
 * @module app/api/mcp/[transport]/route
 */

import { createMcpHandler, withMcpAuth } from 'mcp-handler';
import { registerAssetTools } from '@/lib/mcp/tools';
import { isValidMcpToken } from '@/lib/mcp/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const handler = createMcpHandler(
  (server) => {
    registerAssetTools(server);
  },
  {
    serverInfo: { name: 'simple-finance', version: '1.0.0' },
  },
  {
    basePath: '/api/mcp',
    maxDuration: 60,
    disableSse: true,
  },
);

const authed = withMcpAuth(
  handler,
  async (_req, bearerToken) => {
    if (!isValidMcpToken(bearerToken)) return undefined;
    return {
      token: bearerToken!,
      scopes: ['assets:rw'],
      clientId: 'simple-finance',
    };
  },
  { required: true },
);

export { authed as GET, authed as POST, authed as DELETE };
