import { describe, it, expect } from 'vitest';
import { Z_INDEX } from './zIndex';

describe('Z_INDEX', () => {
  it('has correct windowFocused value', () => {
    expect(Z_INDEX.windowFocused).toBe(100);
  });

  it('has correct windowProxy value', () => {
    expect(Z_INDEX.windowProxy).toBe(101);
  });

  it('contains only expected keys', () => {
    expect(Object.keys(Z_INDEX)).toEqual(['windowFocused', 'windowProxy']);
  });
});
