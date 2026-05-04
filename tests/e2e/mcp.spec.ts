/**
 * E2E test for the simple-finance MCP server.
 * Single connect() per describe block to avoid paying the MCP
 * initialize/notifications handshake on every test.
 * @module tests/e2e/mcp.spec
 */

import { createHash } from 'node:crypto';
import { config as loadEnv } from 'dotenv';
import { test, expect, request } from '@playwright/test';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

loadEnv();

const PASSWORD = process.env.PASSWORD ?? '12345678';
const MCP_URL = 'http://localhost:3000/api/mcp/mcp';
const TOKEN = createHash('sha256').update(PASSWORD).digest('hex');

const TOOL_NAMES = [
  'list_assets',
  'get_asset',
  'add_yahoo_asset',
  'add_custom_asset',
  'update_yahoo_asset',
  'update_custom_asset',
  'delete_asset',
  'add_custom_contribution',
  'update_custom_contribution',
  'delete_custom_contribution',
];

function parseToolJson<T>(result: unknown): T {
  const content = (
    result as { content?: Array<{ type: string; text?: string }> }
  ).content;
  const text = content?.find((c) => c.type === 'text')?.text;
  expect(text, 'tool returned no text content').toBeTruthy();
  return JSON.parse(text!) as T;
}

test('MCP rejects missing or wrong bearer tokens with 401', async () => {
  const ctx = await request.newContext();
  try {
    const noAuth = await ctx.post(MCP_URL, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
      },
      data: { jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} },
    });
    expect(noAuth.status()).toBe(401);

    const badAuth = await ctx.post(MCP_URL, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
        Authorization: 'Bearer not-the-real-token',
      },
      data: { jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} },
    });
    expect(badAuth.status()).toBe(401);
  } finally {
    await ctx.dispose();
  }
});

test('MCP exposes catalog and supports add/list/update/delete for both asset types', async () => {
  const transport = new StreamableHTTPClientTransport(new URL(MCP_URL), {
    requestInit: { headers: { Authorization: `Bearer ${TOKEN}` } },
  });
  const client = new Client({ name: 'e2e', version: '0.0.0' });
  await client.connect(transport);

  try {
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name).sort()).toEqual([...TOOL_NAMES].sort());

    const today = new Date().toISOString().slice(0, 10);
    const stamp = Date.now();

    const yahoo = parseToolJson<{
      id: string;
      type: 'YAHOO_FINANCE';
      yahoo: { symbol: string; purchasePrice: number };
    }>(
      await client.callTool({
        name: 'add_yahoo_asset',
        arguments: {
          name: `MCP E2E Yahoo ${stamp}`,
          symbol: 'aapl',
          quantity: 3,
          purchasePrice: 150,
          purchaseDate: today,
        },
      }),
    );
    expect(yahoo.type).toBe('YAHOO_FINANCE');
    expect(yahoo.yahoo.symbol).toBe('AAPL');

    const custom = parseToolJson<{
      id: string;
      type: 'CUSTOM';
      custom: { initialInvestment: number; annualReturnRate: number };
    }>(
      await client.callTool({
        name: 'add_custom_asset',
        arguments: {
          name: `MCP E2E Custom ${stamp}`,
          quantity: 1,
          annualReturnRate: 0.05,
          initialInvestment: 1000,
          investmentDate: today,
          currency: 'EUR',
        },
      }),
    );
    expect(custom.type).toBe('CUSTOM');
    expect(custom.custom.initialInvestment).toBeCloseTo(1000, 2);

    const list = parseToolJson<Array<{ id: string }>>(
      await client.callTool({ name: 'list_assets', arguments: {} }),
    );
    const ids = new Set(list.map((p) => p.id));
    expect(ids.has(yahoo.id)).toBe(true);
    expect(ids.has(custom.id)).toBe(true);

    const fetched = parseToolJson<{ id: string } | null>(
      await client.callTool({
        name: 'get_asset',
        arguments: { id: yahoo.id },
      }),
    );
    expect(fetched?.id).toBe(yahoo.id);

    const updated = parseToolJson<{ custom: { annualReturnRate: number } }>(
      await client.callTool({
        name: 'update_custom_asset',
        arguments: {
          id: custom.id,
          name: `MCP E2E Custom ${stamp} (renamed)`,
          quantity: 2,
          annualReturnRate: 0.07,
          currency: 'EUR',
        },
      }),
    );
    expect(updated.custom.annualReturnRate).toBeCloseTo(0.07, 4);

    const contribution = parseToolJson<{ id: string; amount: number }>(
      await client.callTool({
        name: 'add_custom_contribution',
        arguments: {
          assetId: custom.id,
          amount: 500,
          date: today,
          note: 'Monthly deposit',
        },
      }),
    );
    expect(contribution.amount).toBe(500);

    const updatedContribution = parseToolJson<{ id: string; amount: number }>(
      await client.callTool({
        name: 'update_custom_contribution',
        arguments: {
          id: contribution.id,
          amount: -100,
          date: today,
          note: 'Withdrawal',
        },
      }),
    );
    expect(updatedContribution.amount).toBe(-100);

    const deletedContribution = parseToolJson<{ deleted: string }>(
      await client.callTool({
        name: 'delete_custom_contribution',
        arguments: { id: contribution.id },
      }),
    );
    expect(deletedContribution.deleted).toBe(contribution.id);

    for (const id of [yahoo.id, custom.id]) {
      const deleted = parseToolJson<{ deleted: string }>(
        await client.callTool({ name: 'delete_asset', arguments: { id } }),
      );
      expect(deleted.deleted).toBe(id);
    }

    const after = parseToolJson<Array<{ id: string }>>(
      await client.callTool({ name: 'list_assets', arguments: {} }),
    );
    const remaining = new Set(after.map((p) => p.id));
    expect(remaining.has(yahoo.id)).toBe(false);
    expect(remaining.has(custom.id)).toBe(false);
  } finally {
    await transport.close();
  }
});
