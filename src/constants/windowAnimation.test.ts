import { describe, it, expect } from 'vitest';
import { WINDOW_OPEN_ANIMATION_DURATION_MS } from './windowAnimation';

describe('WINDOW_OPEN_ANIMATION_DURATION_MS', () => {
  it('has the correct value of 200ms', () => {
    expect(WINDOW_OPEN_ANIMATION_DURATION_MS).toBe(200);
  });

  it('is a number', () => {
    expect(typeof WINDOW_OPEN_ANIMATION_DURATION_MS).toBe('number');
  });
});
