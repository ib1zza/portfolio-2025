import type { Meta, StoryObj } from '@storybook/react-vite';
import { SpaceInvaders } from './SpaceInvaders';

const meta = {
  title: 'Components/SpaceInvaders',
  component: SpaceInvaders,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '480px', padding: '10px', backgroundColor: '#e5e5e5', border: '2px solid #000', boxShadow: '4px 4px 0 #000' }}>
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof SpaceInvaders>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    windowId: 'space-invaders-storybook',
  },
};
