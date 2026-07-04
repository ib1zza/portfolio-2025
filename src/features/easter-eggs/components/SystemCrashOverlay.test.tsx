import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, describe, vi, beforeEach } from 'vitest';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockReturnValue({ matches: false }),
});

vi.mock('../../../utils/assets', () => ({
  getAssetPath: (path: string) => path,
}));

import { SystemCrashOverlay } from './SystemCrashOverlay';

describe('SystemCrashOverlay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('renders without crashing', () => {
    render(<SystemCrashOverlay onDismiss={vi.fn()} />);
    expect(document.querySelector('[aria-live="assertive"]')).toBeInTheDocument();
  });

  test('shows bomb icon initially', () => {
    render(<SystemCrashOverlay onDismiss={vi.fn()} />);
    const bombSvg = document.querySelector('svg');
    expect(bombSvg).toBeInTheDocument();
  });

  test('shows sad mac after timeout', () => {
    render(<SystemCrashOverlay onDismiss={vi.fn()} />);

    act(() => {
      vi.advanceTimersByTime(1100);
    });

    const errorCode = screen.getByLabelText('Error code 00000539 000007D5');
    expect(errorCode).toBeInTheDocument();
  });

  test('shows sad mac icon after timeout', () => {
    render(<SystemCrashOverlay onDismiss={vi.fn()} />);

    act(() => {
      vi.advanceTimersByTime(1100);
    });

    const img = document.querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'icons/sad_mac.svg');
  });

  test('does not dismiss before unlock timer', () => {
    const onDismiss = vi.fn();
    render(<SystemCrashOverlay onDismiss={onDismiss} />);

    act(() => {
      vi.advanceTimersByTime(500);
    });

    const overlay = document.querySelector('[aria-live="assertive"]')!;
    overlay.click();

    expect(onDismiss).not.toHaveBeenCalled();
  });
});
