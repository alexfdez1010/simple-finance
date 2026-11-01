/** Accepts local app destinations only; defaults safely for untrusted or external input. */
export function safeRedirect(value: string | null | undefined): string {
  if (
    !value?.startsWith('/') ||
    value.startsWith('//') ||
    /[\\\r\n\t]/.test(value)
  ) {
    return '/dashboard';
  }
  return value;
}
