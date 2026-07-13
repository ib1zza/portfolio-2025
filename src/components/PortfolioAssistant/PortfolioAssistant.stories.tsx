import type { Meta, StoryObj } from '@storybook/react-vite';
import { PortfolioAssistant } from './PortfolioAssistant';

const meta = {
  title: 'Components/PortfolioAssistant',
  component: PortfolioAssistant,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '500px', height: '400px', padding: '10px', backgroundColor: '#e5e5e5', border: '2px solid #000', boxShadow: '4px 4px 0 #000' }}>
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof PortfolioAssistant>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
