import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    root: './',
    testTimeout: 60000,
    hookTimeout: 60000,
    fileParallelism: true,
    pool: 'forks',
    server: {
      deps: {
        external: [
          'argon2',
          '@prisma/client',
          'prisma',
          /^@nestjs\//,
          'express',
          'supertest',
          'rxjs',
        ],
      },
    },
    include: ['Tests/**/*.test.ts', 'Tests/**/*.spec.ts', 'src/**/*.spec.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
});
