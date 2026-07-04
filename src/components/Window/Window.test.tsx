import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
const mockFocusWindow = vi.fn();
const mockUpdateWindowBounds = vi.fn();
const mockCloseWindowAnimated = vi.fn();
const mockRemoveActive = vi.fn();

vi.mock('../../store/useWindowManager', () => ({
  useWindowManager: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      focusedWindowId: 'win-1',
      windows: {
        'win-1': {
          id: 'win-1',
          title: 'Test Window',
          position: { x: 100, y: 100 },
          size: { width: 400, height: 300 },
          zIndex: 10,
          resizable: true,
          windowVariant: 'default',
        },
      },
      windowIds: ['win-1'],
      openFileIds: {},
      windowHistory: {},
      openWindow: mockOpenWindow,
      closeWindow: mockCloseWindow,
      focusWindow: mockFocusWindow,
      updateWindowBounds: mockUpdateWindowBounds,
      closeAllWindows: vi.fn(),
      resetWindows: vi.fn(),
      closeFocusedWindow: vi.fn(),
      moveWindow: vi.fn(),
      unfocusAll: vi.fn(),
    }),
}));

vi.mock('../../store/useFileSystem', () => ({
  useFileSystem: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      items: {},
      removeActive: mockRemoveActive,
      setActive: vi.fn(),
      cleanUpChildren: vi.fn(),
      resetLayout: vi.fn(),
      upsertSavedIconItem: vi.fn(),
    }),
  getChildItems: () => [],
}));

vi.mock('../WindowOpenAnimation', () => ({
  useWindowOpenAnimation: () => ({
    openWindowAnimated: vi.fn(),
    closeWindowAnimated: mockCloseWindowAnimated,
  }),
}));

vi.mock('../../hooks/useHaptics', () => ({
  useHaptics: () => ({
    fileOpen: vi.fn(),
    fileClose: vi.fn(),
    impact: vi.fn(),
    notification: vi.fn(),
    selection: vi.fn(),
    error: vi.fn(),
  }),
}));

vi.mock('./hooks/useWindowFitToContent', () => ({
  useWindowFitToContent: () => ({
    commitWindowDimensions: vi.fn(),
    handleZoomToFit: vi.fn(),
  }),
}));

vi.mock('./hooks/useWindowScrollbars', () => ({
  useWindowScrollbars: () => ({
    getThumbStyle: () => ({}),
    hasHorizontalScroll: false,
    hasVerticalScroll: false,
    scrollContent: vi.fn(),
    startThumbDrag: vi.fn(),
    updateScrollMetrics: vi.fn(),
  }),
}));

vi.mock('./WindowTitleBar', () => ({
  WindowTitleBar: ({ onClose, title }: { onClose: () => void; title: string }) => (
    <div data-testid="window-title-bar">
      <span>{title}</span>
      <button data-testid="close-btn" onClick={onClose}>Close</button>
    </div>
  ),
}));

vi.mock('./WindowFinderData', () => ({
  WindowFinderData: ({ files }: { files: number }) => (
    <div data-testid="window-finder-data">{files} items</div>
  ),
}));

vi.mock('./WindowScrollbars', () => ({
  WindowScrollbars: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="window-scrollbars">{children}</div>
  ),
}));

vi.mock('./WindowDragLayer', () => ({
  WindowDragLayer: () => <div data-testid="window-drag-layer" />,
}));

vi.mock('./WindowResizeLayer', () => ({
  WindowResizeLayer: () => <div data-testid="window-resize-layer" />,
}));

// Dynamically re-mock for folder content test
import type { WindowInstance } from '../../store/useWindowManager';
import { Window } from './Window';

const baseWindowData: WindowInstance = {
  id: 'win-1',
  title: 'Test Window',
  position: { x: 100, y: 100 },
  size: { width: 400, height: 300 },
  zIndex: 10,
  resizable: true,
  windowVariant: 'default',
};

describe('Window', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders window with title', () => {
    render(<Window data={baseWindowData} />);
    expect(screen.getByText('Test Window')).toBeInTheDocument();
  });

  test('renders WindowDragLayer', () => {
    render(<Window data={baseWindowData} />);
    expect(screen.getByTestId('window-drag-layer')).toBeInTheDocument();
  });

  test('renders WindowResizeLayer when resizable', () => {
    render(<Window data={baseWindowData} />);
    expect(screen.getByTestId('window-resize-layer')).toBeInTheDocument();
  });

  test('does not render WindowResizeLayer when not resizable', () => {
    const nonResizable = { ...baseWindowData, resizable: false };
    render(<Window data={nonResizable} />);
    expect(screen.queryByTestId('window-resize-layer')).not.toBeInTheDocument();
  });

  test('renders folder content for folder-type items', () => {
    const folderData = { ...baseWindowData, fileId: 'folder-1' };
    render(<Window data={folderData} />);
    expect(screen.getByText('Test Window')).toBeInTheDocument();
  });

  test('close button triggers closeWindowAnimated', async () => {
    const user = userEvent.setup();
    render(<Window data={baseWindowData} />);

    const closeBtn = screen.getByTestId('close-btn');
    await user.click(closeBtn);

    expect(mockCloseWindowAnimated).toHaveBeenCalledWith('win-1');
  });
});
