import { render, screen } from '@testing-library/react';
import { expect, test, describe, vi } from 'vitest';

import type { FileSystemItem } from '../../store/useFileSystem';

vi.mock('../Folder', () => ({
  default: ({
    id,
    name,
    icon,
  }: {
    id: string;
    name: string;
    icon?: string;
  }) => <div data-testid="folder-item" data-id={id} data-name={name} data-icon={icon}>{name}</div>,
}));

import { WindowFolderContent } from './WindowFolderContent';

const constraintRef = { current: document.createElement('div') };

function makeItem(
  overrides: Partial<FileSystemItem> & { id: string; name: string; type: FileSystemItem['type'] },
): FileSystemItem {
  return overrides as FileSystemItem;
}

describe('WindowFolderContent', () => {
  test('renders folder type items', () => {
    const items: FileSystemItem[] = [
      makeItem({ id: 'docs', name: 'Documents', type: 'folder' }),
    ];

    render(
      <WindowFolderContent
        childItems={items}
        parentWindowId="win1"
        constraintRef={constraintRef}
      />,
    );

    const el = screen.getByTestId('folder-item');
    expect(el).toHaveAttribute('data-id', 'docs');
  });

  test('renders system type items with disk icon', () => {
    const items = [
      makeItem({ id: 'hd', name: 'HD', type: 'system' }),
    ];

    render(
      <WindowFolderContent
        childItems={items}
        parentWindowId="win1"
        constraintRef={constraintRef}
      />,
    );

    const el = screen.getByTestId('folder-item');
    expect(el).toHaveAttribute('data-icon', 'disk');
  });

  test('renders file type items', () => {
    const items = [
      makeItem({
        id: 'readme',
        name: 'readme.txt',
        type: 'file',
        content: 'hello',
      }),
    ];

    render(
      <WindowFolderContent
        childItems={items}
        parentWindowId="win1"
        constraintRef={constraintRef}
      />,
    );

    expect(screen.getByTestId('folder-item')).toHaveAttribute('data-icon', 'file');
  });

  test('renders audio file with file-audio icon', () => {
    const items = [
      makeItem({
        id: 'song',
        name: 'song.mp3',
        type: 'file',
        content: '',
        fileUrl: 'song.mp3',
      }),
    ];

    render(
      <WindowFolderContent
        childItems={items}
        parentWindowId="win1"
        constraintRef={constraintRef}
      />,
    );

    expect(screen.getByTestId('folder-item')).toHaveAttribute('data-icon', 'file-audio');
  });

  test('renders link type items', () => {
    const items = [
      makeItem({
        id: 'gh',
        name: 'GitHub',
        type: 'link',
        href: 'https://github.com',
        icon: 'github',
      }),
    ];

    render(
      <WindowFolderContent
        childItems={items}
        parentWindowId="win1"
        constraintRef={constraintRef}
      />,
    );

    expect(screen.getByTestId('folder-item')).toHaveAttribute('data-icon', 'github');
  });

  test('renders app type items', () => {
    const items = [
      makeItem({
        id: 'icon-painter',
        name: 'Icon Painter',
        type: 'app',
        app: 'icon-painter',
      }),
    ];

    render(
      <WindowFolderContent
        childItems={items}
        parentWindowId="win1"
        constraintRef={constraintRef}
      />,
    );

    expect(screen.getByTestId('folder-item')).toHaveAttribute('data-icon', 'app-icon-painter');
  });
});
