import { defineProject } from 'vitest/config';

export default defineProject({
  test: {
    name: 'component-tests (jsdom)',
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    include: ['src/**/*.test.{ts,tsx}'],
    css: {
      modules: {
        classNameStrategy: 'non-scoped',
      },
    },
  },
});
