/**
 * MCP mutation tools that create, update and delete financial assets.
 * @module lib/mcp/tools/mutations
 */

import 'server-only';
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  createYahooFinanceProduct,
  createCustomProduct,
  updateYahooFinanceProduct,
  updateCustomProduct,
  deleteProduct,
} from '@/lib/infrastructure/database/product-repository';
import { convertToEur } from '@/lib/domain/services/currency-converter';
import { convertCryptoAssetToEur } from '@/lib/domain/services/crypto-converter';
import { customFields, ok, yahooFields } from './shared';

/**
 * Convert an initial investment to EUR following the same rules as the
 * browser server action: USD via FX, BTC/ETH/XAUT via crypto rates,
 * everything else passed through.
 */
async function toEur(amount: number, currency: string): Promise<number> {
  if (currency === 'USD') return convertToEur(amount);
  if (currency === 'BTC' || currency === 'ETH' || currency === 'XAUT') {
    return convertCryptoAssetToEur(amount, currency);
  }
  return amount;
}

/**
 * Registers add/update/delete tools on the MCP server.
 *
 * @param server - MCP server instance
 */
export function registerMutationTools(server: McpServer): void {
  server.registerTool(
    'add_yahoo_asset',
    {
      title: 'Add a Yahoo Finance asset',
      description:
        'Create a Yahoo Finance asset (ETF/stock/crypto) tracked by ticker symbol. purchaseDate is YYYY-MM-DD; purchasePrice is per share in EUR.',
      inputSchema: yahooFields,
    },
    async (input) => {
      const created = await createYahooFinanceProduct({
        name: input.name,
        symbol: input.symbol.toUpperCase(),
        quantity: input.quantity,
        purchasePrice: input.purchasePrice,
        purchaseDate: new Date(input.purchaseDate),
      });
      return ok(created);
    },
  );

  server.registerTool(
    'add_custom_asset',
    {
      title: 'Add a custom fixed-rate asset',
      description:
        'Create a custom asset with a fixed annual return rate (e.g. savings account, bond). investmentDate is YYYY-MM-DD; initialInvestment is in the given currency and stored converted to EUR.',
      inputSchema: customFields,
    },
    async (input) => {
      const currency = input.currency ?? 'EUR';
      const initialInvestmentEur = await toEur(
        input.initialInvestment,
        currency,
      );
      const created = await createCustomProduct({
        name: input.name,
        annualReturnRate: input.annualReturnRate,
        initialInvestment: initialInvestmentEur,
        investmentDate: new Date(input.investmentDate),
        quantity: input.quantity,
        currency,
      });
      return ok(created);
    },
  );

  server.registerTool(
    'update_yahoo_asset',
    {
      title: 'Update a Yahoo Finance asset',
      description: 'Replace metadata of an existing Yahoo Finance asset by id.',
      inputSchema: { id: z.string().min(1), ...yahooFields },
    },
    async ({ id, ...rest }) => {
      const updated = await updateYahooFinanceProduct({
        productId: id,
        name: rest.name,
        quantity: rest.quantity,
        purchasePrice: rest.purchasePrice,
        purchaseDate: new Date(rest.purchaseDate),
      });
      return ok(updated);
    },
  );

  server.registerTool(
    'update_custom_asset',
    {
      title: 'Update a custom fixed-rate asset',
      description:
        'Replace metadata of an existing custom asset by id. initialInvestment is treated as already in EUR (no currency conversion is applied on update).',
      inputSchema: { id: z.string().min(1), ...customFields },
    },
    async ({ id, ...rest }) => {
      const updated = await updateCustomProduct({
        productId: id,
        name: rest.name,
        quantity: rest.quantity,
        annualReturnRate: rest.annualReturnRate,
        initialInvestment: rest.initialInvestment,
        investmentDate: new Date(rest.investmentDate),
        currency: rest.currency ?? 'EUR',
      });
      return ok(updated);
    },
  );

  server.registerTool(
    'delete_asset',
    {
      title: 'Delete an asset',
      description: 'Permanently delete a financial asset by id.',
      inputSchema: { id: z.string().min(1) },
    },
    async ({ id }) => {
      await deleteProduct(id);
      return ok({ deleted: id });
    },
  );
}
