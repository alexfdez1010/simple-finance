import type {
  ScheduledController,
  ExecutionContext,
  ExportedHandler,
} from '@cloudflare/workers-types';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore -- OpenNext generates this module only during build.
import handler from './.open-next/worker.js';

export default {
  fetch: handler.fetch,
  /** Runs the existing authenticated capture in the same Worker; failures reach cron observability. */
  async scheduled(
    _event: ScheduledController,
    env: CloudflareEnv,
    ctx: ExecutionContext,
  ) {
    const response = await handler.fetch(
      new Request(`${env.BETTER_AUTH_URL}/api/cron/snapshot`, {
        headers: { authorization: `Bearer ${env.CRON_SECRET}` },
      }),
      env,
      ctx,
    );
    if (!response.ok)
      throw new Error(
        `Daily snapshot failed (${response.status}): ${await response.text()}`,
      );
  },
} satisfies ExportedHandler<CloudflareEnv>;
