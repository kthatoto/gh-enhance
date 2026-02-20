import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/options/options.ts'),
      name: 'options',
      formats: ['iife'],
      fileName: () => 'options.js',
    },
  },
});
