import { render, screen, fireEvent } from '@testing-library/react';
import { expect, test, describe, vi, beforeEach } from 'vitest';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockReturnValue({ matches: false }),
});

const hoisted = vi.hoisted(() => {
  function makeStoreMock(state: Record<string, unknown>) {
    const hook = (selector: (s: Record<string, unknown>) => unknown) => selector(state);
    hook.getState = () => state;
    return hook;
  }

  const motionMock = {
    motion: {
      div: ({ children, ...divProps }: Record<string, unknown>) => {
        return <div {...divProps}>{children as React.ReactNode}</div>;
      },
    },
  };

  const mockGetChildItems = vi.fn(() => []);

  const fsState = {
    items: {
      root: {
        id: 'root',
        type: 'folder',
        name: 'Desktop',
        children: [] as string[],
        position: { x: 0, y: 0 },
      },
    } as Record<string, unknown>,
    activeItemId: null as string | null,
    setActive: vi.fn(),
    removeActive: vi.fn(),
    cleanUpChildren: vi.fn(),
    resetLayout: vi.fn(),
    upsertSavedIconItem: vi.fn(),
  };

  const wmState = {
    windows: {},
    windowIds: [],
    focusedWindowId: undefined,
    windowHistory: {},
    openFileIds: {},
    openWindow: vi.fn(),
    closeWindow: vi.fn(),
    focusWindow: vi.fn(),
    closeAllWindows: vi.fn(),
    resetWindows: vi.fn(),
    closeFocusedWindow: vi.fn(),
    moveWindow: vi.fn(),
    unfocusAll: vi.fn(),
    updateWindowBounds: vi.fn(),
  };

  const openWinAnimated = vi.fn();
  const closeWinAnimated = vi.fn();
  const recClick = vi.fn();
  const recOpen = vi.fn();

  return { motionMock, makeStoreMock, mockGetChildItems, fsState, wmState, openWinAnimated, closeWinAnimated, recClick, recOpen };
});

vi.mock('framer-motion', () => hoisted.motionMock);

vi.mock('../../store/useWindowManager', () => ({
  useWindowManager: hoisted.makeStoreMock(hoisted.wmState),
}));

vi.mock('../../store/useFileSystem', () => {
  const hook = (selector: (s: Record<string, unknown>) => unknown) => selector(hoisted.fsState);
  return {
    useFileSystem: Object.assign(hook, { getState: () => hoisted.fsState }),
    getChildItems: hoisted.mockGetChildItems,
    getState: () => hoisted.fsState,
  };
});

vi.mock('../WindowOpenAnimation', () => ({
  WindowOpenAnimationProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="animation-provider">{children}</div>
  ),
  useWindowOpenAnimation: () => ({
    openWindowAnimated: hoisted.openWinAnimated,
    closeWindowAnimated: hoisted.closeWinAnimated,
  }),
}));

vi.mock('../../features/easter-eggs/EasterEggProvider', () => ({
  EasterEggProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="easter-egg-provider">{children}</div>
  ),
}));

vi.mock('../../features/easter-eggs/EasterEggContext', () => ({
  useEasterEggs: () => ({
    canRevealLastDisk: false,
    isShiftHeld: false,
    recordDesktopBackgroundClick: hoisted.recClick,
    recordItemOpenRequest: hoisted.recOpen,
    recordTrashClick: vi.fn(),
    revealLastDiskFromSpecial: vi.fn(),
    runSpecialAction: vi.fn(),
  }),
}));

vi.mock('../../features/easter-eggs/useEasterEggProgress', () => ({
  useEasterEggProgress: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ markFound: vi.fn(), found: {}, foundEggIds: [] }),
}));

import { Desktop } from './Desktop';

function renderDesktop() {
  return render(<Desktop />);
}

describe('Desktop', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hoisted.fsState.activeItemId = null;
    hoisted.fsState.items = {
      root: {
        id: 'root',
        type: 'folder',
        name: 'Desktop',
        children: [],
        position: { x: 0, y: 0 },
      },
    };
    hoisted.wmState.windowIds = [];
    hoisted.wmState.focusedWindowId = undefined;
  });

  test('renders without crashing', () => {
    const { container } = renderDesktop();
    expect(container.firstChild).toBeInTheDocument();
  });

  test('renders Topbar', () => {
    renderDesktop();
    expect(screen.getByText('¤')).toBeInTheDocument();
    expect(screen.getByText('File')).toBeInTheDocument();
  });

  test('background click removes active and unfocuses', () => {
    const { container } = renderDesktop();
    const desktopEl = container.firstChild!.firstChild!.firstChild;
    fireEvent.click(desktopEl!);
    expect(hoisted.recClick).toHaveBeenCalled();
    expect(hoisted.fsState.removeActive).toHaveBeenCalled();
    expect(hoisted.wmState.unfocusAll).toHaveBeenCalled();
  });

  test('Escape key removes active and unfocuses', () => {
    renderDesktop();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(hoisted.fsState.removeActive).toHaveBeenCalled();
    expect(hoisted.wmState.unfocusAll).toHaveBeenCalled();
  });

  test('Enter key opens folder item', () => {
    hoisted.fsState.activeItemId = 'folder1';
    hoisted.fsState.items = {
      root: hoisted.fsState.items.root,
      folder1: { id: 'folder1', type: 'folder', name: 'Folder 1', parentId: 'root', position: { x: 0, y: 0 }, children: [] },
    };
    renderDesktop();
    fireEvent.keyDown(document, { key: 'Enter' });
    expect(hoisted.recOpen).toHaveBeenCalledWith('folder1');
  });

  test('Enter key with trash item sets active', () => {
    hoisted.fsState.activeItemId = 'trash';
    hoisted.fsState.items = {
      root: hoisted.fsState.items.root,
      trash: { id: 'trash', type: 'folder', name: 'Trash', parentId: 'root', position: { x: 0, y: 0 }, children: [] },
    };
    renderDesktop();
    fireEvent.keyDown(document, { key: 'Enter' });
    expect(hoisted.fsState.setActive).toHaveBeenCalledWith('trash');
  });

  test('Enter key without active item does nothing', () => {
    renderDesktop();
    fireEvent.keyDown(document, { key: 'Enter' });
    expect(hoisted.recOpen).not.toHaveBeenCalled();
    expect(hoisted.fsState.setActive).not.toHaveBeenCalled();
  });


});
