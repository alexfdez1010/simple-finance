/**
 * MCP read-only tools that list and fetch financial assets.
 * @module lib/mcp/tools/queries
 */

import 'server-only';
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  findAllProducts,
  findProductById,
} from '@/lib/infrastructure/database/product-repository';
import { ok } from './shared';

/**
 * Registers list/get tools on the MCP server.
 *
 * @param server - MCP server instance
 */
export function registerQueryTools(server: McpServer): void {
  server.registerTool(
    'list_assets',
    {
      title: 'List financial assets',
      description:
        'List every financial asset (Yahoo Finance and custom fixed-rate) in the portfolio, most recently created first.',
      inputSchema: {},
    },
    async () => ok(await findAllProducts()),
  );

  server.registerTool(
    'get_asset',
    {
      title: 'Get one asset by id',
      description:
        'Return a single financial asset by its database id, or null if not found.',
      inputSchema: { id: z.string().min(1) },
    },
    async ({ id }) => ok(await findProductById(id)),
  );
}
