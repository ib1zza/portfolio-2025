import { describe, it, expect } from 'vitest';
import { getAssetPath } from './assets';

describe('getAssetPath', () => {
  it('returns absolute http URLs as-is', () => {
    expect(getAssetPath('https://example.com/image.png')).toBe('https://example.com/image.png');
    expect(getAssetPath('http://example.com/image.png')).toBe('http://example.com/image.png');
  });

  it('returns protocol-relative URLs as-is', () => {
    expect(getAssetPath('//example.com/image.png')).toBe('//example.com/image.png');
  });

  it('returns protocol asset URLs as-is', () => {
    expect(getAssetPath('mailto:test@example.com')).toBe('mailto:test@example.com');
    expect(getAssetPath('tel:+1234567890')).toBe('tel:+1234567890');
    expect(getAssetPath('data:image/png;base64,abc')).toBe('data:image/png;base64,abc');
    expect(getAssetPath('blob:uuid-123')).toBe('blob:uuid-123');
  });

  it('prepends BASE_URL for relative paths', () => {
    const result = getAssetPath('image.png');
    expect(result).toMatch(/\/image\.png$/);
    expect(result).not.toBe('image.png');
  });

  it('normalizes leading slash in relative path', () => {
    const result = getAssetPath('/image.png');
    expect(result).toMatch(/\/image\.png$/);
    expect(result).not.toContain('//image');
  });
});
