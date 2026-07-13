import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from '@storybook/test';
import { MacButton } from './MacButton';

const meta = {
  title: 'UIKit/MacButton',
  component: MacButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['regular', 'default'],
    },
    isPressed: {
      control: 'boolean',
    },
  },
  args: {
    onClick: fn(),
  },
} satisfies Meta<typeof MacButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Regular: Story = {
  args: {
    children: 'Button',
    variant: 'regular',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /button/i });
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalled();
  },
};

export const Default: Story = {
  args: {
    children: 'Default Button',
    variant: 'default',
  },
};

export const Pressed: Story = {
  args: {
    children: 'Pressed Button',
    isPressed: true,
  },
};
