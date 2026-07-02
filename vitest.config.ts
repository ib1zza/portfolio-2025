import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.mjs';

export default defineConfig(configEnv => mergeConfig(
  viteConfig(configEnv),
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './tests/setup.ts',
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        all: true,
        include: ['src/**/*.ts', 'src/**/*.tsx'],
        exclude: [
          'src/vite-env.d.ts',
          'src/main.tsx',
          '**/*.stories.tsx',
          '**/*.stories.ts',
          '**/*.mdx'
        ],
      },
      include: ['src/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    },
  })
));
