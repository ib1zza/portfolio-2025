import '../src/global/styles/index.scss';
import type { Preview } from '@storybook/react-vite';
import { CursorProvider } from '../src/contexts/CursorContext';
import { WindowOpenAnimationProvider } from '../src/components/WindowOpenAnimation/WindowOpenAnimation';
import { EasterEggProvider } from '../src/features/easter-eggs/EasterEggProvider';

const preview: Preview = {
  decorators: [
    (Story) => {
      // Fix global styles for Storybook
      document.body.classList.add('native-cursor');
      if (!document.getElementById('sb-override-styles')) {
        const sbStyle = document.createElement('style');
        sbStyle.id = 'sb-override-styles';
        sbStyle.textContent = `
          html, body, #root { overflow: auto !important; }
        `;
        document.head.appendChild(sbStyle);
      }
      return <Story />;
    },
    (Story) => (
      <CursorProvider>
        <WindowOpenAnimationProvider>
          <EasterEggProvider>
            <Story />
          </EasterEggProvider>
        </WindowOpenAnimationProvider>
      </CursorProvider>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },
};

export default preview;