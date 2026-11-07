/** Registers only in production and secure contexts; failures leave normal browser navigation available. */
export async function registerServiceWorker(): Promise<void> {
  if (
    process.env.NODE_ENV !== 'production' ||
    !window.isSecureContext ||
    !('serviceWorker' in navigator)
  )
    return;

  try {
    await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none',
    });
  } catch (error) {
    console.warn('Could not register the offline screen', error);
  }
}
