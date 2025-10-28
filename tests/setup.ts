import { vi } from 'vitest';

// Needed to mock the server-only imports in Next.js
vi.mock('server-only', () => {
  return {};
});
