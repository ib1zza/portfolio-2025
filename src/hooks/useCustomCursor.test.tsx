import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, type ReactNode } from 'vitest';
import { useCustomCursor } from './useCustomCursor';
import { CursorContext } from '../contexts/cursor';

function createWrapper() {
  const setCursor = vi.fn();
  const resetCursor = vi.fn();

  return {
    wrapper: ({ children }: { children: ReactNode }) => (
      <CursorContext.Provider value={{ cursor: 'arrow', setCursor, resetCursor, startCursorOverride: vi.fn() }}>
        {children}
      </CursorContext.Provider>
    ),
    setCursor,
    resetCursor,
  };
}

describe('useCustomCursor', () => {
  it('returns setCursor and resetCursor functions', () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useCustomCursor(), { wrapper });

    expect(result.current).toHaveProperty('setCursor');
    expect(result.current).toHaveProperty('resetCursor');
    expect(result.current).toHaveProperty('withCursor');
  });

  it('setCursor calls context setCursor', () => {
    const { wrapper, setCursor } = createWrapper();
    const { result } = renderHook(() => useCustomCursor(), { wrapper });

    result.current.setCursor('watch');

    expect(setCursor).toHaveBeenCalledWith('watch');
  });

  it('resetCursor calls context resetCursor', () => {
    const { wrapper, resetCursor } = createWrapper();
    const { result } = renderHook(() => useCustomCursor(), { wrapper });

    result.current.resetCursor();

    expect(resetCursor).toHaveBeenCalled();
  });

  it('withCursor returns event handlers for given cursor', () => {
    const { wrapper, setCursor, resetCursor } = createWrapper();
    const { result } = renderHook(() => useCustomCursor(), { wrapper });

    const handlers = result.current.withCursor('watch');

    handlers.onMouseEnter();
    expect(setCursor).toHaveBeenCalledWith('watch');

    handlers.onMouseLeave();
    expect(resetCursor).toHaveBeenCalled();
  });

  it('throws error when used outside CursorProvider', () => {
    expect(() => {
      renderHook(() => useCustomCursor());
    }).toThrow('useCursor must be used within a CursorProvider');
  });
});
