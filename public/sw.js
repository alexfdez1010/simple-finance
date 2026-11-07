const CACHE_PREFIX = 'simple-finance-offline-';
const CACHE_NAME = `${CACHE_PREFIX}v1`;
const OFFLINE_URL = '/offline';

/** Caches only the public fallback and its styles; never persists portfolio pages, sessions or API responses. */
async function prepareOfflineScreen() {
  const cache = await caches.open(CACHE_NAME);
  const response = await fetch(OFFLINE_URL, {
    cache: 'reload',
    credentials: 'omit',
  });
  if (!response.ok || response.redirected)
    throw new Error('Offline screen unavailable');
  const html = await response.clone().text();
  const styles = [...html.matchAll(/href="([^"\s]+\.css(?:\?[^"\s]*)?)"/g)]
    .map(
      (match) =>
        new URL(match[1].replaceAll('&amp;', '&'), self.location.origin),
    )
    .filter(
      (url) =>
        url.origin === self.location.origin &&
        url.pathname.startsWith('/_next/static/'),
    );
  await cache.addAll(
    styles.map((url) => new Request(url, { credentials: 'omit' })),
  );
  await cache.put(OFFLINE_URL, response);
  await self.skipWaiting();
}

self.addEventListener('install', (event) => {
  event.waitUntil(prepareOfflineScreen());
});

/** Removes only obsolete caches owned by this worker and takes control without forcing a reload. */
async function activateOfflineScreen() {
  const keys = await caches.keys();
  await Promise.all(
    keys
      .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
      .map((key) => caches.delete(key)),
  );
  await self.clients.claim();
}

self.addEventListener('activate', (event) => {
  event.waitUntil(activateOfflineScreen());
});

/** Uses live navigation responses; the non-personal offline screen is returned only when the network fails. */
async function navigate(request) {
  try {
    return await fetch(request);
  } catch {
    const cache = await caches.open(CACHE_NAME);
    return (await cache.match(OFFLINE_URL)) || Response.error();
  }
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (
    event.request.method !== 'GET' ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith('/api/')
  )
    return;
  if (event.request.mode === 'navigate') {
    event.respondWith(navigate(event.request));
  } else if (
    url.pathname.startsWith('/_next/static/') &&
    url.pathname.endsWith('.css')
  ) {
    event.respondWith(
      caches
        .open(CACHE_NAME)
        .then(
          async (cache) =>
            (await cache.match(event.request)) || fetch(event.request),
        ),
    );
  }
});
