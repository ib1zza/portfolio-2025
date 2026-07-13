import { renderHook, act } from '@testing-library/react';
import { expect, test, describe, vi, beforeEach, afterEach } from 'vitest';
import { useSpaceInvadersGame } from './useSpaceInvadersGame';

describe('useSpaceInvadersGame', () => {
  beforeEach(() => {
    vi.useFakeTimers();

    const mockContext = {
      fillStyle: '',
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      fillText: vi.fn(),
      drawImage: vi.fn(),
      getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(100) })),
      putImageData: vi.fn(),
    };

    const mockCanvas = {
      getContext: vi.fn(() => mockContext),
      width: 320,
      height: 280,
    };

    // Mock document.createElement for shield canvases safely
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName, options) => {
      if (tagName === 'canvas') {
        return mockCanvas as unknown as HTMLCanvasElement;
      }
      return originalCreateElement(tagName, options);
    });

    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      return setTimeout(() => cb(Date.now()), 16);
    });
    vi.stubGlobal('cancelAnimationFrame', (id: number) => {
      clearTimeout(id);
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  test('initializes with menu state', () => {
    const { result } = renderHook(() => useSpaceInvadersGame());
    
    expect(result.current.gameState).toBe('menu');
    expect(result.current.hudScore).toBe(0);
    expect(result.current.hudLives).toBe(3);
    expect(result.current.hudLevel).toBe(1);
  });

  test('touch callbacks run without errors', () => {
    const { result } = renderHook(() => useSpaceInvadersGame());
    
    expect(() => {
      const mockEvent = { preventDefault: vi.fn() } as unknown as React.TouchEvent;
      act(() => {
        result.current.handleTouchStartLeft(mockEvent);
        result.current.handleTouchEndLeft(mockEvent);
        result.current.handleTouchStartRight(mockEvent);
        result.current.handleTouchEndRight(mockEvent);
        result.current.handleTouchStartFire(mockEvent);
        result.current.handleTouchEndFire(mockEvent);
      });
    }).not.toThrow();
  });
});
