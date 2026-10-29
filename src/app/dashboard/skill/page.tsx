import type { Metadata } from 'next';
import { PageHeading } from '@/components/workspace/page-heading';
import { SkillTab } from '@/components/dashboard/skill-tab';
import { loadAgentPage } from '@/lib/server/agent-page-data';

export const metadata: Metadata = { title: 'Agent setup · Simple Finance' };

/** Loads authenticated integration details exclusively on the agent setup route. */
export default async function AgentPage() {
  const data = await loadAgentPage();
  return (
    <div className="workspace-content space-y-8">
      <PageHeading
        title="Agent setup"
        description="Connect your assistant to your portfolio with the Simple Finance skill and MCP server"
      />
      <SkillTab {...data} />
    </div>
  );
}
