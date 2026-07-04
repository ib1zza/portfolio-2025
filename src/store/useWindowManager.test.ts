import { describe, it, expect, vi, beforeEach } from 'vitest';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock, configurable: true });

import { useWindowManager } from './useWindowManager';
import type { Position } from './useFileSystem';

const initialStoreState = {
  windows: {},
  windowIds: [],
  openFileIds: {},
  windowHistory: {},
  focusedWindowId: undefined,
};

describe('useWindowManager', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    useWindowManager.setState(initialStoreState);
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockReturnValue({ matches: false }),
    });
  });

  it('starts with no windows', () => {
    const state = useWindowManager.getState();
    expect(state.windows).toEqual({});
    expect(state.windowIds).toEqual([]);
    expect(state.focusedWindowId).toBeUndefined();
  });

  it('openWindow adds a window and focuses it', () => {
    const { openWindow } = useWindowManager.getState();
    openWindow('win1', 'Test Window');

    const state = useWindowManager.getState();
    expect(state.windows['win1']).toBeDefined();
    expect(state.windows['win1'].title).toBe('Test Window');
    expect(state.windowIds).toContain('win1');
    expect(state.focusedWindowId).toBe('win1');
  });

  it('openWindow does not duplicate windowIds', () => {
    const { openWindow } = useWindowManager.getState();
    openWindow('win1', 'Window');
    openWindow('win1', 'Window');

    const state = useWindowManager.getState();
    expect(state.windowIds.filter((id) => id === 'win1').length).toBe(1);
  });

  it('openWindow uses provided position and size', () => {
    const position = { x: 100, y: 200 };
    const size = { width: 500, height: 400 };
    const { openWindow } = useWindowManager.getState();

    openWindow('win1', 'Test', null, position, size);

    const win = useWindowManager.getState().windows['win1'];
    expect(win.position).toEqual(position);
    expect(win.size).toEqual(size);
  });

  it('focusWindow updates focusedWindowId', () => {
    const { openWindow, focusWindow } = useWindowManager.getState();
    openWindow('win1', 'Window 1');
    openWindow('win2', 'Window 2');

    focusWindow('win1');
    expect(useWindowManager.getState().focusedWindowId).toBe('win1');
  });

  it('focusWindow is no-op when already focused', () => {
    const { openWindow, focusWindow } = useWindowManager.getState();
    openWindow('win1', 'Window 1');

    const stateBefore = useWindowManager.getState();
    focusWindow('win1');
    const stateAfter = useWindowManager.getState();

    expect(stateAfter).toBe(stateBefore);
  });

  it('moveWindow updates window position and history', () => {
    const { openWindow, moveWindow } = useWindowManager.getState();
    openWindow('win1', 'Window');
    const newPos: Position = { x: 300, y: 400 };

    moveWindow('win1', newPos);

    const state = useWindowManager.getState();
    expect(state.windows['win1'].position).toEqual(newPos);
    expect(state.windowHistory['win1']?.position).toEqual(newPos);
  });

  it('moveWindow is no-op when position is unchanged', () => {
    const { openWindow, moveWindow } = useWindowManager.getState();
    openWindow('win1', 'Window', null, { x: 200, y: 100 });
    const stateBefore = useWindowManager.getState();

    moveWindow('win1', { x: 200, y: 100 });
    const stateAfter = useWindowManager.getState();

    expect(stateAfter).toBe(stateBefore);
  });

  it('moveWindow for unknown window is no-op', () => {
    const { moveWindow } = useWindowManager.getState();
    const stateBefore = useWindowManager.getState();
    moveWindow('nonexistent', { x: 0, y: 0 });
    const stateAfter = useWindowManager.getState();
    expect(stateAfter).toBe(stateBefore);
  });

  it('closeWindow removes window and updates focus', () => {
    const { openWindow, closeWindow } = useWindowManager.getState();
    openWindow('win1', 'Window');
    openWindow('win2', 'Window 2');

    closeWindow('win1');

    const state = useWindowManager.getState();
    expect(state.windows['win1']).toBeUndefined();
    expect(state.windowIds).not.toContain('win1');
    expect(state.openFileIds['win1']).toBeUndefined();
  });

  it('closeWindow for unknown window is no-op', () => {
    const { closeWindow } = useWindowManager.getState();
    const stateBefore = useWindowManager.getState();
    closeWindow('nonexistent');
    const stateAfter = useWindowManager.getState();
    expect(stateAfter).toBe(stateBefore);
  });

  it('closeFocusedWindow closes the focused window', () => {
    const { openWindow, closeFocusedWindow } = useWindowManager.getState();
    openWindow('win1', 'Window');
    const win1Id = useWindowManager.getState().focusedWindowId;
    openWindow('win2', 'Window 2');
    const win2Id = useWindowManager.getState().focusedWindowId;

    closeFocusedWindow();

    const state = useWindowManager.getState();
    expect(state.windows['win2']).toBeUndefined();
    expect(state.focusedWindowId).toBeUndefined();
  });

  it('closeFocusedWindow is no-op when no window is focused', () => {
    const { closeFocusedWindow } = useWindowManager.getState();
    const stateBefore = useWindowManager.getState();
    closeFocusedWindow();
    const stateAfter = useWindowManager.getState();
    expect(stateAfter).toBe(stateBefore);
  });

  it('closeAllWindows closes all windows', () => {
    const { openWindow, closeAllWindows } = useWindowManager.getState();
    openWindow('win1', 'Window');
    openWindow('win2', 'Window 2');

    closeAllWindows();

    const state = useWindowManager.getState();
    expect(state.windows).toEqual({});
    expect(state.windowIds).toEqual([]);
    expect(state.focusedWindowId).toBeUndefined();
  });

  it('closeAllWindows is no-op when already empty', () => {
    const { closeAllWindows } = useWindowManager.getState();
    const stateBefore = useWindowManager.getState();
    closeAllWindows();
    const stateAfter = useWindowManager.getState();
    expect(stateAfter).toBe(stateBefore);
  });

  it('resetWindows clears all state including history', () => {
    const { openWindow, resetWindows } = useWindowManager.getState();
    openWindow('win1', 'Window');

    resetWindows();

    const state = useWindowManager.getState();
    expect(state.windows).toEqual({});
    expect(state.windowIds).toEqual([]);
    expect(state.windowHistory).toEqual({});
  });

  it('updateWindowBounds updates position and size and saves to history', () => {
    const { openWindow, updateWindowBounds } = useWindowManager.getState();
    openWindow('win1', 'Window');

    updateWindowBounds('win1', { position: { x: 50, y: 60 }, size: { width: 300, height: 200 } });

    const state = useWindowManager.getState();
    expect(state.windows['win1'].position).toEqual({ x: 50, y: 60 });
    expect(state.windows['win1'].size).toEqual({ width: 300, height: 200 });
    expect(state.windowHistory['win1']?.position).toEqual({ x: 50, y: 60 });
  });

  it('updateWindowBounds for unknown window is no-op', () => {
    const { updateWindowBounds } = useWindowManager.getState();
    const stateBefore = useWindowManager.getState();
    updateWindowBounds('nonexistent', { position: { x: 0, y: 0 } });
    const stateAfter = useWindowManager.getState();
    expect(stateAfter).toBe(stateBefore);
  });

  it('updateWindowBounds is no-op when bounds are unchanged', () => {
    const { openWindow, updateWindowBounds } = useWindowManager.getState();
    openWindow('win1', 'Window', null, { x: 200, y: 100 }, { width: 400, height: 300 });

    const stateBefore = useWindowManager.getState();
    updateWindowBounds('win1', { position: { x: 200, y: 100 } });
    const stateAfter = useWindowManager.getState();
    expect(stateAfter).toBe(stateBefore);
  });

  it('unfocusAll clears focusedWindowId', () => {
    const { openWindow, unfocusAll } = useWindowManager.getState();
    openWindow('win1', 'Window');

    unfocusAll();
    expect(useWindowManager.getState().focusedWindowId).toBeUndefined();
  });

  it('unfocusAll clears focus when triggered by non-parent', () => {
    const { openWindow, unfocusAll } = useWindowManager.getState();
    openWindow('win1', 'Parent');
    openWindow('win2', 'Child', 'win1');

    unfocusAll('win2');
    expect(useWindowManager.getState().focusedWindowId).toBeUndefined();
  });

  it('openWindow with openerWindowId links windows', () => {
    const { openWindow, closeWindow } = useWindowManager.getState();
    openWindow('win1', 'Parent');
    openWindow('win2', 'Child', null, undefined, undefined, 'win1');

    closeWindow('win2');

    expect(useWindowManager.getState().focusedWindowId).toBe('win1');
  });
});
