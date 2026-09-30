/// <reference types="vitest/config" />
import path from 'path'
import react from '@vitejs/plugin-react'
import { defineConfig, createLogger } from 'vite'

const logger = createLogger()
const originalError = logger.error.bind(logger)

logger.error = (msg, options) => {
  if (typeof msg === 'string' && (msg.includes('ws proxy error') || msg.includes('socket hang up'))) {
    return
  }
  originalError(msg, options)
}

export default defineConfig({
  customLogger: logger,
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    port: 5175,
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:4002',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('error', () => {})
        },
      },
      '/ws': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:4002',
        changeOrigin: true,
        ws: true,
        configure: (proxy) => {
          proxy.on('error', () => {})
        },
      },
      '/socket.io': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:4002',
        changeOrigin: true,
        ws: true,
        configure: (proxy) => {
          proxy.on('error', () => {})
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
