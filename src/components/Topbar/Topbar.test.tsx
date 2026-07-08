import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, describe, vi, beforeEach } from 'vitest';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockReturnValue({ matches: false }),
});

const mockOpenWindow = vi.fn();
const mockCloseAllWindows = vi.fn();
const mockResetWindows = vi.fn();
const mockFocusWindow = vi.fn();
const mockCloseWindow = vi.fn();
const mockSetActive = vi.fn();
const mockCleanUpChildren = vi.fn();
const mockResetLayout = vi.fn();
const mockRemoveActive = vi.fn();
const mockCloseWindowAnimated = vi.fn();
const mockMarkFound = vi.fn();
const mockRunSpecialAction = vi.fn();

vi.mock('../../store/useWindowManager', () => ({
  useWindowManager: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      focusedWindowId: undefined,
      windows: {},
      windowIds: [],
      openFileIds: {},
      windowHistory: {},
      openWindow: mockOpenWindow,
      closeAllWindows: mockCloseAllWindows,
      resetWindows: mockResetWindows,
      focusWindow: mockFocusWindow,
      closeWindow: mockCloseWindow,
      closeFocusedWindow: vi.fn(),
      moveWindow: vi.fn(),
      unfocusAll: vi.fn(),
      updateWindowBounds: vi.fn(),
    }),
}));

vi.mock('../../store/useFileSystem', () => ({
  useFileSystem: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      items: {},
      setActive: mockSetActive,
      cleanUpChildren: mockCleanUpChildren,
      resetLayout: mockResetLayout,
      removeActive: mockRemoveActive,
      upsertSavedIconItem: vi.fn(),
    }),
}));

vi.mock('../WindowOpenAnimation', () => ({
  useWindowOpenAnimation: () => ({
    openWindowAnimated: vi.fn(),
    closeWindowAnimated: mockCloseWindowAnimated,
  }),
}));

vi.mock('../../features/easter-eggs/EasterEggContext', () => ({
  useEasterEggs: () => ({
    canRevealLastDisk: false,
    isShiftHeld: false,
    revealLastDiskFromSpecial: vi.fn(),
    runSpecialAction: mockRunSpecialAction,
  }),
}));

vi.mock('../../features/easter-eggs/useEasterEggProgress', () => ({
  useEasterEggProgress: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({ markFound: mockMarkFound, found: {} }),
}));

vi.mock('../../utils/uiScale', () => ({
  getUiScale: () => 1,
  isDesktopUiScale: () => true,
  isTabletUiScale: () => false,
  isMobileUiScale: () => false,
  scaleUiValue: (v: number) => v,
  scaleUiSize: (s: { width: number; height: number }) => s,
}));

import { useMenuStore } from '../../store/useMenuStore';
import { Topbar } from './Topbar';

describe('Topbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useMenuStore.setState({
      fileMenuOverrides: null,
      editMenuOverrides: [{ title: 'Undo', action: vi.fn() }],
      customTabs: [],
    });
  });

  test('renders all main tabs', () => {
    render(<Topbar />);
    expect(screen.getByText('¤')).toBeInTheDocument();
    expect(screen.getByText('File')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Special')).toBeInTheDocument();
  });

  test('renders clock', () => {
    render(<Topbar />);
    const clockPattern = /^\d{1,2}:\d{2}\s?(AM|PM)?$/i;
    const clockElements = screen.getAllByText(clockPattern);
    expect(clockElements.length).toBeGreaterThanOrEqual(1);
  });
});
