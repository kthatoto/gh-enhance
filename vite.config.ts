import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyDirBeforeWrite: true,
    rollupOptions: {
      input: {
        content: resolve(__dirname, 'src/content/content.ts'),
        options: resolve(__dirname, 'src/options/options.ts'),
      },
      output: {
        // IIFE形式で出力（Chrome拡張機能のcontent scriptで動作させるため）
        format: 'iife',
        entryFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
  },
});
