import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, describe, vi, beforeEach } from 'vitest';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockReturnValue({ matches: false }),
});

vi.mock('../../store/useFileSystem', () => ({
  useFileSystem: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      upsertSavedIconItem: vi.fn(),
      items: {},
      removeActive: vi.fn(),
      setActive: vi.fn(),
      cleanUpChildren: vi.fn(),
      resetLayout: vi.fn(),
    }),
}));

vi.mock('./ditherCanvas', () => ({
  drawDitheredImage: vi.fn(),
}));

vi.mock('./ditherExport', () => ({
  downloadText: vi.fn(),
  getSvgFromCanvas: vi.fn(() => '<svg></svg>'),
}));

vi.mock('../IconPainter/iconPainterDesktop', () => ({
  saveIconToDesktop: vi.fn(() => ({ id: 'test-icon', name: 'Icon', pixels: [], updatedAt: Date.now() })),
}));

import { DitherStudio } from './DitherStudio';

describe('DitherStudio', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders without crashing', () => {
    render(<DitherStudio />);
    expect(screen.getByText('Dither Studio')).toBeInTheDocument();
  });

  test('renders canvas element', () => {
    const { container } = render(<DitherStudio />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  test('renders mode selector', () => {
    render(<DitherStudio />);
    expect(screen.getByText('Mode:')).toBeInTheDocument();
  });

  test('renders size selector', () => {
    render(<DitherStudio />);
    expect(screen.getByText('Size:')).toBeInTheDocument();
  });

  test('renders open button for file loading', () => {
    render(<DitherStudio />);
    expect(screen.getByText('open')).toBeInTheDocument();
  });

  test('renders clear button', () => {
    render(<DitherStudio />);
    expect(screen.getByText('clear')).toBeInTheDocument();
  });

  test('renders invert toggle', () => {
    render(<DitherStudio />);
    expect(screen.getByText('invert')).toBeInTheDocument();
  });

  test('renders export button', () => {
    render(<DitherStudio />);
    expect(screen.getByText('export')).toBeInTheDocument();
  });

  test('renders copy button', () => {
    render(<DitherStudio />);
    expect(screen.getByText('copy')).toBeInTheDocument();
  });

  test('renders save as icon button', () => {
    render(<DitherStudio />);
    expect(screen.getByText('save as icon')).toBeInTheDocument();
  });

  test('export button is disabled when no image loaded', () => {
    render(<DitherStudio />);
    const exportBtn = screen.getByText('export').closest('button');
    expect(exportBtn).toBeDisabled();
  });

  test('clear button is disabled when no image loaded', () => {
    render(<DitherStudio />);
    const clearBtn = screen.getByText('clear').closest('button');
    expect(clearBtn).toBeDisabled();
  });

  test('renders threshold slider', () => {
    render(<DitherStudio />);
    expect(screen.getByLabelText('Threshold')).toBeInTheDocument();
  });

  test('renders contrast slider', () => {
    render(<DitherStudio />);
    expect(screen.getByLabelText('Contrast')).toBeInTheDocument();
  });
});
