import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  MOBILE_POINTER_QUERY,
  COARSE_POINTER_QUERY,
  FINE_POINTER_QUERY,
  isMobilePointerMode,
  isCoarsePointerMode,
  isFinePointerMode,
} from './responsive';

describe('responsive constants', () => {
  it('defines MOBILE_POINTER_QUERY', () => {
    expect(MOBILE_POINTER_QUERY).toBeTruthy();
    expect(typeof MOBILE_POINTER_QUERY).toBe('string');
  });

  it('defines COARSE_POINTER_QUERY', () => {
    expect(COARSE_POINTER_QUERY).toBeTruthy();
  });

  it('defines FINE_POINTER_QUERY', () => {
    expect(FINE_POINTER_QUERY).toBeTruthy();
  });

  it('FINE_POINTER_QUERY is referenced in DESKTOP_UI_SCALE_QUERY', () => {
    expect(FINE_POINTER_QUERY).toContain('pointer: fine');
  });
});

describe('responsive functions', () => {
  let matchMediaMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    matchMediaMock = vi.fn().mockReturnValue({ matches: false });
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: matchMediaMock,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('isMobilePointerMode returns true when query matches', () => {
    matchMediaMock.mockReturnValue({ matches: true });
    expect(isMobilePointerMode()).toBe(true);
  });

  it('isMobilePointerMode returns false when query does not match', () => {
    expect(isMobilePointerMode()).toBe(false);
  });

  it('isCoarsePointerMode returns true when query matches', () => {
    matchMediaMock.mockReturnValue({ matches: true });
    expect(isCoarsePointerMode()).toBe(true);
  });

  it('isFinePointerMode returns true when query matches', () => {
    matchMediaMock.mockReturnValue({ matches: true });
    expect(isFinePointerMode()).toBe(true);
  });

  it('uses correct MEDIA query for each function', () => {
    matchMediaMock.mockReturnValue({ matches: false });

    isMobilePointerMode();
    expect(matchMediaMock).toHaveBeenCalledWith(MOBILE_POINTER_QUERY);

    isCoarsePointerMode();
    expect(matchMediaMock).toHaveBeenCalledWith(COARSE_POINTER_QUERY);

    isFinePointerMode();
    expect(matchMediaMock).toHaveBeenCalledWith(FINE_POINTER_QUERY);
  });

  it('returns false when window is undefined', () => {
    const origWindow = globalThis.window;
    Object.defineProperty(globalThis, 'window', { value: undefined, configurable: true });

    expect(isMobilePointerMode()).toBe(false);
    expect(isCoarsePointerMode()).toBe(false);
    expect(isFinePointerMode()).toBe(false);

    Object.defineProperty(globalThis, 'window', { value: origWindow, configurable: true });
  });
});
