import type { Meta, StoryObj } from '@storybook/react-vite';
import { CustomCursor } from './CustomCursor';
import { CursorProvider } from '../../contexts/CursorContext';
import { useCursor } from '../../contexts/cursor';

// Helper component to trigger/test cursor states in Storybook
const CursorDemo = () => {
  const { setCursor } = useCursor();
  return (
    <div style={{ padding: '20px', border: '2px solid #000', boxShadow: '4px 4px 0 #000', backgroundColor: '#fff', textAlign: 'center' }}>
      <h3 style={{ margin: '0 0 10px 0', fontFamily: 'monospace' }}>Custom Cursor Demo</h3>
      <p style={{ fontSize: '12px', margin: '0 0 15px 0' }}>
        Move mouse inside this frame to see the vintage cursor.
      </p>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button 
          style={{ padding: '6px 12px', border: '2px solid #000', backgroundColor: '#e5e5e5', cursor: 'pointer', fontFamily: 'monospace' }}
          onClick={() => setCursor('arrow')}
        >
          Arrow (Default)
        </button>
        <button 
          style={{ padding: '6px 12px', border: '2px solid #000', backgroundColor: '#e5e5e5', cursor: 'pointer', fontFamily: 'monospace' }}
          onClick={() => setCursor('watch')}
        >
          Watch (Busy)
        </button>
      </div>
      <CustomCursor />
    </div>
  );
};

const meta = {
  title: 'Components/CustomCursor',
  component: CustomCursor,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <CursorProvider>
        <div style={{ width: '400px', minHeight: '150px' }}>
          <Story />
        </div>
      </CursorProvider>
    )
  ]
} satisfies Meta<typeof CustomCursor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <CursorDemo />,
};
