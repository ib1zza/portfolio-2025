import { render, screen } from '@testing-library/react';
import { expect, test, describe, vi } from 'vitest';
import { fireEvent } from '@testing-library/react';

import { FinderItem } from './FinderItem';

function renderItem(overrides?: Record<string, unknown>) {
  const props = {
    id: 'test-item',
    isActive: false,
    isOpenedInactive: false,
    itemRef: { current: null },
    onClick: vi.fn(),
    onDoubleClick: vi.fn(),
    onPointerDown: vi.fn(),
    position: { x: 100, y: 200 },
    children: <span data-testid="child">Content</span>,
    ...overrides,
  };
  return render(<FinderItem {...props} />);
}

describe('FinderItem', () => {
  test('renders children', () => {
    renderItem();
    expect(screen.getByTestId('child')).toHaveTextContent('Content');
  });

  test('renders with data-finder-item-id attribute', () => {
    renderItem();
    const el = document.querySelector('[data-finder-item-id="test-item"]');
    expect(el).toBeInTheDocument();
  });

  test('applies position as inline style', () => {
    renderItem();
    const el = document.querySelector('[data-finder-item-id="test-item"]') as HTMLElement;
    expect(el.style.top).toBe('200px');
    expect(el.style.left).toBe('100px');
  });

  test('calls onPointerDown when pointer pressed', () => {
    const onPointerDown = vi.fn();
    renderItem({ onPointerDown });
    const el = document.querySelector('[data-finder-item-id="test-item"]')!;
    fireEvent.pointerDown(el, { button: 0 });
    expect(onPointerDown).toHaveBeenCalled();
  });
});
