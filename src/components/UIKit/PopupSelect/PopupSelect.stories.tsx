import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from '@storybook/test';
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const selectButton = canvas.getByRole('button', { name: /First Option/i });
    
    // Open select dropdown
    await userEvent.click(selectButton);
    
    // Find dropdown menu options
    const option2 = canvas.getByRole('option', { name: /Second Option/i });
    await userEvent.click(option2);
    
    // Verify value changed on trigger
    await expect(canvas.getByRole('button')).toHaveTextContent('Second Option');
  },
};
