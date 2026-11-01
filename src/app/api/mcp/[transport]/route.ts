/**
 * MCP HTTP transport route.
 * @module app/api/mcp/[transport]/route
 */

import { createMcpHandler } from 'mcp-handler';
import { registerAssetTools } from '@/lib/mcp/tools';
import { protectMcp } from '@/lib/mcp/auth';

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

/** Resolves OAuth settings inside the request after Worker environment initialization. */
async function authed(request: Request) {
  return protectMcp(handler)(request);
}

export { authed as GET, authed as POST, authed as DELETE };
