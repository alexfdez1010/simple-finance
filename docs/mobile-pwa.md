# Mobile installation

Simple Finance uses the existing chart mark on an opaque charcoal background for its home-screen icon. The glyph fits inside the central maskable safe area. Android receives 192 and 512 pixel PNGs plus a separate maskable declaration; iOS receives a 180 pixel Apple touch icon. `public/icons/app.svg` is the editable source, using Phosphor's existing ChartLineUp bold glyph under its MIT license. Run `bun scripts/generate-pwa-icons.ts` from the repository root after editing it to regenerate the PNGs and favicon.

## Install and launch

In Account security, choose Install app when the browser offers native installation. On iPhone or iPad, open the site in Safari, choose Share → Add to Home Screen → Add, and leave Open as Web App enabled if shown. Android Chrome also offers Install app or Add to Home Screen in its menu. Browser support determines which option appears. The installation card hides in standalone mode.

The installed application opens `/dashboard` in its own window. The manifest's stable identity and root scope preserve deep links; the existing authentication guard returns signed-out users to login and resumes the requested route. Installation does not bypass sign-in. The viewport covers the device, and content and the bottom navigation account for safe areas. No push or notification permission is requested.

## Offline behavior and updates

`PwaProvider` captures the optional browser install event across route changes. `useInstallation()` exposes only installation state and the user-triggered `install()` operation; consume it inside the root provider, as `InstallApp` does. `registerServiceWorker()` registers `/sw.js` only in a production secure context, including a built localhost preview. Development does not install a worker.

The worker caches only the public `/offline` document and its same-origin built stylesheets. Navigation uses the network; a failed navigation receives a non-personal connection screen with a full-page retry. Portfolio pages, API calls, authentication responses, mutations and React server-component payloads are never cached by this worker. There is no offline financial editing or saved portfolio view. An already open page may still show its existing in-memory content when connectivity is lost.

The worker script is served without HTTP caching and registered with `updateViaCache: 'none'`. Next.js headers cover local development; `public/_headers` applies the same policy to Cloudflare static assets. A replacement activates without reloading open forms. Increment `CACHE_NAME` in `public/sw.js` when changing the fallback or caching policy. Activation removes only older caches belonging to this worker. Removing the PWA from the home screen is controlled by the operating system.

## Verification

Run `bun run lint-format`, `bunx tsc --noEmit`, `bun run test:unit` and `bun run test:e2e`. The PWA end-to-end cases use the production Worker preview to check public manifest and icons, the actual worker lifecycle, offline navigation, cache isolation, and recovery. Physical iOS and Android home-screen installation should be checked on those devices; browser emulation verifies layout and web behavior but cannot reproduce the system installer.

References: [Next.js PWA guide](https://nextjs.org/docs/app/guides/progressive-web-apps), [manifest icons](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/icons), [service worker lifecycle](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers), [install prompt](https://developer.mozilla.org/en-US/docs/Web/API/BeforeInstallPromptEvent), [React effects](https://react.dev/reference/react/useEffect).
