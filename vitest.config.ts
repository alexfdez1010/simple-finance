import { defineConfig } from 'vitest/config';
import { config } from 'dotenv';

export default defineConfig({
  test: {
    testTimeout: 10000,
    environment: 'node',
    setupFiles: './tests/setup.ts',
    env: {
      ...config().parsed,
    },
  },
});
