import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from '@storybook/test';
import { Terminal } from './Terminal';

const meta = {
  title: 'Components/Terminal',
  component: Terminal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '600px', height: '400px', padding: '20px', backgroundColor: '#e5e5e5', border: '2px solid #000', boxShadow: '4px 4px 0 #000' }}>
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof Terminal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    windowId: 'terminal-storybook',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');
    
    // Type about command
    await userEvent.type(input, 'about{enter}');
    
    // Verify command output
    await expect(canvasElement).toHaveTextContent('Motorola MC68040');
  },
};
