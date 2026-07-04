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

vi.mock('../components/IconPainter/iconPainterDesktop', () => ({
  readSavedIcons: () => [],
  deleteSavedIcon: vi.fn(),
}));

vi.mock('../utils/uiScale', () => ({
  scaleUiValue: (v: number) => v,
  scaleUiSize: (s: { width: number; height: number }) => s,
}));

import { useFileSystem, getChildItems } from './useFileSystem';
import type { FileSystemItem } from './useFileSystem';

describe('useFileSystem', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('initializes with root folder and core items', () => {
    const state = useFileSystem.getState();
    const root = state.items.root;
    expect(root).toBeDefined();
    expect(root.type).toBe('folder');
    expect(root.children.length).toBeGreaterThan(0);
  });

  it('getChildren returns children for a folder', () => {
    const state = useFileSystem.getState();
    const children = state.getChildren('root');
    expect(Array.isArray(children)).toBe(true);
    expect(children.length).toBeGreaterThan(0);
    children.forEach((child) => {
      expect(child.parentId).toBe('root');
    });
  });

  it('getChildren returns children by parentId for non-root folders', () => {
    const state = useFileSystem.getState();
    const aboutFolder = state.items.about;
    expect(aboutFolder).toBeDefined();

    const children = state.getChildren('about');
    expect(children.length).toBeGreaterThan(0);
    children.forEach((child) => {
      expect(child.parentId).toBe('about');
    });
  });

  it('getChildren returns top-level items when parentId is null', () => {
    const state = useFileSystem.getState();
    const rootChildren = state.getChildren(null);
    expect(rootChildren.length).toBe(1);
    expect(rootChildren[0].id).toBe('root');
  });

  it('getItemById returns item by id', () => {
    const item = useFileSystem.getState().getItemById('about');
    expect(item).toBeDefined();
    expect(item?.id).toBe('about');
  });

  it('getItemById returns undefined for unknown id', () => {
    const item = useFileSystem.getState().getItemById('nonexistent');
    expect(item).toBeUndefined();
  });

  it('setActive sets activeItemId', () => {
    const { setActive } = useFileSystem.getState();
    setActive('about');

    expect(useFileSystem.getState().activeItemId).toBe('about');
  });

  it('setActive is no-op when same item is already active', () => {
    const { setActive } = useFileSystem.getState();
    setActive('about');

    const stateBefore = useFileSystem.getState();
    setActive('about');
    const stateAfter = useFileSystem.getState();

    expect(stateAfter).toBe(stateBefore);
  });

  it('removeActive clears activeItemId', () => {
    const { setActive, removeActive } = useFileSystem.getState();
    setActive('about');
    removeActive();

    expect(useFileSystem.getState().activeItemId).toBeNull();
  });

  it('removeActive is no-op when no item is active', () => {
    const { removeActive } = useFileSystem.getState();
    const stateBefore = useFileSystem.getState();
    removeActive();
    const stateAfter = useFileSystem.getState();
    expect(stateAfter).toBe(stateBefore);
  });

  it('moveItem updates item position', () => {
    const { moveItem } = useFileSystem.getState();
    const newPos = { x: 999, y: 888 };
    moveItem('about', newPos);

    expect(useFileSystem.getState().items.about.position).toEqual(newPos);
  });

  it('moveItem for unknown item is no-op', () => {
    const { moveItem } = useFileSystem.getState();
    const stateBefore = useFileSystem.getState();
    moveItem('nonexistent', { x: 0, y: 0 });
    const stateAfter = useFileSystem.getState();
    expect(stateAfter).toBe(stateBefore);
  });

  it('moveItem is no-op when position is unchanged', () => {
    const { moveItem } = useFileSystem.getState();
    const stateBefore = useFileSystem.getState();
    moveItem('about', stateBefore.items.about.position!);
    const stateAfter = useFileSystem.getState();
    expect(stateAfter).toBe(stateBefore);
  });

  it('resetLayout resets to initial state', () => {
    const { moveItem, resetLayout } = useFileSystem.getState();
    moveItem('about', { x: 999, y: 888 });

    resetLayout();

    const state = useFileSystem.getState();
    expect(state.activeItemId).toBeNull();
    expect(state.itemPositions).toEqual({});
  });

  it('cleanUpChildren fixes positions of children', () => {
    const { cleanUpChildren, getChildren } = useFileSystem.getState();
    const initialChildren = getChildren(null);

    cleanUpChildren(null);

    const cleanedChildren = useFileSystem.getState().getChildren(null);
    expect(cleanedChildren.length).toBe(initialChildren.length);
  });
});

describe('getChildItems (standalone)', () => {
  const mockItems: Record<string, FileSystemItem> = {
    root: { id: 'root', name: 'Root', type: 'folder', parentId: null, children: ['a', 'b'] },
    a: { id: 'a', name: 'Item A', type: 'file', parentId: 'root', content: 'hello' },
    b: { id: 'b', name: 'Item B', type: 'folder', parentId: 'root', children: ['c'] },
    c: { id: 'c', name: 'Item C', type: 'file', parentId: 'b', content: 'world' },
    orphan: { id: 'orphan', name: 'Orphan', type: 'file', parentId: null, content: '' },
  };

  it('returns children by parent folder children array', () => {
    const children = getChildItems(mockItems, 'root');
    expect(children).toHaveLength(2);
    expect(children[0].id).toBe('a');
    expect(children[1].id).toBe('b');
  });

  it('returns nested folder children', () => {
    const children = getChildItems(mockItems, 'b');
    expect(children).toHaveLength(1);
    expect(children[0].id).toBe('c');
  });

  it('returns items with parentId === null when parent has no children array', () => {
    const items: Record<string, FileSystemItem> = {
      orphan: { id: 'orphan', name: 'Orphan', type: 'file', parentId: null, content: '' },
      other: { id: 'other', name: 'Other', type: 'file', parentId: 'root', content: '' },
    };
    const topLevel = getChildItems(items, null);
    expect(topLevel).toHaveLength(1);
    expect(topLevel[0].id).toBe('orphan');
  });

  it('returns empty array for non-existent parent', () => {
    const children = getChildItems(mockItems, 'nonexistent');
    expect(children).toEqual([]);
  });

  it('skips missing children', () => {
    const items: Record<string, FileSystemItem> = {
      root: { id: 'root', name: 'Root', type: 'folder', parentId: null, children: ['a', 'missing', 'b'] },
      a: { id: 'a', name: 'A', type: 'file', parentId: 'root', content: '' },
      b: { id: 'b', name: 'B', type: 'file', parentId: 'root', content: '' },
    };
    const children = getChildItems(items, 'root');
    expect(children).toHaveLength(2);
  });

  it('handles system type parent like folder', () => {
    const items: Record<string, FileSystemItem> = {
      disk: { id: 'disk', name: 'Disk', type: 'system', parentId: null, systemType: 'disk', children: ['file1'] },
      file1: { id: 'file1', name: 'File 1', type: 'file', parentId: 'disk', content: '' },
    };
    const children = getChildItems(items, 'disk');
    expect(children).toHaveLength(1);
    expect(children[0].id).toBe('file1');
  });
});
