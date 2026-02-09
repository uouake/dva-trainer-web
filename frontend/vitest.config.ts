import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.spec.ts'],
    deps: {
      optimizer: {
        web: {
          include: ['@angular/**/*'],
        },
      },
    },
  },
});
