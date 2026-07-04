import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../utils/uiScale', () => ({
  scaleUiValue: (v: number) => v * 2,
  scaleUiSize: (s: { width: number; height: number }) => ({
    width: s.width * 2,
    height: s.height * 2,
  }),
}));

import {
  getTopbarHeight,
  getWindowTitlebarHeight,
  getDefaultWindowPosition,
  getDefaultWindowSize,
  getWindowMinSize,
  getWindowResizeHandleSize,
  getWindowTitlebarButtonSafeArea,
  getWindowOpenStartWidth,
  getAppWindowSize,
  getVideoPlayerWindowSize,
  getDocumentNoteWindowSize,
  isMobileWindowMode,
  getProjectModelWindowSize,
  getMobileWindowBounds,
  getWindowTargetBounds,
  type WindowAppId,
} from './windowLayout';

describe('windowLayout', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      matchMedia: vi.fn(),
      innerWidth: 1024,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('getTopbarHeight returns scaled value', () => {
    expect(getTopbarHeight()).toBe(42);
  });

  it('getWindowTitlebarHeight returns scaled value', () => {
    expect(getWindowTitlebarHeight()).toBe(34);
  });

  it('getDefaultWindowPosition returns scaled position', () => {
    expect(getDefaultWindowPosition()).toEqual({ x: 400, y: 200 });
  });

  it('getDefaultWindowSize returns scaled size', () => {
    expect(getDefaultWindowSize()).toEqual({ width: 800, height: 600 });
  });

  it('getWindowMinSize returns scaled min size', () => {
    expect(getWindowMinSize()).toEqual({ width: 600, height: 264 });
  });

  it('getWindowResizeHandleSize returns scaled value', () => {
    expect(getWindowResizeHandleSize()).toBe(30);
  });

  it('getWindowTitlebarButtonSafeArea returns scaled value', () => {
    expect(getWindowTitlebarButtonSafeArea()).toBe(60);
  });

  it('getWindowOpenStartWidth returns scaled value', () => {
    expect(getWindowOpenStartWidth()).toBe(56);
  });

  it('getAppWindowSize returns scaled size for known app', () => {
    const size = getAppWindowSize('icon-painter');
    expect(size.width).toBe(1160);
    expect(size.height).toBe(760);
  });

  it('getAppWindowSize returns default app size for unknown app', () => {
    const size = getAppWindowSize('badge-generator' as WindowAppId);
    expect(size.width).toBeGreaterThan(0);
    expect(size.height).toBeGreaterThan(0);
  });

  it('getVideoPlayerWindowSize returns scaled size', () => {
    expect(getVideoPlayerWindowSize()).toEqual({ width: 1200, height: 900 });
  });

  it('getDocumentNoteWindowSize returns scaled size', () => {
    expect(getDocumentNoteWindowSize()).toEqual({ width: 720, height: 520 });
  });

  it('isMobileWindowMode returns false on desktop', () => {
    vi.mocked(window.matchMedia).mockReturnValue({ matches: false });
    expect(isMobileWindowMode()).toBe(false);
  });

  it('isMobileWindowMode returns true on mobile', () => {
    vi.mocked(window.matchMedia).mockReturnValue({ matches: true });
    expect(isMobileWindowMode()).toBe(true);
  });

  it('getProjectModelWindowSize caps width to window.innerWidth', () => {
    vi.mocked(window.matchMedia).mockReturnValue({ matches: false });
    const size = getProjectModelWindowSize();
    expect(size.width).toBe(Math.min(1800, window.innerWidth));
    expect(size.height).toBe(880);
  });

  it('getMobileWindowBounds reads bounds from probe element', () => {
    const bounds = getMobileWindowBounds();
    expect(bounds).toHaveProperty('x');
    expect(bounds).toHaveProperty('y');
    expect(bounds).toHaveProperty('width');
    expect(bounds).toHaveProperty('height');
  });

  it('getWindowTargetBounds returns mobile bounds in mobile mode', () => {
    vi.mocked(window.matchMedia).mockReturnValue({ matches: true });
    const bounds = getWindowTargetBounds(
      { x: 100, y: 100 },
      { width: 400, height: 300 },
    );
    expect(bounds).toHaveProperty('x');
    expect(bounds).toHaveProperty('width');
  });

  it('getWindowTargetBounds returns position+size on desktop', () => {
    vi.mocked(window.matchMedia).mockReturnValue({ matches: false });
    const bounds = getWindowTargetBounds(
      { x: 100, y: 100 },
      { width: 400, height: 300 },
    );
    expect(bounds).toEqual({ x: 100, y: 100, width: 400, height: 300 });
  });
});
