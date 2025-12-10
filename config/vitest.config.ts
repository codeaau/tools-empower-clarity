// ./config/vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/**/*.test.ts'],
    exclude: ['**/dist/**', '**/node_modules/**'],
    setupFiles: ['tests/shims/node-env.ts'],
    reporters: ['basic'],
    coverage: {
      reporter: ['text', 'json-summary'],
      exclude: ['**/tests/**', '**/scripts/**']
    },
    retry: 0,
    maxConcurrency: 4,
    clearMocks: true
  }
});
