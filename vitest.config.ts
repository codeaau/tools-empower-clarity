import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    include: ['src/**/?(*.)+(test|spec).ts', 'reference-manager (RefMan)/tests/**/*.ts', 'Session Continuity Tracker (SCT)/src/tests/**/*.ts'],
    exclude: ['**/dist/**', 'node_modules'],
  },
});
