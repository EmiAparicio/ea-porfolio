import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    projects: ['./vitest.config.rtl.ts', './vitest.config.storybook.ts'],
  },
});
