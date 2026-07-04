import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useScale } from './useScale';

describe('useScale', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 800 });
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 600 });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns scale of 1 when viewport matches base dimensions', () => {
    const { result } = renderHook(() => useScale(800, 600));
    expect(result.current).toBe(1);
  });

  it('returns scale less than 1 when viewport is smaller than base', () => {
    window.innerWidth = 400;
    window.innerHeight = 300;

    const { result } = renderHook(() => useScale(800, 600));
    expect(result.current).toBe(0.5);
  });

  it('uses default base dimensions when not provided', () => {
    window.innerWidth = 1600;
    window.innerHeight = 1200;

    const { result } = renderHook(() => useScale());
    expect(result.current).toBe(2);
  });

  it('updates scale on window resize', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');

    const { result } = renderHook(() => useScale(800, 600));
    expect(result.current).toBe(1);

    act(() => {
      window.innerWidth = 400;
      window.innerHeight = 300;
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current).toBe(0.5);

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it('registers resize event listener on mount', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    renderHook(() => useScale(800, 600));
    expect(addSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    addSpy.mockRestore();
  });

  it('removes resize event listener on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useScale(800, 600));
    unmount();
    expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    removeSpy.mockRestore();
  });
});
