import type { Meta, StoryObj } from '@storybook/react-vite';
import { VideoPlayer } from './VideoPlayer';

const meta = {
  title: 'Components/VideoPlayer',
  component: VideoPlayer,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '520px', padding: '20px', backgroundColor: '#e5e5e5', border: '2px solid #000', boxShadow: '4px 4px 0 #000' }}>
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof VideoPlayer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultNoFile: Story = {
  args: {
    windowId: 'video-player-no-file',
  },
};

export const WithVideoFile: Story = {
  args: {
    windowId: 'video-player-with-video',
    fileUrl: 'media/video/cliff.mp4',
  },
};
