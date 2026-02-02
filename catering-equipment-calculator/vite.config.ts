import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'catering-calculator.js',
        chunkFileNames: 'catering-calculator.js',
        assetFileNames: 'catering-calculator.[ext]',
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
});
