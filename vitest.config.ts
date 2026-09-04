import { defineConfig } from 'vitest/config';
import { config } from 'dotenv';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'server-only': path.resolve(__dirname, './tests/mocks/server-only.ts'),
    },
  },
  test: {
    testTimeout: 10000,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    env: {
      ...config().parsed,
    },
    globals: true,
  },
});
