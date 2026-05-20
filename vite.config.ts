import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src')
    }
  },
  build: {
    modulePreload: false,
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: path.resolve(import.meta.dirname, 'index.html'),
        background: path.resolve(import.meta.dirname, 'src/background/index.ts')
      },
      output: {
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
        entryFileNames: chunk_info => {
          if (chunk_info.name === 'background') {
            return 'background.js';
          }

          return 'assets/[name].js';
        }
      }
    }
  }
});
