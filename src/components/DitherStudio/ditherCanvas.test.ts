import { expect, test, describe, vi } from 'vitest';
import { drawDitheredImage } from './ditherCanvas';

describe('ditherCanvas', () => {
  test('drawDitheredImage does nothing if canvas is null', () => {
    expect(() => {
      drawDitheredImage(null, null, 'bayer', 128, 0, false, 256);
    }).not.toThrow();
  });

  test('drawDitheredImage performs dither pipeline on canvas context', () => {
    const mockImageData = {
      data: new Uint8ClampedArray(256 * 256 * 4),
    };
    
    const mockContext = {
      imageSmoothingEnabled: false,
      fillStyle: '',
      fillRect: vi.fn(),
      drawImage: vi.fn(),
      getImageData: vi.fn(() => mockImageData),
      putImageData: vi.fn(),
    };

    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => mockContext),
    } as unknown as HTMLCanvasElement;

    const mockImage = {
      width: 100,
      height: 100,
    } as unknown as HTMLImageElement;

    // Test Bayer mode
    drawDitheredImage(mockCanvas, mockImage, 'bayer', 128, 0, false, 256);
    expect(mockCanvas.getContext).toHaveBeenCalledWith('2d', { willReadFrequently: true });
    expect(mockContext.fillRect).toHaveBeenCalled();
    expect(mockContext.drawImage).toHaveBeenCalled();
    expect(mockContext.getImageData).toHaveBeenCalled();
    expect(mockContext.putImageData).toHaveBeenCalled();

    // Test Floyd mode
    vi.clearAllMocks();
    drawDitheredImage(mockCanvas, mockImage, 'floyd', 128, 10, true, 256);
    expect(mockContext.putImageData).toHaveBeenCalled();

    // Test Atkinson mode
    vi.clearAllMocks();
    drawDitheredImage(mockCanvas, mockImage, 'atkinson', 128, 10, false, 256);
    expect(mockContext.putImageData).toHaveBeenCalled();
  });
});
