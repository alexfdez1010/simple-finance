import { getCloudflareContext } from '@opennextjs/cloudflare';

/** Returns the current request's D1 binding; never retain it across Worker requests. */
export function getDatabase() {
  return getCloudflareContext().env.DB;
}
