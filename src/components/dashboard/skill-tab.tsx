/**
 * Skill tab content: download SKILL.md / mcp.json and copy connection details.
 * @module components/dashboard/skill-tab
 */

'use client';

import { Card } from '@heroui/react';
import { buttonVariants } from '@heroui/styles';
import { DownloadSimple } from '@phosphor-icons/react';
import { CopyButton } from '@/components/ui/copy-button';
import { cn } from '@/lib/utils';

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
    <section aria-label="Agent skill" className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="border border-border py-0 shadow-none">
          <Card.Header className="p-5 pb-2">
            <Card.Description>Step 1</Card.Description>
            <Card.Title className="font-serif text-xl">
              Download skill
            </Card.Title>
          </Card.Header>
          <Card.Content className="flex flex-1 flex-col gap-5 p-5 pt-2">
            <p className="text-sm text-muted-foreground">
              Add <code>SKILL.md</code> to your agent&apos;s skills directory.
            </p>
            <a
              href="/api/skill?kind=skill"
              download
              className={cn(
                buttonVariants({ size: 'md', variant: 'primary' }),
                'w-fit',
              )}
            >
              <DownloadSimple aria-hidden size={16} />
              Download SKILL.md
            </a>
          </Card.Content>
        </Card>

        <Card className="border border-border py-0 shadow-none">
          <Card.Header className="p-5 pb-2">
            <Card.Description>Step 2</Card.Description>
            <Card.Title className="font-serif text-xl">
              Register MCP server
            </Card.Title>
          </Card.Header>
          <Card.Content className="flex flex-1 flex-col gap-5 p-5 pt-2">
            <p className="text-sm text-muted-foreground">
              Add the config and export <code>${tokenEnvVar}</code>.
            </p>
            <div className="flex flex-wrap gap-2">
              <a
                href="/api/skill?kind=config"
                download
                className={cn(
                  buttonVariants({ size: 'md', variant: 'primary' }),
                  'w-fit',
                )}
              >
                <DownloadSimple aria-hidden size={16} />
                Download config
              </a>
              <CopyButton value={mcpJson} label="Copy JSON" />
            </div>
          </Card.Content>
        </Card>
      </div>

      <Card className="border border-border py-0 shadow-none">
        <Card.Header className="p-5 pb-2">
          <Card.Description>Endpoint</Card.Description>
          <Card.Title className="font-serif text-xl">
            Connection details
          </Card.Title>
        </Card.Header>
        <Card.Content className="flex flex-col gap-5 p-5 pt-2">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              Server URL
            </span>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <code className="break-all text-sm">{serverUrl}</code>
              <CopyButton value={serverUrl} label="Copy URL" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-muted-foreground">
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
            <span className="text-xs font-medium text-muted-foreground">
              mcp.json
            </span>
            <pre className="overflow-x-auto rounded-md bg-surface-secondary p-3 text-xs leading-relaxed">
              {mcpJson}
            </pre>
          </div>
        </Card.Content>
      </Card>
    </section>
  );
}
