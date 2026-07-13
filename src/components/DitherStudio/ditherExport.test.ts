import { expect, test, describe, vi, beforeEach, afterEach } from 'vitest';
import { getSvgFromCanvas, downloadText } from './ditherExport';

describe('ditherExport', () => {
  beforeEach(() => {
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'mock-url'),
      revokeObjectURL: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('getSvgFromCanvas returns SVG string for black and white pixels', () => {
    const mockImageData = {
      data: new Uint8ClampedArray([
        0, 0, 0, 255,   // black
        255, 255, 255, 255, // white
      ]),
    };
    
    const mockContext = {
      getImageData: vi.fn(() => mockImageData),
    };

    const mockCanvas = {
      width: 2,
      height: 1,
      getContext: vi.fn(() => mockContext),
    } as unknown as HTMLCanvasElement;

    const svg = getSvgFromCanvas(mockCanvas);
    expect(svg).toContain('<rect x="0" y="0" width="1" height="1" />');
    expect(svg).toContain('viewBox="0 0 2 1"');
  });

  test('downloadText triggers file download', () => {
    const linkMock = {
      href: '',
      download: '',
      click: vi.fn(),
    };
    
    vi.spyOn(document, 'createElement').mockReturnValue(linkMock as unknown as HTMLAnchorElement);

    downloadText('hello', 'test.txt', 'text/plain');

    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(linkMock.href).toBe('mock-url');
    expect(linkMock.download).toBe('test.txt');
    expect(linkMock.click).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('mock-url');
  });
});
