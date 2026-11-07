// @vitest-environment node
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it, vi } from 'vitest';

/** Evaluates the shipped worker with browser boundaries replaced by deterministic in-memory doubles. */
function worker() {
  const handlers: Record<string, (event: unknown) => void> = {};
  const cache = {
    addAll: vi.fn().mockResolvedValue(undefined),
    put: vi.fn().mockResolvedValue(undefined),
    match: vi.fn().mockResolvedValue(new Response('Offline')),
  };
  const caches = {
    open: vi.fn().mockResolvedValue(cache),
    keys: vi
      .fn()
      .mockResolvedValue([
        'unrelated',
        'simple-finance-offline-old',
        'simple-finance-offline-v1',
      ]),
    delete: vi.fn().mockResolvedValue(true),
  };
  const fetch = vi
    .fn()
    .mockResolvedValue(
      new Response(
        '<link href="/_next/static/app.css" rel="stylesheet"><link href="https://other.test/x.css">',
      ),
    );
  const self = {
    location: { origin: 'https://finance.test' },
    addEventListener: (name: string, handler: (event: unknown) => void) => {
      handlers[name] = handler;
    },
    skipWaiting: vi.fn(),
    clients: { claim: vi.fn() },
  };
  runInNewContext(readFileSync('public/sw.js', 'utf8'), {
    self,
    caches,
    fetch,
    URL,
    Request,
    Response,
  });
  return { handlers, cache, caches, fetch, self };
}

describe('private PWA offline policy', () => {
  it('precaches only anonymous fallback HTML and its own styles', async () => {
    const runtime = worker();
    const waitUntil = vi.fn();
    runtime.handlers.install({ waitUntil });
    await waitUntil.mock.calls[0][0];
    expect(runtime.fetch).toHaveBeenCalledWith('/offline', {
      cache: 'reload',
      credentials: 'omit',
    });
    const assets = runtime.cache.addAll.mock.calls[0][0] as Request[];
    expect(assets.map((asset) => asset.url)).toEqual([
      'https://finance.test/_next/static/app.css',
    ]);
    expect(assets[0].credentials).toBe('omit');
    expect(runtime.cache.put).toHaveBeenCalledWith(
      '/offline',
      expect.any(Response),
    );
    expect(runtime.self.skipWaiting).toHaveBeenCalledOnce();
  });

  it('rejects a failed fallback installation instead of caching an error page', async () => {
    const runtime = worker();
    runtime.fetch.mockResolvedValue(
      new Response('Unavailable', { status: 503 }),
    );
    const waitUntil = vi.fn();
    runtime.handlers.install({ waitUntil });
    await expect(waitUntil.mock.calls[0][0]).rejects.toThrow(
      'Offline screen unavailable',
    );
    expect(runtime.cache.put).not.toHaveBeenCalled();
    expect(runtime.self.skipWaiting).not.toHaveBeenCalled();
  });

  it('cleans up only its own obsolete caches', async () => {
    const runtime = worker();
    const waitUntil = vi.fn();
    runtime.handlers.activate({ waitUntil });
    await waitUntil.mock.calls[0][0];
    expect(runtime.caches.delete).toHaveBeenCalledExactlyOnceWith(
      'simple-finance-offline-old',
    );
    expect(runtime.self.clients.claim).toHaveBeenCalledOnce();
  });

  it.each([
    { url: 'https://finance.test/api/backup', method: 'GET', mode: 'navigate' },
    { url: 'https://finance.test/dashboard', method: 'POST', mode: 'navigate' },
    { url: 'https://other.test/', method: 'GET', mode: 'navigate' },
    {
      url: 'https://finance.test/dashboard?_rsc=123',
      method: 'GET',
      mode: 'cors',
    },
  ])(
    'leaves sensitive or unrelated requests untouched: $url $method',
    (request) => {
      const runtime = worker();
      const respondWith = vi.fn();
      runtime.handlers.fetch({ request, respondWith });
      expect(respondWith).not.toHaveBeenCalled();
      expect(runtime.fetch).not.toHaveBeenCalled();
    },
  );

  it('returns live navigation without caching the response and falls back only on network failure', async () => {
    const runtime = worker();
    const respondWith = vi.fn();
    const event = {
      request: {
        url: 'https://finance.test/dashboard',
        method: 'GET',
        mode: 'navigate',
      },
      respondWith,
    };
    runtime.fetch.mockResolvedValueOnce(new Response('Login', { status: 401 }));
    runtime.handlers.fetch(event);
    expect((await respondWith.mock.calls[0][0]).status).toBe(401);
    expect(runtime.cache.match).not.toHaveBeenCalled();
    runtime.fetch.mockRejectedValueOnce(new Error('Offline'));
    runtime.handlers.fetch(event);
    expect(await (await respondWith.mock.calls[1][0]).text()).toBe('Offline');
    expect(runtime.cache.put).not.toHaveBeenCalled();
  });
});
