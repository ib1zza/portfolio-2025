import { render, screen, fireEvent } from '@testing-library/react';
import { expect, test, describe, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => {
  const openWindowAnimated = vi.fn();
  const focusWindow = vi.fn();
  const unfocusAll = vi.fn();
  const setActive = vi.fn();
  const moveItem = vi.fn();
  const deleteSavedIconItem = vi.fn();
  const getItemById = vi.fn();
  const fileOpen = vi.fn();
  const recordItemOpenRequest = vi.fn();
  const recordTrashClick = vi.fn();

  return {
    openWindowAnimated,
    focusWindow,
    unfocusAll,
    setActive,
    moveItem,
    deleteSavedIconItem,
    getItemById,
    fileOpen,
    recordItemOpenRequest,
    recordTrashClick,
  };
});

vi.mock('../WindowOpenAnimation', () => ({
  useWindowOpenAnimation: () => ({
    openWindowAnimated: mocks.openWindowAnimated,
    closeWindowAnimated: vi.fn(),
  }),
}));

vi.mock('../../store/useWindowManager', () => ({
  useWindowManager: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      focusWindow: mocks.focusWindow,
      unfocusAll: mocks.unfocusAll,
      openFileIds: {},
    }),
}));

vi.mock('../../store/useFileSystem', () => ({
  useFileSystem: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      setActive: mocks.setActive,
      activeItemId: null,
      moveItem: mocks.moveItem,
      deleteSavedIconItem: mocks.deleteSavedIconItem,
      getItemById: mocks.getItemById,
    }),
}));

vi.mock('../../hooks/useHaptics', () => ({
  useHaptics: () => ({ fileOpen: mocks.fileOpen }),
}));

vi.mock('../../features/easter-eggs/EasterEggContext', () => ({
  useEasterEggs: () => ({
    recordItemOpenRequest: mocks.recordItemOpenRequest,
    recordTrashClick: mocks.recordTrashClick,
  }),
}));

import { Folder } from './Folder';

describe('Folder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders folder name', () => {
    render(
      <Folder id="test-folder" name="Test Folder" position={{ x: 0, y: 0 }} />,
    );
    expect(screen.getByText('Test Folder')).toBeInTheDocument();
  });

  test('renders inside a FinderItem', () => {
    const { container } = render(
      <Folder id="test-folder" name="Test" position={{ x: 10, y: 20 }} />,
    );
    const item = container.querySelector('[data-finder-item-id="test-folder"]');
    expect(item).toBeInTheDocument();
  });

  test('sets active on click', () => {
    render(
      <Folder id="test-folder" name="Test" position={{ x: 0, y: 0 }} />,
    );
    const item = document.querySelector('[data-finder-item-id="test-folder"]')!;
    fireEvent.click(item);
    expect(mocks.setActive).toHaveBeenCalledWith('test-folder');
  });

  test('renders with custom icon type', () => {
    render(
      <Folder
        id="trash"
        name="Trash"
        icon="trash"
        position={{ x: 0, y: 0 }}
      />,
    );
    const item = document.querySelector('[data-finder-item-id="trash"]');
    expect(item).toBeInTheDocument();
  });

  test('click on trash records trash click', () => {
    render(
      <Folder id="trash" name="Trash" icon="trash" position={{ x: 0, y: 0 }} />,
    );
    const item = document.querySelector('[data-finder-item-id="trash"]')!;
    fireEvent.click(item);
    expect(mocks.recordTrashClick).toHaveBeenCalled();
  });

  test('click activates and unfocuses all on desktop', () => {
    render(
      <Folder id="folder1" name="Folder 1" position={{ x: 0, y: 0 }} />,
    );
    const item = document.querySelector('[data-finder-item-id="folder1"]')!;
    fireEvent.click(item);
    expect(mocks.setActive).toHaveBeenCalledWith('folder1');
    expect(mocks.unfocusAll).toHaveBeenCalled();
  });

  test('click with parentWindowId focuses parent window', () => {
    render(
      <Folder
        id="folder1"
        name="Folder 1"
        position={{ x: 0, y: 0 }}
        parentWindowId="win1"
      />,
    );
    const item = document.querySelector('[data-finder-item-id="folder1"]')!;
    fireEvent.click(item);
    expect(mocks.focusWindow).toHaveBeenCalledWith('win1');
  });

  test('double-click opens item', () => {
    mocks.getItemById.mockReturnValue({ id: 'folder1', type: 'folder' });
    render(
      <Folder id="folder1" name="Folder 1" position={{ x: 0, y: 0 }} />,
    );
    const item = document.querySelector('[data-finder-item-id="folder1"]')!;
    fireEvent.dblClick(item);
    expect(mocks.fileOpen).toHaveBeenCalled();
    expect(mocks.setActive).toHaveBeenCalledWith('folder1');
    expect(mocks.recordItemOpenRequest).toHaveBeenCalledWith('folder1');
    expect(mocks.openWindowAnimated).toHaveBeenCalled();
  });

  test('double-click on trash does not open', () => {
    render(
      <Folder id="trash" name="Trash" icon="trash" position={{ x: 0, y: 0 }} />,
    );
    const item = document.querySelector('[data-finder-item-id="trash"]')!;
    fireEvent.dblClick(item);
    expect(mocks.fileOpen).not.toHaveBeenCalled();
  });
});
