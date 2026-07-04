import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../assets/cursors/arrow.svg?raw', () => ({ default: '<svg>arrow</svg>' }));
vi.mock('../assets/cursors/watch.svg?raw', () => ({ default: '<svg>watch</svg>' }));

import { injectCursorDataUris } from './cursors';

describe('injectCursorDataUris', () => {
  beforeEach(() => {
    document.documentElement.style.removeProperty('--cursor-default');
    document.documentElement.style.removeProperty('--cursor-arrow');
    document.documentElement.style.removeProperty('--cursor-watch');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('injects CSS custom properties for cursors', () => {
    injectCursorDataUris();

    const defaultVal = document.documentElement.style.getPropertyValue('--cursor-default');
    const arrowVal = document.documentElement.style.getPropertyValue('--cursor-arrow');
    const watchVal = document.documentElement.style.getPropertyValue('--cursor-watch');

    expect(defaultVal).toContain('url("data:image/svg+xml');
    expect(arrowVal).toContain('url("data:image/svg+xml');
    expect(watchVal).toContain('url("data:image/svg+xml');
  });

  it('is idempotent (only injects once)', () => {
    injectCursorDataUris();
    document.documentElement.style.removeProperty('--cursor-watch');

    injectCursorDataUris();

    expect(document.documentElement.style.getPropertyValue('--cursor-watch')).toBe('');
  });

  it('does not throw when document is undefined', () => {
    const origDocument = globalThis.document;
    Object.defineProperty(globalThis, 'document', { value: undefined, configurable: true });

    expect(() => injectCursorDataUris()).not.toThrow();

    Object.defineProperty(globalThis, 'document', { value: origDocument, configurable: true });
  });
});
