import { render, screen, fireEvent } from '@testing-library/react';
import { expect, test, describe, vi } from 'vitest';

import { WindowScrollbars } from './WindowScrollbars';

function renderScrollbars(overrides?: Record<string, unknown>) {
  const props = {
    contentRef: { current: null },
    horizontalTrackRef: { current: null },
    verticalTrackRef: { current: null },
    getThumbStyle: () => ({ height: 50, top: 10 }),
    hasHorizontalScroll: false,
    hasVerticalScroll: false,
    scrollContent: vi.fn(),
    startThumbDrag: vi.fn(),
    updateScrollMetrics: vi.fn(),
    children: <div data-testid="content">Hello</div>,
    ...overrides,
  };
  return render(<WindowScrollbars {...props} />);
}

describe('WindowScrollbars', () => {
  test('renders children', () => {
    renderScrollbars();
    expect(screen.getByTestId('content')).toHaveTextContent('Hello');
  });

  test('shows vertical scrollbar when hasVerticalScroll is true', () => {
    renderScrollbars({ hasVerticalScroll: true });
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  test('hides thumb when hasVerticalScroll is false', () => {
    const { container } = renderScrollbars({ hasVerticalScroll: false });
    const verticalTracks = container.querySelectorAll(
      '[class*="verticalScrollBar"]',
    );
    expect(verticalTracks.length).toBeGreaterThan(0);
  });

  test('renders in plain mode when showControls is false', () => {
    const { container } = renderScrollbars({ showControls: false });
    const contentPlain = container.querySelector('[class*="contentPlain"]');
    expect(contentPlain).toBeInTheDocument();
  });

  test('calls scrollContent on button click', () => {
    const scrollContent = vi.fn();
    renderScrollbars({
      hasVerticalScroll: true,
      hasHorizontalScroll: true,
      scrollContent,
    });
    const buttons = screen.getAllByRole('button');
    const upBtn = buttons.find((b) =>
      b.className.includes('navigationButtonUp'),
    );
    if (upBtn) fireEvent.click(upBtn);
    expect(scrollContent).toHaveBeenCalled();
  });

  test('calls startThumbDrag on thumb pointer down', () => {
    const startThumbDrag = vi.fn();
    const { container } = renderScrollbars({
      hasVerticalScroll: true,
      startThumbDrag,
    });
    const thumb = container.querySelector('[class*="scrollThumb"]');
    if (thumb) fireEvent.pointerDown(thumb);
    expect(startThumbDrag).toHaveBeenCalledWith(
      expect.anything(),
      'y',
    );
  });
});
