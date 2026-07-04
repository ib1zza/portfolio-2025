import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, describe, vi, beforeEach } from 'vitest';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockReturnValue({ matches: false }),
});

const imageMock = {
  complete: true,
  naturalWidth: 16,
  naturalHeight: 12,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  src: '',
};

HTMLImageElement.prototype.addEventListener = imageMock.addEventListener;
HTMLImageElement.prototype.removeEventListener = imageMock.removeEventListener;

Object.defineProperty(HTMLImageElement.prototype, 'src', {
  set(src: string) { /* noop */ },
  configurable: true,
});

const getContextMock = () => ({
  fillStyle: '',
  fillRect: vi.fn(),
  drawImage: vi.fn(),
  clearRect: vi.fn(),
  imageSmoothingEnabled: false,
});

HTMLCanvasElement.prototype.getContext = vi.fn(() => getContextMock()) as never;

import { SpaceInvaders } from './SpaceInvaders';

describe('SpaceInvaders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders without crashing', () => {
    const { container } = render(<SpaceInvaders windowId="test-win" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  test('renders canvas element', () => {
    const { container } = render(<SpaceInvaders windowId="test-win" />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  test('shows menu state initially', () => {
    render(<SpaceInvaders windowId="test-win" />);
    expect(screen.getByText('SPACE INVADERS')).toBeInTheDocument();
  });

  test('shows start instruction', () => {
    render(<SpaceInvaders windowId="test-win" />);
    expect(screen.getByText(/Press ENTER to start/i)).toBeInTheDocument();
  });

  test('has correct canvas dimensions', () => {
    const { container } = render(<SpaceInvaders windowId="test-win" />);
    const canvas = container.querySelector('canvas')!;
    expect(canvas).toHaveAttribute('width', '320');
    expect(canvas).toHaveAttribute('height', '280');
  });
});
