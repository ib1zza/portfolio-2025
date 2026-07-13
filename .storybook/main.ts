import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-links",
    "@storybook/addon-vitest"
  ],
  "framework": {
    name: "@storybook/react-vite",
    options: {}
  },
  viteFinal: (config) => {
    return mergeConfig(config, {
      plugins: [
        {
          name: 'remove-pwa',
          configResolved(c) {
            const pwaPluginIndex = c.plugins.findIndex(p => p.name === 'vite-plugin-pwa:build');
            if (pwaPluginIndex !== -1) {
              c.plugins.splice(pwaPluginIndex, 1);
            }
          }
        }
      ]
    });
  }
};
export default config;
