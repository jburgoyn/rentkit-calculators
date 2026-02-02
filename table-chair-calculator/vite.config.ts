import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'table-calculator.js',
        chunkFileNames: 'table-calculator.js',
        assetFileNames: 'table-calculator.[ext]',
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
});
