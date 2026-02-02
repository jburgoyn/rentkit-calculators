import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'seating-builder.js',
        chunkFileNames: 'seating-builder.js',
        assetFileNames: 'seating-builder.[ext]',
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
});
