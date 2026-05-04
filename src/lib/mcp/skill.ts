/**
 * SKILL.md and mcp.json builders for the simple-finance MCP server.
 * @module lib/mcp/skill
 */

import 'server-only';

const SKILL_NAME = 'simple-finance';
export const TOKEN_ENV_VAR = 'SIMPLE_FINANCE_TOKEN';

/**
 * Build the SKILL.md markdown describing the MCP server to an agent.
 *
 * @param serverUrl - Public URL of the MCP HTTP endpoint
 */
export function buildSkillMarkdown(serverUrl: string): string {
  return `---
name: ${SKILL_NAME}
description: Personal investment portfolio. Add, update, list and delete financial assets (Yahoo Finance tickers and custom fixed-rate products) through the simple-finance MCP server. Activate when the user mentions logging an investment, updating a holding, listing their portfolio, or removing an asset.
---

# Simple Finance

Investment-portfolio assistant backed by the \`${SKILL_NAME}\` MCP server at \`${serverUrl}\`.

The server exposes the following tools — discover their exact input schemas via the standard MCP \`tools/list\` call.

| Tool | Purpose |
|------|---------|
| \`list_assets\` | List every asset in the portfolio. |
| \`get_asset\` | Fetch one asset by id. |
| \`add_yahoo_asset\` | Create a Yahoo Finance asset tracked by ticker. |
| \`add_custom_asset\` | Create a custom fixed-rate asset. |
| \`update_yahoo_asset\` | Replace metadata of a Yahoo asset. |
| \`update_custom_asset\` | Replace metadata of a custom asset (currency is fixed at creation). |
| \`delete_asset\` | Permanently delete an asset by id. |
| \`add_custom_contribution\` | Append a deposit (positive) or withdrawal (negative) to a custom asset. |
| \`update_custom_contribution\` | Edit an existing contribution by id. |
| \`delete_custom_contribution\` | Remove a contribution by id. |

## Conventions

- Dates are \`YYYY-MM-DD\`. Default \`purchaseDate\` / \`firstMovementDate\` to today (UTC) when the user omits one.
- Yahoo \`purchasePrice\` is per share, **in EUR**.
- Custom \`firstMovementAmount\` is in the given \`currency\` (one of EUR, USD, BTC, ETH, XAUT) and stored as the asset's first contribution. No EUR conversion happens at rest.
- Currency is locked at creation; subsequent contributions and updates are always in that same currency.
- Confirm destructive operations (\`delete_asset\`, \`delete_custom_contribution\`, \`update_*\`) before invoking.
`;
}

/**
 * Build the mcp.json snippet to register the server in an agent config.
 *
 * @param serverUrl - Public URL of the MCP HTTP endpoint
 */
export function buildMcpJson(serverUrl: string): string {
  return JSON.stringify(
    {
      mcpServers: {
        [SKILL_NAME]: {
          type: 'http',
          url: serverUrl,
          headers: { Authorization: `Bearer \${${TOKEN_ENV_VAR}}` },
        },
      },
    },
    null,
    2,
  );
}

export const SKILL_FILENAME = 'SKILL.md';
export const SKILL_CONFIG_FILENAME = 'simple-finance.mcp.json';
export { SKILL_NAME };
