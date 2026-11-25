import { defineConfig } from 'vite';

export default defineConfig({
  root: __dirname,
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: 'main.ts',
      output: {
        format: 'iife',
        entryFileNames: 'app.js',
      },
    },
  },
});
