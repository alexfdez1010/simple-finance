import { describe, expect, it } from 'vitest';
import { safeRedirect } from '@/lib/auth/redirect';

describe('post-login destinations', () => {
  it.each([
    null,
    undefined,
    '',
    '//evil.test',
    'https://evil.test',
    '/\\evil.test',
    '/\n/evil.test',
    '/\t/evil.test',
  ])('rejects external or ambiguous destinations %s', (value) => {
    expect(safeRedirect(value)).toBe('/dashboard');
  });
  it('preserves local deep links and their filters', () => {
    expect(safeRedirect('/dashboard/portfolio?sort=name')).toBe(
      '/dashboard/portfolio?sort=name',
    );
  });
});
