import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 5174, // 5173 used by Table & Chair Calculator
    strictPort: false,
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'dance-floor-calculator.js',
        chunkFileNames: 'dance-floor-calculator.js',
        assetFileNames: 'dance-floor-calculator.[ext]',
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
});
