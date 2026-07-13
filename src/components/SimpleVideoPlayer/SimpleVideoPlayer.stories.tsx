import type { Meta, StoryObj } from '@storybook/react-vite';
import { SimpleVideoPlayer } from './SimpleVideoPlayer';

const meta = {
  title: 'Components/SimpleVideoPlayer',
  component: SimpleVideoPlayer,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '480px', padding: '20px', backgroundColor: '#e5e5e5', border: '2px solid #000', boxShadow: '4px 4px 0 #000' }}>
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof SimpleVideoPlayer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    windowId: 'simple-video-player-storybook',
  },
};

export const WithVideoFile: Story = {
  args: {
    windowId: 'simple-video-player-with-video',
    fileUrl: 'media/video/cliff.mp4',
  },
};
