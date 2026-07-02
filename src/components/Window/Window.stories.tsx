import type { Meta, StoryObj } from '@storybook/react';
import { Window } from './Window';
import type { WindowInstance } from '../../store/useWindowManager';

const defaultWindowData: WindowInstance = {
  id: 'window-1',
  title: 'Test Window',
  position: { x: 50, y: 50 },
  size: { width: 400, height: 300 },
  zIndex: 10,
  windowVariant: 'default',
  resizable: true,
};

const meta = {
  title: 'Components/Window',
  component: Window,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', width: '100%', height: '500px', backgroundColor: '#e5e5e5' }}>
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof Window>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    data: defaultWindowData
  },
};

export const NoteVariant: Story = {
  args: {
    data: {
      ...defaultWindowData,
      title: 'Sticky Note',
      windowVariant: 'note',
    }
  },
};

export const HypercardVariant: Story = {
  args: {
    data: {
      ...defaultWindowData,
      title: 'Hypercard Stack',
      windowVariant: 'hypercard',
    }
  },
};
