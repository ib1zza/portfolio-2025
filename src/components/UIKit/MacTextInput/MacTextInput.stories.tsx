import type { Meta, StoryObj } from '@storybook/react-vite';
import { MacTextInput } from './MacTextInput';
import { useState } from 'react';

const meta = {
  title: 'UIKit/MacTextInput',
  component: MacTextInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    type: { control: 'text' },
  },
} satisfies Meta<typeof MacTextInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState('');
    return (
      <MacTextInput
        {...args}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    );
  },
  args: {
    placeholder: 'Type something...',
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
  },
};
