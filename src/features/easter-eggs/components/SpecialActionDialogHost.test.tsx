import { render, screen, act, fireEvent } from '@testing-library/react';
import { expect, test, describe, vi, beforeEach, afterEach } from 'vitest';

import { SpecialActionDialogHost } from './SpecialActionDialogHost';

describe('SpecialActionDialogHost', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('renders defragment-reality dialog with progress', () => {
    render(
      <SpecialActionDialogHost
        action="defragment-reality"
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText('Defragment Reality')).toBeInTheDocument();
    expect(
      screen.getByText('Optimizing local reality map...'),
    ).toBeInTheDocument();
  });

  test('defragment-reality shows OK after progress completes', () => {
    render(
      <SpecialActionDialogHost
        action="defragment-reality"
        onClose={vi.fn()}
      />,
    );
    expect(screen.queryByText('OK')).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2100);
    });

    expect(screen.getByText('OK')).toBeInTheDocument();
    expect(screen.getByText('Reality optimized successfully.')).toBeInTheDocument();
  });

  test('defragment-reality OK button fires onClose', () => {
    const onClose = vi.fn();
    render(
      <SpecialActionDialogHost
        action="defragment-reality"
        onClose={onClose}
      />,
    );

    act(() => {
      vi.advanceTimersByTime(2100);
    });

    fireEvent.click(screen.getByText('OK'));
    expect(onClose).toHaveBeenCalled();
  });

  test('renders reboot-universe dialog with confirmation', () => {
    render(
      <SpecialActionDialogHost
        action="reboot-universe"
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText('Reboot Universe')).toBeInTheDocument();
    expect(
      screen.getByText('Unsaved civilizations may be lost.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Continue')).toBeInTheDocument();
  });

  test('reboot-universe shows OK after Continue', () => {
    render(
      <SpecialActionDialogHost
        action="reboot-universe"
        onClose={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText('Continue'));
    expect(screen.getByText('Universe reboot postponed.')).toBeInTheDocument();
    expect(screen.getByText('OK')).toBeInTheDocument();
    expect(screen.queryByText('Continue')).not.toBeInTheDocument();
  });

  test('renders increase-creativity dialog', () => {
    render(
      <SpecialActionDialogHost
        action="increase-creativity"
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText('Increase Creativity')).toBeInTheDocument();
    expect(
      screen.getByText('Creativity increased by 12%.'),
    ).toBeInTheDocument();
    expect(screen.getByText('OK')).toBeInTheDocument();
  });

  test('renders calibrate-inspiration dialog', () => {
    render(
      <SpecialActionDialogHost
        action="calibrate-inspiration"
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText('Calibrate Inspiration')).toBeInTheDocument();
    expect(
      screen.getByText('Inspiration levels nominal.'),
    ).toBeInTheDocument();
  });

  test('dialog has correct role', () => {
    render(
      <SpecialActionDialogHost
        action="increase-creativity"
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
