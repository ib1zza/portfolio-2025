import { render, screen, renderHook, act } from '@testing-library/react';
import { expect, test, describe, vi } from 'vitest';
import type { ReactNode } from 'react';

import { CursorProvider } from './CursorContext';
import { useCursor } from './cursor';

function TestConsumer() {
  const { cursor, setCursor, resetCursor, startCursorOverride } = useCursor();
  return (
    <div>
      <span data-testid="cursor">{cursor}</span>
      <button data-testid="set-pointer" onClick={() => setCursor('pointer')}>set pointer</button>
      <button data-testid="set-crosshair" onClick={() => setCursor('crosshair')}>set crosshair</button>
      <button data-testid="reset" onClick={resetCursor}>reset</button>
      <button data-testid="override" onClick={() => startCursorOverride('pointer')}>override</button>
    </div>
  );
}

describe('CursorProvider', () => {
  test('renders children', () => {
    render(
      <CursorProvider>
        <div data-testid="child">child</div>
      </CursorProvider>,
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  test('provides default cursor as arrow', () => {
    render(
      <CursorProvider>
        <TestConsumer />
      </CursorProvider>,
    );
    expect(screen.getByTestId('cursor')).toHaveTextContent('arrow');
  });

  test('setCursor updates cursor', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();
    render(
      <CursorProvider>
        <TestConsumer />
      </CursorProvider>,
    );
    await user.click(screen.getByTestId('set-pointer'));
    expect(screen.getByTestId('cursor')).toHaveTextContent('pointer');
  });

  test('resetCursor reverts to arrow', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();
    render(
      <CursorProvider>
        <TestConsumer />
      </CursorProvider>,
    );
    await user.click(screen.getByTestId('set-crosshair'));
    expect(screen.getByTestId('cursor')).toHaveTextContent('crosshair');
    await user.click(screen.getByTestId('reset'));
    expect(screen.getByTestId('cursor')).toHaveTextContent('arrow');
  });

  test('startCursorOverride overrides cursor and release reverts', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <CursorProvider>{children}</CursorProvider>
    );
    const { result } = renderHook(() => useCursor(), { wrapper });

    act(() => {
      result.current.setCursor('crosshair');
    });
    expect(result.current.cursor).toBe('crosshair');

    let release: () => void;
    act(() => {
      release = result.current.startCursorOverride('pointer');
    });
    expect(result.current.cursor).toBe('pointer');

    act(() => {
      release();
    });
    expect(result.current.cursor).toBe('crosshair');
  });
});
