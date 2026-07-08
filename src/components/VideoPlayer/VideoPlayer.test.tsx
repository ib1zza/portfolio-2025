import { render, screen } from '@testing-library/react';
import { expect, test, describe, vi, beforeEach } from 'vitest';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockReturnValue({ matches: false }),
});

class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
vi.stubGlobal('ResizeObserver', ResizeObserverMock);

vi.mock('ditherwave', () => ({
  useDither: vi.fn(),
}));

vi.mock('../../utils/assets', () => ({
  getAssetPath: (path: string) => path,
}));

Object.defineProperty(HTMLMediaElement.prototype, 'load', {
  value: vi.fn(),
  writable: true,
});
Object.defineProperty(HTMLMediaElement.prototype, 'play', {
  value: vi.fn(() => Promise.resolve()),
  writable: true,
});
Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
  value: vi.fn(),
  writable: true,
});

Object.defineProperty(window, 'URL', {
  value: { createObjectURL: vi.fn(() => 'blob:test'), revokeObjectURL: vi.fn() },
  writable: true,
  configurable: true,
});

import { VideoPlayer } from './VideoPlayer';

describe('VideoPlayer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders without crashing', () => {
    render(<VideoPlayer windowId="test-win" />);
    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  test('shows welcome overlay when not initialized', () => {
    render(<VideoPlayer windowId="test-win" />);
    expect(screen.getByText('Load an MP4 or WebM file to start')).toBeInTheDocument();
  });

  test('renders Open button in welcome overlay', () => {
    render(<VideoPlayer windowId="test-win" />);
    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  test('renders canvas element', () => {
    const { container } = render(<VideoPlayer windowId="test-win" />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  test('renders video element', () => {
    const { container } = render(<VideoPlayer windowId="test-win" />);
    const videos = container.querySelectorAll('video');
    expect(videos.length).toBeGreaterThanOrEqual(1);
  });

  test('renders hidden file input', () => {
    const { container } = render(<VideoPlayer windowId="test-win" />);
    const input = container.querySelector('input[type="file"]');
    expect(input).toBeInTheDocument();
  });

  test('does not show controls when not initialized', () => {
    render(<VideoPlayer windowId="test-win" />);
    expect(screen.queryByText('Play')).not.toBeInTheDocument();
    expect(screen.queryByText('Stop')).not.toBeInTheDocument();
    expect(screen.queryByText('Loop')).not.toBeInTheDocument();
    expect(screen.queryByText('Invert')).not.toBeInTheDocument();
    expect(screen.queryByText('Original')).not.toBeInTheDocument();
  });
});
