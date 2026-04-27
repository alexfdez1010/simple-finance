/**
 * Downloads SKILL.md or the MCP config JSON for the simple-finance server.
 * @module app/api/skill/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth/auth-utils';
import {
  SKILL_CONFIG_FILENAME,
  SKILL_FILENAME,
  buildMcpJson,
  buildSkillMarkdown,
} from '@/lib/mcp/skill';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function mcpUrl(req: NextRequest): string {
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host');
  const proto =
    req.headers.get('x-forwarded-proto') ??
    req.nextUrl.protocol.replace(':', '');
  return `${proto}://${host}/api/mcp/mcp`;
}

export async function GET(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const kind = req.nextUrl.searchParams.get('kind') ?? 'skill';
  const url = mcpUrl(req);

  if (kind === 'config') {
    return new NextResponse(buildMcpJson(url), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="${SKILL_CONFIG_FILENAME}"`,
      },
    });
  }

  return new NextResponse(buildSkillMarkdown(url), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `attachment; filename="${SKILL_FILENAME}"`,
    },
  });
}
