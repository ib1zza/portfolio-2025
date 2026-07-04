import { render, screen, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, describe, vi, beforeEach, afterEach } from 'vitest';
import { EASTER_EGG_LOG_FILE_ID } from './easterEggDefinitions';
import type { SpecialAction } from './EasterEggContext';

const mocks = vi.hoisted(() => {
  const markFound = vi.fn();
  const setActive = vi.fn();
  const addExtraRootItem = vi.fn();
  const openWindowAnimated = vi.fn();
  const hapticsEasterEgg = vi.fn();
  const fileOpen = vi.fn();

  return {
    markFound,
    setActive,
    addExtraRootItem,
    openWindowAnimated,
    hapticsEasterEgg,
    fileOpen,
  };
});

vi.mock('../../components/WindowOpenAnimation', () => ({
  useWindowOpenAnimation: () => ({
    openWindowAnimated: mocks.openWindowAnimated,
    closeWindowAnimated: vi.fn(),
  }),
}));

vi.mock('../../store/useFileSystem', () => {
  const fsState: Record<string, unknown> = {
    items: {
      root: { type: 'folder', children: [] },
    },
    activeItemId: null,
    setActive: mocks.setActive,
    getItemById: vi.fn(),
    addExtraRootItem: mocks.addExtraRootItem,
  };

  const useFileSystem = (selector: (state: typeof fsState) => unknown) =>
    selector(fsState);
  useFileSystem.getState = () => fsState;
  useFileSystem.setState = vi.fn();

  return { useFileSystem };
});

vi.mock('./useEasterEggProgress', () => {
  const mockFoundEggIds: string[] = [];

  return {
    useEasterEggProgress: (selector: (state: Record<string, unknown>) => unknown) =>
      selector({
        foundEggIds: mockFoundEggIds,
        markFound: mocks.markFound,
      }),
  };
});

vi.mock('../../hooks/useHaptics', () => ({
  useHaptics: () => ({
    easterEgg: mocks.hapticsEasterEgg,
    fileOpen: mocks.fileOpen,
  }),
}));

vi.mock('./components/SpecialActionDialogHost', () => ({
  SpecialActionDialogHost: ({
    action,
    onClose,
  }: {
    action: SpecialAction;
    onClose: () => void;
  }) => (
    <div data-testid="special-dialog">
      <span data-testid="dialog-action">{action}</span>
      <button data-testid="dialog-close" onClick={onClose}>
        Close
      </button>
    </div>
  ),
}));

vi.mock('./components/SystemCrashOverlay', () => ({
  SystemCrashOverlay: ({
    sourceRect,
    onDismiss,
  }: {
    sourceRect?: DOMRect;
    onDismiss: () => void;
  }) => (
    <div data-testid="crash-overlay">
      <span data-testid="crash-source">
        {sourceRect ? 'has-source' : 'no-source'}
      </span>
      <button data-testid="crash-dismiss" onClick={onDismiss}>
        Dismiss
      </button>
    </div>
  ),
}));

import { EasterEggProvider } from './EasterEggProvider';
import { useEasterEggs } from './EasterEggContext';
import type { EasterEggContextValue } from './EasterEggContext';

function TestConsumer() {
  const ctx = useEasterEggs();
  return (
    <div>
      <span data-testid="can-reveal">{String(ctx.canRevealLastDisk)}</span>
      <span data-testid="shift-held">{String(ctx.isShiftHeld)}</span>
      <button
        data-testid="record-bg-click"
        onClick={() => ctx.recordDesktopBackgroundClick({ altKey: true })}
      />
      <button
        data-testid="record-bg-click-no-alt"
        onClick={() => ctx.recordDesktopBackgroundClick({ altKey: false })}
      />
      <button
        data-testid="record-trash-click"
        onClick={() => ctx.recordTrashClick()}
      />
      <button
        data-testid="record-item-open"
        onClick={() => ctx.recordItemOpenRequest('timeMachineHd')}
      />
      <button
        data-testid="reveal-last-disk"
        onClick={() => ctx.revealLastDiskFromSpecial()}
      />
      <button
        data-testid="run-special"
        onClick={() => ctx.runSpecialAction('defragment-reality')}
      />
    </div>
  );
}

function renderWithProvider() {
  return render(
    <EasterEggProvider>
      <TestConsumer />
    </EasterEggProvider>,
  );
}

describe('EasterEggProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders children', () => {
    renderWithProvider();
    expect(screen.getByTestId('can-reveal')).toBeInTheDocument();
  });

  test('provides context with default values', () => {
    renderWithProvider();
    expect(screen.getByTestId('can-reveal')).toHaveTextContent('false');
    expect(screen.getByTestId('shift-held')).toHaveTextContent('false');
  });

  test('recordDesktopBackgroundClick with altKey triggers time machine after 5 clicks', () => {
    renderWithProvider();

    for (let i = 0; i < 5; i++) {
      fireEvent.click(screen.getByTestId('record-bg-click'));
    }

    expect(mocks.markFound).toHaveBeenCalledWith('time-machine-hd');
  });

  test('recordDesktopBackgroundClick without altKey does nothing', () => {
    renderWithProvider();

    for (let i = 0; i < 5; i++) {
      fireEvent.click(screen.getByTestId('record-bg-click-no-alt'));
    }

    expect(mocks.markFound).not.toHaveBeenCalled();
  });

  test('recordTrashClick triggers system crash after 5 clicks', async () => {
    renderWithProvider();
    expect(screen.queryByTestId('crash-overlay')).not.toBeInTheDocument();

    for (let i = 0; i < 5; i++) {
      fireEvent.click(screen.getByTestId('record-trash-click'));
    }

    expect(mocks.markFound).toHaveBeenCalledWith('trash-bomb');
    expect(await screen.findByTestId('crash-overlay')).toBeInTheDocument();
    expect(screen.getByTestId('crash-source')).toHaveTextContent('no-source');
  });

  test('recordTrashClick with sourceRect passes it to overlay', async () => {
    function TestWithRect() {
      const ctx = useEasterEggs();
      return (
        <button
          data-testid="trash-with-rect"
          onClick={() =>
            ctx.recordTrashClick({
              top: 0,
              left: 0,
              right: 100,
              bottom: 100,
              toJSON: () => '',
              x: 0,
              y: 0,
              width: 100,
              height: 100,
            })
          }
        />
      );
    }

    render(
      <EasterEggProvider>
        <TestWithRect />
      </EasterEggProvider>,
    );

    for (let i = 0; i < 5; i++) {
      fireEvent.click(screen.getByTestId('trash-with-rect'));
    }

    expect(await screen.findByTestId('crash-source')).toHaveTextContent('has-source');
  });

  test('system crash overlay can be dismissed', async () => {
    renderWithProvider();

    for (let i = 0; i < 5; i++) {
      fireEvent.click(screen.getByTestId('record-trash-click'));
    }

    expect(await screen.findByTestId('crash-overlay')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('crash-dismiss'));
    expect(screen.queryByTestId('crash-overlay')).not.toBeInTheDocument();
  });

  test('keyboard sequence HYPERCARD triggers hypercard stack', () => {
    renderWithProvider();

    const keys = ['H', 'Y', 'P', 'E', 'R', 'C', 'A', 'R', 'D'];
    for (const key of keys) {
      fireEvent.keyDown(document, { key });
    }

    expect(mocks.markFound).toHaveBeenCalledWith('hypercard-stack');
    expect(mocks.openWindowAnimated).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'hypercardStack' }),
    );
  });

  test('runSpecialAction renders dialog', async () => {
    renderWithProvider();
    expect(screen.queryByTestId('special-dialog')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('run-special'));

    expect(await screen.findByTestId('special-dialog')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-action')).toHaveTextContent(
      'defragment-reality',
    );
  });

  test('special dialog can be closed', async () => {
    renderWithProvider();

    fireEvent.click(screen.getByTestId('run-special'));
    expect(await screen.findByTestId('special-dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('dialog-close'));
    expect(screen.queryByTestId('special-dialog')).not.toBeInTheDocument();
  });
});
