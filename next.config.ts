import type { NextConfig } from 'next';
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
  devIndicators: false,
  turbopack: { root: __dirname },
};
export default nextConfig;
