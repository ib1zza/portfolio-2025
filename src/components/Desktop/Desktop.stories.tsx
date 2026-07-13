import type { Meta, StoryObj } from '@storybook/react-vite';
import { Desktop } from './Desktop';

const meta = {
  title: 'Components/Desktop',
  component: Desktop,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Desktop>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
