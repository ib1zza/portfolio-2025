import type { Meta, StoryObj } from '@storybook/react-vite';
import { Folder } from './Folder';
import { useRef } from 'react';

const FolderWrapper = (props: React.ComponentProps<typeof Folder>) => {
  const containerRef = useRef<HTMLDivElement>(null);
  return (
    <div ref={containerRef} style={{ width: '300px', height: '200px', position: 'relative', border: '2px dashed #000', backgroundColor: '#e5e5e5' }}>
      <Folder {...props} constraintRef={containerRef} />
    </div>
  );
};

const meta = {
  title: 'Components/Folder',
  component: Folder,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Folder>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <FolderWrapper {...args} />,
  args: {
    id: 'folder-storybook-id',
    name: 'My Folder',
    position: { x: 80, y: 40 },
    icon: 'folder',
  },
};

export const DocumentFile: Story = {
  render: (args) => <FolderWrapper {...args} />,
  args: {
    id: 'document-storybook-id',
    name: 'Readme.txt',
    position: { x: 80, y: 40 },
    icon: 'file',
  },
};
