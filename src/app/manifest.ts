import type { MetadataRoute } from 'next';

/** Returns the public install identity; launching the dashboard preserves the normal session guard. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Simple Finance',
    short_name: 'Finance',
    description: 'A private view of your portfolio and its performance.',
    lang: 'en',
    start_url: '/dashboard',
    scope: '/',
    display: 'standalone',
    background_color: '#f5f5f7',
    theme_color: '#f5f5f7',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
