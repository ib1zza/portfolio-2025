import { expect, test, describe, vi, beforeEach, afterEach } from 'vitest';
import { STORAGE_KEY, STORAGE_VERSION, sanitizeStoredPositions, readStoredPositions } from './storage';

describe('fileSystem/storage', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      ...window,
      localStorage: {
        getItem: vi.fn(),
        setItem: vi.fn(),
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('sanitizeStoredPositions', () => {
    test('returns empty object if version is less than 2', () => {
      const positions = { item1: { x: 10, y: 20 } };
      expect(sanitizeStoredPositions(positions, 1)).toEqual({});
    });

    test('retains valid positions and filters auto-layout root items', () => {
      const positions = {
        item1: { x: 10, y: 20 },
        about: { x: 30, y: 40 }, // should be filtered since it's a root layout item
        'saved-icon-123': { x: 50, y: 60 }, // should be filtered since it starts with saved-icon-
      };
      expect(sanitizeStoredPositions(positions, STORAGE_VERSION)).toEqual({
        item1: { x: 10, y: 20 },
      });
    });
  });

  describe('readStoredPositions', () => {
    test('returns empty object if localStorage is empty', () => {
      vi.mocked(window.localStorage.getItem).mockReturnValue(null);
      expect(readStoredPositions()).toEqual({});
    });

    test('reads and parses stored positions correctly', () => {
      const storedData = JSON.stringify({
        version: STORAGE_VERSION,
        state: {
          itemPositions: {
            item1: { x: 10, y: 20 }
          }
        }
      });
      vi.mocked(window.localStorage.getItem).mockReturnValue(storedData);
      expect(readStoredPositions()).toEqual({ item1: { x: 10, y: 20 } });
    });

    test('returns empty object on JSON parse error', () => {
      vi.mocked(window.localStorage.getItem).mockReturnValue('invalid-json');
      expect(readStoredPositions()).toEqual({});
    });
  });
});
