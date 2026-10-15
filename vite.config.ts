import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { offlinePlugin } from './scripts/offline-plugin.ts';

export default defineConfig({
  plugins: [react(), offlinePlugin()],
  base: './',
  test: {
    include: ['checks/**/*.test.ts', 'checks/**/*.test.tsx'],
    environment: 'node',
    maxWorkers: 4,
  },
});
