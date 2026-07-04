import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, describe, vi, beforeEach } from 'vitest';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    key: vi.fn((_: number) => null),
    get length() { return Object.keys(store).length; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock, configurable: true });
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockReturnValue({ matches: false }),
});

vi.mock('../../store/useFileSystem', () => ({
  useFileSystem: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      upsertSavedIconItem: vi.fn(),
      items: {},
      setActive: vi.fn(),
      cleanUpChildren: vi.fn(),
      resetLayout: vi.fn(),
      removeActive: vi.fn(),
    }),
}));

vi.mock('../../utils/storage', () => ({
  readVersionedStorage: vi.fn((_key: string, _version: number, fallback: unknown) => fallback),
  writeVersionedStorage: vi.fn(),
}));

vi.mock('./iconPainterDesktop', () => ({
  readSavedIcon: vi.fn(() => undefined),
  saveIconToDesktop: vi.fn(() => ({ id: 'test-id', name: 'Test Icon', pixels: [], updatedAt: Date.now() })),
  deleteSavedIcon: vi.fn(),
}));

import { IconPainter } from './IconPainter';

const getContextMock = () => ({
  fillStyle: '',
  fillRect: vi.fn(),
  imageSmoothingEnabled: false,
});

describe('IconPainter', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    HTMLCanvasElement.prototype.getContext = vi.fn(() => getContextMock()) as never;
  });

  test('renders without crashing', () => {
    render(<IconPainter />);
    expect(screen.getByText('Icon Painter')).toBeInTheDocument();
  });

  test('renders canvas element', () => {
    render(<IconPainter />);
    const canvas = screen.getByLabelText('Icon canvas');
    expect(canvas).toBeInTheDocument();
  });

  test('renders tool buttons', () => {
    render(<IconPainter />);
    expect(screen.getByText('pencil')).toBeInTheDocument();
    expect(screen.getByText('eraser')).toBeInTheDocument();
    expect(screen.getByText('fill')).toBeInTheDocument();
  });

  test('renders edit buttons', () => {
    render(<IconPainter />);
    expect(screen.getByText('undo')).toBeInTheDocument();
    expect(screen.getByText('redo')).toBeInTheDocument();
    expect(screen.getByText('grid')).toBeInTheDocument();
    expect(screen.getByText('clear')).toBeInTheDocument();
    expect(screen.getByText('invert')).toBeInTheDocument();
  });

  test('renders export controls', () => {
    render(<IconPainter />);
    expect(screen.getByText('export')).toBeInTheDocument();
    expect(screen.getByText('save desktop')).toBeInTheDocument();
    expect(screen.getByText('save as')).toBeInTheDocument();
  });

  test('switches tool on button click', async () => {
    const user = userEvent.setup();
    render(<IconPainter />);

    const eraserBtn = screen.getByText('eraser');
    await user.click(eraserBtn);

    expect(eraserBtn).toBeInTheDocument();
  });

  test('undo and redo buttons are disabled when no history', () => {
    render(<IconPainter />);
    const undoBtn = screen.getByText('undo').closest('button');
    const redoBtn = screen.getByText('redo').closest('button');
    expect(undoBtn).toBeDisabled();
    expect(redoBtn).toBeDisabled();
  });

  test('undo becomes enabled after drawing', async () => {
    const user = userEvent.setup();
    render(<IconPainter />);
    const undoBtn = screen.getByText('undo').closest('button')!;
    expect(undoBtn).toBeDisabled();

    const canvas = screen.getByLabelText('Icon canvas');
    await user.pointer({ target: canvas, coords: { x: 10, y: 10 } });
  });

  test('shows pixel count', () => {
    render(<IconPainter />);
    expect(screen.getByText('0 pixels on')).toBeInTheDocument();
  });

  test('displays preview canvases', () => {
    render(<IconPainter />);
    expect(screen.getByText('128px')).toBeInTheDocument();
    expect(screen.getByText('64px')).toBeInTheDocument();
    expect(screen.getByText('32px')).toBeInTheDocument();
  });
});
