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

vi.mock('../../hooks/useThreeDither', () => ({
  useThreeDither: vi.fn(),
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

import { SimpleVideoPlayer } from './SimpleVideoPlayer';

describe('SimpleVideoPlayer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders without crashing', () => {
    render(<SimpleVideoPlayer windowId="test-win" />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('renders hidden canvas initially', () => {
    const { container } = render(<SimpleVideoPlayer windowId="test-win" />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  test('renders video element', () => {
    const { container } = render(<SimpleVideoPlayer windowId="test-win" />);
    const video = container.querySelector('video');
    expect(video).toBeInTheDocument();
  });

  test('shows loading overlay when not loaded', () => {
    render(<SimpleVideoPlayer windowId="test-win" />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('does not show controls when not loaded', () => {
    render(<SimpleVideoPlayer windowId="test-win" />);
    expect(screen.queryByText('Play')).not.toBeInTheDocument();
    expect(screen.queryByText('Stop')).not.toBeInTheDocument();
    expect(screen.queryByText('Loop')).not.toBeInTheDocument();
  });
});
