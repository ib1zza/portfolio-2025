import type { Meta, StoryObj } from '@storybook/react-vite';
import { BadgeGenerator } from './BadgeGenerator';

const meta = {
  title: 'Components/BadgeGenerator',
  component: BadgeGenerator,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '640px', padding: '20px', backgroundColor: '#e5e5e5', border: '2px solid #000', boxShadow: '4px 4px 0 #000' }}>
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof BadgeGenerator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    windowId: 'badge-generator-storybook',
  },
};
