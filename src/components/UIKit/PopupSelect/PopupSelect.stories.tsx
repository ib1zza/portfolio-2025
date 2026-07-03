import type { Meta, StoryObj } from '@storybook/react-vite';
import { PopupSelect } from './PopupSelect';
import { useState } from 'react';

const meta = {
  title: 'UIKit/PopupSelect',
  component: PopupSelect,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof PopupSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

const options = [
  { value: 'option1', label: 'First Option' },
  { value: 'option2', label: 'Second Option' },
  { value: 'option3', label: 'Third Option' },
];

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState('option1');
    return (
      <div style={{ height: '200px' }}>
        <PopupSelect
          {...args}
          value={value}
          options={options}
          onChange={setValue}
        />
      </div>
    );
  },
  args: {
    label: 'Select Option:',
    options: options,
    value: 'option1',
    onChange: () => {},
  },
};
