import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'bar-calculator.js',
        chunkFileNames: 'bar-calculator.js',
        assetFileNames: 'bar-calculator.[ext]',
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
});
