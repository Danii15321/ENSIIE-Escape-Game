import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  test: { include: ['checks/**/*.test.ts', 'checks/**/*.test.tsx'], environment: 'node' },
});
