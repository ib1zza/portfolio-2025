import { expect, test, describe, vi } from 'vitest';
import { drawPixelBars, drawPixelWaveform, drawPixelCircle } from './visualizers';

describe('visualizers', () => {
  const mockContext = {
    fillStyle: '',
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
  };

  test('drawPixelBars clears canvas and draws rects', () => {
    const ctx = mockContext as unknown as CanvasRenderingContext2D;
    const data = new Uint8Array([100, 150, 200]);
    
    vi.clearAllMocks();
    drawPixelBars(ctx, data, 100, 50);

    expect(mockContext.fillRect).toHaveBeenCalled();
  });

  test('drawPixelWaveform clears canvas and draws waveform', () => {
    const ctx = mockContext as unknown as CanvasRenderingContext2D;
    const data = new Uint8Array([100, 150, 200]);
    
    vi.clearAllMocks();
    drawPixelWaveform(ctx, data, 100, 50);

    expect(mockContext.fillRect).toHaveBeenCalled();
  });

  test('drawPixelCircle clears canvas and draws circle visualizer', () => {
    const ctx = mockContext as unknown as CanvasRenderingContext2D;
    const data = new Uint8Array([100, 150, 200]);
    
    vi.clearAllMocks();
    drawPixelCircle(ctx, data, 100, 50);

    expect(mockContext.fillRect).toHaveBeenCalled();
  });
});
