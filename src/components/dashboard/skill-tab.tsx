/**
 * Skill tab content: download SKILL.md / mcp.json and copy connection details.
 * @module components/dashboard/skill-tab
 */

'use client';

import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/ui/copy-button';

interface SkillTabProps {
  serverUrl: string;
  token: string;
  mcpJson: string;
  tokenEnvVar: string;
}

/**
 * Renders the skill onboarding panel inside the dashboard tabs.
 *
 * @param serverUrl - Public URL of the MCP HTTP endpoint
 * @param token - Bearer token an agent must send (sha256 of PASSWORD)
 * @param mcpJson - Pre-rendered mcp.json snippet
 * @param tokenEnvVar - Name of the env var the snippet references
 */
export function SkillTab({
  serverUrl,
  token,
  mcpJson,
  tokenEnvVar,
}: SkillTabProps) {
  const exportLine = `export ${tokenEnvVar}='${token}'`;

  return (
    <section className="flex flex-col gap-6 sm:gap-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <article className="glass-card rounded-2xl bg-card p-6 flex flex-col gap-4">
          <header className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Step 1
            </span>
            <h3 className="font-serif text-xl">Download skill</h3>
          </header>
          <p className="text-sm text-muted-foreground">
            Drop <code>SKILL.md</code> into your agent&apos;s skills directory.
            The file declares the MCP tools and a few conventions; the agent
            decides when to call them.
          </p>
          <Button asChild>
            <a href="/api/skill?kind=skill" download>
              Download SKILL.md
            </a>
          </Button>
        </article>

        <article className="glass-card rounded-2xl bg-card p-6 flex flex-col gap-4">
          <header className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Step 2
            </span>
            <h3 className="font-serif text-xl">Register MCP server</h3>
          </header>
          <p className="text-sm text-muted-foreground">
            Add the snippet to your MCP config. The bearer token is read from{' '}
            <code>${tokenEnvVar}</code> at runtime — never hard-code it in the
            file you commit.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <a href="/api/skill?kind=config" download>
                Download config
              </a>
            </Button>
            <CopyButton value={mcpJson} label="Copy JSON" />
          </div>
        </article>
      </div>

      <article className="glass-card rounded-2xl bg-card p-6 flex flex-col gap-5">
        <header className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            Endpoint
          </span>
          <h3 className="font-serif text-xl">Connection details</h3>
        </header>

        <div className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            Server URL
          </span>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <code className="break-all text-sm">{serverUrl}</code>
            <CopyButton value={serverUrl} label="Copy URL" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            Bearer token
          </span>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <code className="break-all text-sm">{token}</code>
            <CopyButton value={token} label="Copy token" />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <code className="break-all text-xs">{exportLine}</code>
            <CopyButton value={exportLine} label="Copy export" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            mcp.json
          </span>
          <pre className="overflow-x-auto rounded-xl border bg-muted/40 p-3 text-xs leading-relaxed">
            {mcpJson}
          </pre>
        </div>
      </article>
    </section>
  );
}
