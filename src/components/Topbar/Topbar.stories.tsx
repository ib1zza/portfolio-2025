import type { Meta, StoryObj } from '@storybook/react';
import { Topbar } from './Topbar';
import { useEffect } from 'react';

// Mock zustand stores
import { useWindowManager } from '../../store/useWindowManager';
import { useFileSystem } from '../../store/useFileSystem';

const meta = {
  title: 'Components/Topbar',
  component: Topbar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => {
      // Small wrapper to give Topbar some space at the top
      return (
        <div style={{ height: '300px', backgroundColor: '#e5e5e5' }}>
          <Story />
        </div>
      );
    }
  ]
} satisfies Meta<typeof Topbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
