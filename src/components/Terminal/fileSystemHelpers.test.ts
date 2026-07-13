import { expect, test, describe } from 'vitest';
import { getPathString, resolveFolderId } from './fileSystemHelpers';
import type { FileSystemItem } from '../../store/useFileSystem';

describe('fileSystemHelpers', () => {
  const mockFileSystem: Record<string, FileSystemItem> = {
    root: {
      id: 'root',
      name: 'root',
      type: 'folder',
      parentId: null,
      children: ['folder1', 'folder2', 'file1'],
    },
    folder1: {
      id: 'folder1',
      name: 'Documents',
      type: 'folder',
      parentId: 'root',
      children: ['subfolder1'],
    },
    folder2: {
      id: 'folder2',
      name: 'Games',
      type: 'folder',
      parentId: 'root',
      children: [],
    },
    subfolder1: {
      id: 'subfolder1',
      name: 'Work',
      type: 'folder',
      parentId: 'folder1',
      children: [],
    },
    file1: {
      id: 'file1',
      name: 'readme.txt',
      type: 'file',
      parentId: 'root',
    },
  } as unknown as Record<string, FileSystemItem>;

  describe('getPathString', () => {
    test('returns / for root folder', () => {
      expect(getPathString('root', mockFileSystem)).toBe('/');
    });

    test('returns path string for flat subfolder', () => {
      expect(getPathString('folder1', mockFileSystem)).toBe('/Documents');
    });

    test('returns path string for deep subfolder', () => {
      expect(getPathString('subfolder1', mockFileSystem)).toBe('/Documents/Work');
    });
  });

  describe('resolveFolderId', () => {
    test('returns current folder ID for empty path', () => {
      expect(resolveFolderId('', 'folder1', mockFileSystem)).toBe('folder1');
    });

    test('returns root for / or ~', () => {
      expect(resolveFolderId('/', 'folder1', mockFileSystem)).toBe('root');
      expect(resolveFolderId('~', 'folder1', mockFileSystem)).toBe('root');
    });

    test('resolves relative path', () => {
      expect(resolveFolderId('Documents', 'root', mockFileSystem)).toBe('folder1');
    });

    test('resolves absolute path', () => {
      expect(resolveFolderId('/Documents/Work', 'folder2', mockFileSystem)).toBe('subfolder1');
    });

    test('resolves .. path', () => {
      expect(resolveFolderId('..', 'subfolder1', mockFileSystem)).toBe('folder1');
      expect(resolveFolderId('../../Games', 'subfolder1', mockFileSystem)).toBe('folder2');
    });

    test('resolves . path', () => {
      expect(resolveFolderId('./Work', 'folder1', mockFileSystem)).toBe('subfolder1');
    });

    test('returns null for non-existent path', () => {
      expect(resolveFolderId('Nonexistent', 'root', mockFileSystem)).toBeNull();
    });

    test('returns null when traversing through file', () => {
      expect(resolveFolderId('readme.txt/Work', 'root', mockFileSystem)).toBeNull();
    });
  });
});
