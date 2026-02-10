import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    include: [
      'src/app/pages/dashboard/dashboard.spec.ts',
      'src/app/pages/routine/routine.spec.ts',
      'src/app/app.navigation.spec.ts',
      'src/app/app.spec.ts',
      'src/app/core/auth.service.spec.ts',
      'src/app/core/auth.integration.spec.ts',
      'src/app/core/auth.ui.spec.ts',
    ],
    exclude: [
      'src/app/api/**/*.spec.ts',
      'src/app/pages/exam/**/*.spec.ts',
      'src/app/components/**/*.spec.ts',
    ],
    deps: {
      optimizer: {
        web: {
          include: ['@angular/**/*'],
        },
      },
    },
  },
});
