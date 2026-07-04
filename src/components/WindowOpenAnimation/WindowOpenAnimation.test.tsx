import { render, screen, act } from '@testing-library/react';
import { expect, test, describe, vi, beforeEach } from 'vitest';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockReturnValue({ matches: false }),
});

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: Record<string, unknown>) => {
      const { initial, animate, transition, exit, ...divProps } = props;
      return <div {...divProps}>{children as React.ReactNode}</div>;
    },
  },
}));

const mockOpenWindow = vi.fn();
const mockCloseWindow = vi.fn();
const storeState: Record<string, unknown> = {
  windows: {},
  windowIds: [],
  focusedWindowId: undefined,
  windowHistory: {},
  openFileIds: {},
  openWindow: mockOpenWindow,
  closeWindow: mockCloseWindow,
  focusWindow: vi.fn(),
  closeAllWindows: vi.fn(),
  resetWindows: vi.fn(),
};

function makeStoreMock() {
  const hook = (selector: (state: Record<string, unknown>) => unknown) =>
    selector(storeState);
  hook.getState = () => storeState;
  return hook;
}

vi.mock('../../store/useWindowManager', () => ({
  useWindowManager: makeStoreMock(),
}));

vi.mock('../../constants/windowLayout', () => ({
  getDefaultWindowPosition: () => ({ x: 50, y: 50 }),
  getDefaultWindowSize: () => ({ width: 600, height: 400 }),
  getWindowOpenStartWidth: () => 40,
  getWindowTargetBounds: (pos: { x: number; y: number }, size: { width: number; height: number }) => ({
    x: pos.x,
    y: pos.y,
    width: size.width,
    height: size.height,
  }),
  getTopbarHeight: () => 30,
  getAppWindowSize: () => ({ width: 800, height: 600 }),
  getWindowMinSize: () => ({ width: 200, height: 100 }),
}));

const mockStartCursorOverride = vi.fn(() => vi.fn());

vi.mock('../../contexts/cursor', () => ({
  CursorContext: { Provider: ({ children }: { children: React.ReactNode }) => children },
  useCursor: () => ({
    cursor: 'default',
    startCursorOverride: mockStartCursorOverride,
    setCursor: vi.fn(),
    resetCursor: vi.fn(),
  }),
}));

import { WindowOpenAnimationProvider } from './WindowOpenAnimation';
import { useWindowOpenAnimation } from './WindowOpenAnimationContext';

function TestConsumer() {
  const { openWindowAnimated } = useWindowOpenAnimation();
  return (
    <button
      data-testid="open-btn"
      onClick={() =>
        openWindowAnimated({
          id: 'test-win',
          title: 'Test',
          sourceRect: new DOMRect(0, 0, 100, 100),
        })
      }
    >
      Open Window
    </button>
  );
}

function TestCloseConsumer() {
  const { closeWindowAnimated } = useWindowOpenAnimation();
  return (
    <button data-testid="close-btn" onClick={() => closeWindowAnimated('test-win')}>
      Close Window
    </button>
  );
}

describe('WindowOpenAnimationProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    storeState.windows = {};
    storeState.windowIds = [];
    storeState.focusedWindowId = undefined;
    storeState.windowHistory = {};
    storeState.openFileIds = {};
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('renders children', () => {
    render(
      <WindowOpenAnimationProvider>
        <div data-testid="child">Child</div>
      </WindowOpenAnimationProvider>,
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  test('provides context to consumers', () => {
    render(
      <WindowOpenAnimationProvider>
        <TestConsumer />
      </WindowOpenAnimationProvider>,
    );
    expect(screen.getByTestId('open-btn')).toBeInTheDocument();
  });

  test('openWindowAnimated creates animation and opens window after timeout', async () => {
    render(
      <WindowOpenAnimationProvider>
        <TestConsumer />
      </WindowOpenAnimationProvider>,
    );

    const btn = screen.getByTestId('open-btn');
    await act(async () => {
      btn.click();
    });

    expect(mockStartCursorOverride).toHaveBeenCalledWith('watch');

    await act(async () => {
      vi.runAllTimers();
    });

    expect(mockOpenWindow).toHaveBeenCalledWith(
      'test-win',
      'Test',
      null,
      { x: 50, y: 50 },
      undefined,
      undefined,
      undefined,
    );
  });

  test('closeWindowAnimated is callable', async () => {
    storeState.windows = {
      'test-win': {
        id: 'test-win',
        fileId: 'file-1',
        position: { x: 0, y: 0 },
        size: { width: 200, height: 200 },
        title: 'Test',
        zIndex: 1,
        resizable: true,
        windowVariant: 'default',
      },
    };

    render(
      <WindowOpenAnimationProvider>
        <TestCloseConsumer />
      </WindowOpenAnimationProvider>,
    );

    const btn = screen.getByTestId('close-btn');
    await act(async () => {
      btn.click();
    });

    expect(mockCloseWindow).toHaveBeenCalledWith('test-win');
  });

  test('openWindowAnimated uses window history when available', async () => {
    storeState.windowHistory = {
      'test-win': { position: { x: 200, y: 300 }, size: { width: 500, height: 400 } },
    };

    render(
      <WindowOpenAnimationProvider>
        <TestConsumer />
      </WindowOpenAnimationProvider>,
    );

    const btn = screen.getByTestId('open-btn');
    await act(async () => {
      btn.click();
    });

    await act(async () => {
      vi.runAllTimers();
    });

    expect(mockOpenWindow).toHaveBeenCalled();
  });
});
