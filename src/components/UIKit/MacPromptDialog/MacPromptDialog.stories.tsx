import type { Meta, StoryObj } from '@storybook/react';
import { MacPromptDialog } from './MacPromptDialog';
import { fn } from '@storybook/test';

const meta = {
  title: 'UIKit/MacPromptDialog',
  component: MacPromptDialog,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MacPromptDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    initialValue: 'My Document',
    label: 'Save as',
    title: 'Save File',
    onCancel: fn(),
    onConfirm: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', width: '100%', height: '500px', backgroundColor: '#e5e5e5' }}>
        <Story />
      </div>
    ),
  ],
};

export const EmptyInitialValue: Story = {
  args: {
    initialValue: '',
    label: 'Folder name',
    title: 'New Folder',
    onCancel: fn(),
    onConfirm: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', width: '100%', height: '500px', backgroundColor: '#e5e5e5' }}>
        <Story />
      </div>
    ),
  ],
};
