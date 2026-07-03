import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconPainter } from './IconPainter';

const meta = {
  title: 'Components/IconPainter',
  component: IconPainter,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ padding: '2rem', backgroundColor: '#e5e5e5' }}>
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof IconPainter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
