import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    lib: {
      entry: 'src/embed.tsx',
      name: 'RentKitPlaceSettingCalculator',
      fileName: 'place-setting-calculator',
      formats: ['iife'],
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        assetFileNames: 'place-setting-calculator.[ext]',
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
});
