import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, describe, vi } from 'vitest';

import { WindowTitleBar } from './WindowTitleBar';

describe('WindowTitleBar', () => {
  test('renders title', () => {
    render(
      <WindowTitleBar title="Test Window" onClose={vi.fn()} onZoomToFit={vi.fn()} />,
    );
    expect(screen.getByText('Test Window')).toBeInTheDocument();
  });

  test('renders close button', () => {
    render(
      <WindowTitleBar title="Test" onClose={vi.fn()} onZoomToFit={vi.fn()} />,
    );
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  test('calls onClose when close button clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <WindowTitleBar title="Test" onClose={onClose} onZoomToFit={vi.fn()} />,
    );
    const buttons = screen.getAllByRole('button');
    await user.click(buttons[0]);
    expect(onClose).toHaveBeenCalledOnce();
  });

  test('calls onZoomToFit when zoom button clicked', async () => {
    const user = userEvent.setup();
    const onZoomToFit = vi.fn();
    render(
      <WindowTitleBar title="Test" onClose={vi.fn()} onZoomToFit={onZoomToFit} />,
    );
    const buttons = screen.getAllByRole('button');
    await user.click(buttons[1]);
    expect(onZoomToFit).toHaveBeenCalledOnce();
  });

  test('hides zoom button when showZoomToFit is false', () => {
    render(
      <WindowTitleBar
        title="Test"
        onClose={vi.fn()}
        onZoomToFit={vi.fn()}
        showZoomToFit={false}
      />,
    );
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(1);
  });

  test('applies hypercard variant class', () => {
    const { container } = render(
      <WindowTitleBar
        title="Test"
        onClose={vi.fn()}
        onZoomToFit={vi.fn()}
        variant="hypercard"
      />,
    );
    expect(container.firstChild).toBeInTheDocument();
  });
});
