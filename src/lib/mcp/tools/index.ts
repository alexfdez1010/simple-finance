/**
 * Aggregates the MCP tool registrations for the simple-finance server.
 * @module lib/mcp/tools
 */

import 'server-only';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerQueryTools } from './queries';
import { registerMutationTools } from './mutations';

/**
 * Registers every asset-related MCP tool on the given server.
 *
 * @param server - MCP server instance
 */
export function registerAssetTools(server: McpServer): void {
  registerQueryTools(server);
  registerMutationTools(server);
}
