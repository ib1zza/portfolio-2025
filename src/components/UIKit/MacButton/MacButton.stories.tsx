import type { Meta, StoryObj } from '@storybook/react-vite';
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
} satisfies Meta<typeof MacButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Regular: Story = {
  args: {
    children: 'Button',
    variant: 'regular',
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
