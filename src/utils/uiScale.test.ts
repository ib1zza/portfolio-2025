import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getUiScale, scaleUiValue, scaleUiSize, isDesktopUiScale, isTabletUiScale } from './uiScale';
import { DESKTOP_UI_SCALE_QUERY, TABLET_UI_SCALE_QUERY } from '../constants/responsive';

describe('uiScale utils', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let matchMediaMock: any;

  beforeEach(() => {
    matchMediaMock = vi.fn();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return mobile UI scale when no query matches', () => {
    matchMediaMock.mockReturnValue({ matches: false });
    expect(isDesktopUiScale()).toBe(false);
    expect(isTabletUiScale()).toBe(false);
    expect(getUiScale()).toBe(1.5);
  });

  it('should return desktop UI scale when desktop query matches', () => {
    matchMediaMock.mockImplementation((query: string) => ({
      matches: query === DESKTOP_UI_SCALE_QUERY,
    }));
    expect(isDesktopUiScale()).toBe(true);
    expect(isTabletUiScale()).toBe(false);
    expect(getUiScale()).toBe(2);
  });

  it('should return tablet UI scale when tablet query matches', () => {
    matchMediaMock.mockImplementation((query: string) => ({
      matches: query === TABLET_UI_SCALE_QUERY,
    }));
    expect(isDesktopUiScale()).toBe(false);
    expect(isTabletUiScale()).toBe(true);
    expect(getUiScale()).toBe(1.5);
  });

  it('should scale single value correctly', () => {
    matchMediaMock.mockReturnValue({ matches: false }); // Mobile scale: 1.5
    expect(scaleUiValue(10)).toBe(15);
  });

  it('should scale size object correctly', () => {
    matchMediaMock.mockImplementation((query: string) => ({
      matches: query === DESKTOP_UI_SCALE_QUERY, // Desktop scale: 2
    }));
    const size = { width: 100, height: 50 };
    expect(scaleUiSize(size)).toEqual({ width: 200, height: 100 });
  });
});
