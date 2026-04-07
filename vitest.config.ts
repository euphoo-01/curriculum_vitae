import { defineVitestConfig } from '@nuxt/test-utils/config';

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    exclude: ['**/e2e/**', '**/node_modules/**'],
    coverage: {
      provider: 'v8',
      include: ['app/**'],
      exclude: ['app/types/**', 'app/assets/**'],
      thresholds: {
        lines: 80,
      },
    },
  },
});
