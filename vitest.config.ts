import { defineConfig, mergeConfig } from 'vitest/config';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import viteConfig from './vite.config.mjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(configEnv => mergeConfig(
  viteConfig(configEnv),
  defineConfig({
    test: {
      projects: [
        {
          extends: true,
          test: {
            name: 'unit',
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
          }
        },
        {
          extends: true,
          plugins: [
            storybookTest({
              configDir: path.join(__dirname, '.storybook'),
            }),
          ],
          test: {
            name: 'storybook',
            browser: {
              enabled: true,
              headless: true,
              provider: playwright({}),
              instances: [
                { browser: 'chromium' },
              ],
              api: {
                host: '127.0.0.1',
                port: 3005,
              }
            },
          },
        }
      ]
    },
  })
));
