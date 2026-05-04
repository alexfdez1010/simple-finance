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
  findProductById,
} from '@/lib/infrastructure/database/product-repository';
import {
  addContribution,
  updateContribution,
  deleteContribution,
} from '@/lib/infrastructure/database/contribution-repository';
import {
  contributionFields,
  customCreateFields,
  customUpdateFields,
  ok,
  yahooFields,
} from './shared';

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
        'Create a custom asset with a fixed annual return rate (e.g. savings account, bond). firstMovementDate is YYYY-MM-DD; firstMovementAmount is stored as the first contribution in the product currency (never converted to EUR). Currency is locked at creation.',
      inputSchema: customCreateFields,
    },
    async (input) => {
      const created = await createCustomProduct({
        name: input.name,
        annualReturnRate: input.annualReturnRate,
        currency: input.currency ?? 'EUR',
        firstMovement: {
          amount: input.firstMovementAmount,
          date: new Date(input.firstMovementDate),
          note: input.firstMovementNote ?? null,
        },
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
        'Replace metadata (name, quantity, rate) of a custom asset. Currency is fixed at creation and cannot be updated. Contributions are managed via add_custom_contribution / update_custom_contribution / delete_custom_contribution.',
      inputSchema: { id: z.string().min(1), ...customUpdateFields },
    },
    async ({ id, ...rest }) => {
      const updated = await updateCustomProduct({
        productId: id,
        name: rest.name,
        annualReturnRate: rest.annualReturnRate,
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

  server.registerTool(
    'add_custom_contribution',
    {
      title: 'Add a deposit or withdrawal',
      description:
        'Add a contribution (deposit if amount > 0, withdrawal if amount < 0) to a custom asset. `assetId` is the FinancialProduct id. Amount is in the product currency.',
      inputSchema: {
        assetId: z.string().min(1),
        ...contributionFields,
      },
    },
    async ({ assetId, amount, date, note }) => {
      const product = await findProductById(assetId);
      if (!product || product.type !== 'CUSTOM') {
        throw new Error(`No custom asset found with id ${assetId}`);
      }
      const created = await addContribution({
        customProductDataId: product.custom.id,
        amount,
        date: new Date(date),
        note: note ?? null,
      });
      return ok(created);
    },
  );

  server.registerTool(
    'update_custom_contribution',
    {
      title: 'Update a deposit or withdrawal',
      description:
        'Update an existing contribution by its id. Amount is signed and in the product currency.',
      inputSchema: {
        id: z.string().min(1),
        ...contributionFields,
      },
    },
    async ({ id, amount, date, note }) => {
      const updated = await updateContribution({
        id,
        amount,
        date: new Date(date),
        note: note ?? null,
      });
      return ok(updated);
    },
  );

  server.registerTool(
    'delete_custom_contribution',
    {
      title: 'Delete a contribution',
      description:
        'Permanently delete a contribution (deposit or withdrawal) by id.',
      inputSchema: { id: z.string().min(1) },
    },
    async ({ id }) => {
      await deleteContribution(id);
      return ok({ deleted: id });
    },
  );
}
