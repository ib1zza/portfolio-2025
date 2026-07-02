import type { Meta, StoryObj } from '@storybook/react';
import { MacSlider } from './MacSlider';
import { useState } from 'react';

const meta = {
  title: 'UIKit/MacSlider',
  component: MacSlider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100 } },
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
  },
} satisfies Meta<typeof MacSlider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState(args.value || 50);
    return (
      <div style={{ width: '300px' }}>
        <MacSlider {...args} value={value} onChange={setValue} />
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>Value: {value}</div>
      </div>
    );
  },
  args: {
    value: 50,
    min: 0,
    max: 100,
    step: 1,
    orientation: 'horizontal',
  },
};

export const Vertical: Story = {
  render: (args) => {
    const [value, setValue] = useState(args.value || 50);
    return (
      <div style={{ height: '300px', display: 'flex', gap: '2rem' }}>
        <MacSlider {...args} value={value} onChange={setValue} />
        <div>Value: {value}</div>
      </div>
    );
  },
  args: {
    value: 50,
    min: 0,
    max: 100,
    step: 1,
    orientation: 'vertical',
  },
};

export const Stepped: Story = {
  render: (args) => {
    const [value, setValue] = useState(args.value || 0);
    return (
      <div style={{ width: '300px' }}>
        <MacSlider {...args} value={value} onChange={setValue} />
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>Value: {value}</div>
      </div>
    );
  },
  args: {
    value: 0,
    min: 0,
    max: 100,
    step: 25,
    orientation: 'horizontal',
  },
};
