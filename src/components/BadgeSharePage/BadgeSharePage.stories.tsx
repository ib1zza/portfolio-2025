import type { Meta, StoryObj } from '@storybook/react-vite';
import { BadgeSharePage } from './BadgeSharePage';

const meta = {
  title: 'Components/BadgeSharePage',
  component: BadgeSharePage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof BadgeSharePage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
