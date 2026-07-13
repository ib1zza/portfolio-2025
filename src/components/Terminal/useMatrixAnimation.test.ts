import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useMatrixAnimation } from './useMatrixAnimation';
import type { RefObject } from 'react';

describe('useMatrixAnimation', () => {
  let canvas: HTMLCanvasElement;
  let container: HTMLDivElement;
  let canvasRef: RefObject<HTMLCanvasElement | null>;
  let containerRef: RefObject<HTMLDivElement | null>;

  beforeEach(() => {
    vi.useFakeTimers();
    
    const mockContext = {
      fillStyle: '',
      font: '',
      fillRect: vi.fn(),
      fillText: vi.fn(),
    };

    canvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => mockContext),
    } as unknown as HTMLCanvasElement;

    container = {
      clientWidth: 800,
      clientHeight: 600,
    } as unknown as HTMLDivElement;

    canvasRef = { current: canvas };
    containerRef = { current: container };

    // Mock getComputedStyle
    vi.spyOn(window, 'getComputedStyle').mockImplementation(() => ({
      fontSize: '14px',
    } as unknown as CSSStyleDeclaration));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('does nothing when isAnimating is false', () => {
    renderHook(() => useMatrixAnimation(canvasRef, containerRef, false));
    expect(canvas.getContext).not.toHaveBeenCalled();
  });

  it('initializes canvas context and starts loop when isAnimating is true', () => {
    renderHook(() => useMatrixAnimation(canvasRef, containerRef, true));
    
    expect(canvas.getContext).toHaveBeenCalledWith('2d');
    const ctx = canvas.getContext('2d')!;
    expect(ctx.fillRect).toHaveBeenCalled();
  });
});
