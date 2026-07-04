import { render, screen, fireEvent } from '@testing-library/react';
import { expect, test, describe, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => {
  const getAssetPath = vi.fn((path: string) => `/base/${path}`);
  return { getAssetPath };
});

vi.mock('../../utils/assets', () => ({
  getAssetPath: mocks.getAssetPath,
}));

vi.mock('./visualizers', () => ({
  drawPixelBars: vi.fn(),
  drawPixelCircle: vi.fn(),
  drawPixelWaveform: vi.fn(),
}));

import { AudioPlayer } from './AudioPlayer';

function renderPlayer(fileUrl?: string) {
  return render(<AudioPlayer windowId="test-win" fileUrl={fileUrl} />);
}

describe('AudioPlayer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders welcome screen when no file provided', () => {
    renderPlayer();
    expect(screen.getByText('Audio Player')).toBeInTheDocument();
    expect(
      screen.getByText('Load an MP3, OGG, or WAV file to start'),
    ).toBeInTheDocument();
    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  test('renders initialized player when fileUrl is provided', () => {
    renderPlayer('track.mp3');
    expect(mocks.getAssetPath).toHaveBeenCalledWith('track.mp3');
    expect(screen.getByText('Play')).toBeInTheDocument();
    expect(screen.getByText('Stop')).toBeInTheDocument();
    expect(screen.getByText('Loop')).toBeInTheDocument();
  });

  test('shows track name from fileUrl', () => {
    renderPlayer('track.mp3');
    expect(screen.getByText('track.mp3')).toBeInTheDocument();
  });

  test('shows visualizer mode selector', () => {
    renderPlayer('track.mp3');
    expect(screen.getByText('Mode:')).toBeInTheDocument();
    expect(screen.getByText('Pixel Bars')).toBeInTheDocument();
  });

  test('shows volume slider', () => {
    renderPlayer('track.mp3');
    const volumeSlider = screen.getByLabelText('Volume');
    expect(volumeSlider).toBeInTheDocument();
  });

  test('shows seek slider', () => {
    renderPlayer('track.mp3');
    const seekSlider = screen.getByLabelText('Seek');
    expect(seekSlider).toBeInTheDocument();
  });

  test('renders additional Open button in initialized state', () => {
    renderPlayer('track.mp3');
    const openButtons = screen.getAllByText('Open');
    expect(openButtons.length).toBeGreaterThanOrEqual(1);
  });
});
