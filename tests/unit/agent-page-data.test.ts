import { beforeEach, describe, expect, it, vi } from 'vitest';
const request = vi.hoisted(() => ({ headers: vi.fn() }));
vi.mock('next/headers', () => ({ headers: request.headers }));
vi.mock('@/lib/mcp/auth', () => ({
  expectedMcpToken: () => 'test-credential',
}));
import { loadAgentPage } from '@/lib/server/agent-page-data';
beforeEach(() => vi.clearAllMocks());

describe('agent setup request data', () => {
  it('uses forwarded public origin behind a reverse proxy', async () => {
    request.headers.mockResolvedValue(
      new Headers({
        'x-forwarded-host': 'portfolio.example.com',
        'x-forwarded-proto': 'https',
        host: 'localhost:3000',
      }),
    );
    const data = await loadAgentPage();
    expect(data.serverUrl).toBe('https://portfolio.example.com/api/mcp/mcp');
    expect(data.mcpJson).toContain(data.serverUrl);
    expect(data.token).toBe('test-credential');
    expect(data.tokenEnvVar).toBe('SIMPLE_FINANCE_TOKEN');
  });
  it('uses the local HTTP endpoint without forwarded headers', async () => {
    request.headers.mockResolvedValue(new Headers({ host: 'localhost:3000' }));
    expect((await loadAgentPage()).serverUrl).toBe(
      'http://localhost:3000/api/mcp/mcp',
    );
  });
  it('provides a localhost default when host is absent', async () => {
    request.headers.mockResolvedValue(new Headers());
    expect((await loadAgentPage()).serverUrl).toBe(
      'http://localhost:3000/api/mcp/mcp',
    );
  });
});
