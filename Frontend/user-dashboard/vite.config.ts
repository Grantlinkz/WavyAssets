/// <reference types="vitest/config" />
import path from 'path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
      '/health': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('framer-motion')) {
              return 'motion-vendor';
            }
            if (id.includes('@radix-ui') || id.includes('lucide-react')) {
              return 'radix-vendor';
            }
            if (id.includes('react') || id.includes('zustand')) {
              return 'react-vendor';
            }
          }
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./Tests/setup.ts'],
    testTimeout: 25000,
    isolate: false,
  },
})
