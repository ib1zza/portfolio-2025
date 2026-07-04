import { render, screen, act } from '@testing-library/react';
import { expect, test, describe, vi } from 'vitest';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('fine'),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
});

vi.mock('../../utils/cursors', () => ({
  injectCursorDataUris: vi.fn(),
}));

vi.mock('../../contexts/cursor', () => ({
  useCursor: () => ({ cursor: 'pointer' }),
}));

import { CustomCursor } from './CustomCursor';

describe('CustomCursor', () => {
  test('renders custom cursor element', () => {
    render(<CustomCursor />);
    const cursorEl = document.querySelector('[data-custom-cursor]');
    expect(cursorEl).toBeInTheDocument();
  });

  test('updates position on mousemove', () => {
    render(<CustomCursor />);
    const cursorEl = document.querySelector('[data-custom-cursor]') as HTMLElement;

    act(() => {
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 150, clientY: 250 }));
    });

    expect(cursorEl.style.left).toBe('150px');
    expect(cursorEl.style.top).toBe('250px');
  });

  test('hides cursor on mouseleave', () => {
    render(<CustomCursor />);
    expect(document.querySelector('[data-custom-cursor]')).toBeInTheDocument();

    act(() => {
      document.dispatchEvent(new MouseEvent('mouseleave'));
    });

    expect(document.querySelector('[data-custom-cursor]')).not.toBeInTheDocument();
  });

  test('shows cursor on mouseenter after mouseleave', () => {
    render(<CustomCursor />);

    act(() => {
      document.dispatchEvent(new MouseEvent('mouseleave'));
    });
    expect(document.querySelector('[data-custom-cursor]')).not.toBeInTheDocument();

    act(() => {
      document.dispatchEvent(new MouseEvent('mouseenter'));
    });
    expect(document.querySelector('[data-custom-cursor]')).toBeInTheDocument();
  });
});
