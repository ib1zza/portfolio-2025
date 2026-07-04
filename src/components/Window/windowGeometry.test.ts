import { expect, test, describe } from 'vitest';

import {
  areSizesEqual,
  arePositionsEqual,
  getContainedPosition,
  getResizableSize,
} from './windowGeometry';

describe('windowGeometry', () => {
  describe('areSizesEqual', () => {
    test('returns true for equal sizes', () => {
      expect(areSizesEqual({ width: 100, height: 200 }, { width: 100, height: 200 })).toBe(true);
    });

    test('returns false for different widths', () => {
      expect(areSizesEqual({ width: 100, height: 200 }, { width: 101, height: 200 })).toBe(false);
    });

    test('returns false for different heights', () => {
      expect(areSizesEqual({ width: 100, height: 200 }, { width: 100, height: 201 })).toBe(false);
    });
  });

  describe('arePositionsEqual', () => {
    test('returns true for equal positions', () => {
      expect(arePositionsEqual({ x: 10, y: 20 }, { x: 10, y: 20 })).toBe(true);
    });

    test('returns false for different x', () => {
      expect(arePositionsEqual({ x: 10, y: 20 }, { x: 11, y: 20 })).toBe(false);
    });
  });

  describe('getContainedPosition', () => {
    beforeEach(() => {
      window.innerWidth = 1024;
      window.innerHeight = 768;
    });

    test('clamps x to 0 when negative', () => {
      const pos = getContainedPosition({ x: -50, y: 100 }, { width: 200, height: 200 });
      expect(pos.x).toBe(0);
    });

    test('clamps x to max when overflowing right', () => {
      const pos = getContainedPosition({ x: 900, y: 100 }, { width: 200, height: 200 });
      expect(pos.x).toBe(824);
    });

    test('clamps y to topbar height when too high', () => {
      const pos = getContainedPosition({ x: 0, y: 0 }, { width: 200, height: 200 });
      expect(pos.y).toBeGreaterThan(0);
    });

    test('passes through valid positions', () => {
      const pos = getContainedPosition({ x: 100, y: 100 }, { width: 200, height: 200 });
      expect(pos.x).toBe(100);
      expect(pos.y).toBe(100);
    });
  });

  describe('getResizableSize', () => {
    beforeEach(() => {
      window.innerWidth = 1600;
      window.innerHeight = 1200;
    });

    test('returns clamped size when width is too small', () => {
      const size = getResizableSize({ x: 100, y: 100 }, { width: 50, height: 300 });
      expect(size.width).toBeGreaterThanOrEqual(100);
      expect(size.height).toBe(300);
    });

    test('returns clamped size when height is too small', () => {
      const size = getResizableSize({ x: 100, y: 100 }, { width: 400, height: 30 });
      expect(size.height).toBeGreaterThanOrEqual(50);
      expect(size.width).toBeGreaterThanOrEqual(100);
    });

    test('caps width to remaining viewport', () => {
      const size = getResizableSize({ x: 1000, y: 100 }, { width: 800, height: 300 });
      expect(size.width).toBeLessThanOrEqual(1600 - 1000);
    });

    test('height capped when position near bottom', () => {
      const size = getResizableSize({ x: 100, y: 1000 }, { width: 400, height: 300 });
      expect(size.height).toBeLessThanOrEqual(1200 - 1000);
    });
  });
});
