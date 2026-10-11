import 'server-only';
import { headers } from 'next/headers';
import { expectedMcpToken } from '@/lib/mcp/auth';
import { TOKEN_ENV_VAR, buildMcpJson } from '@/lib/mcp/skill';

/**
 * Resolves authenticated MCP connection details for the agent setup page only.
 * @returns Endpoint, bearer token, config text, and token environment variable.
 * Reads request headers and the configured credential; no market or portfolio reads.
 * Defaults to localhost when no host is present.
 */
export async function loadAgentPage() {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get('x-forwarded-host') ??
    requestHeaders.get('host') ??
    'localhost:3000';
  const protocol =
    requestHeaders.get('x-forwarded-proto') ??
    (host.startsWith('localhost') ? 'http' : 'https');
  const serverUrl = `${protocol}://${host}/api/mcp/mcp`;
  return {
    serverUrl,
    token: expectedMcpToken(),
    mcpJson: buildMcpJson(serverUrl),
    tokenEnvVar: TOKEN_ENV_VAR,
  };
}
