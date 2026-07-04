import { render, screen } from '@testing-library/react';
import { expect, test, describe, vi, beforeEach } from 'vitest';

const mockWindow = {
  id: 'test-win',
  title: 'Test Window',
  position: { x: 100, y: 100 },
  size: { width: 400, height: 300 },
  minSize: { width: 200, height: 150 },
  zIndex: 10,
  isFocused: true,
  parentId: null,
  openerWindowId: null,
  app: null,
  resizable: true,
  windowVariant: 'default' as const,
  fileUrl: undefined,
  savedIconId: undefined,
};

vi.mock('../../store/useWindowManager', () => ({
  useWindowManager: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      windows: { 'test-win': mockWindow },
      focusedWindowId: 'test-win',
      focusWindow: vi.fn(),
      moveWindow: vi.fn(),
      closeWindow: vi.fn(),
    }),
}));

vi.mock('../WindowOpenAnimation', () => ({
  useWindowOpenAnimation: () => ({
    openWindowAnimated: vi.fn(),
    closeWindowAnimated: vi.fn(),
  }),
}));

import { WindowContainer } from './WindowContainer';

describe('WindowContainer', () => {
  test('renders Window for existing id', () => {
    render(<WindowContainer id="test-win" />);
    expect(screen.getByText('Test Window')).toBeInTheDocument();
  });

  test('returns null for unknown id', () => {
    const { container } = render(<WindowContainer id="unknown" />);
    expect(container.firstChild).toBeNull();
  });
});
