import { render, screen, fireEvent } from '@testing-library/react';
import { expect, test, describe, vi, beforeEach } from 'vitest';
import { Terminal } from './Terminal';

// Mock zustand stores
vi.mock('../../store/useFileSystem', () => ({
  useFileSystem: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      items: {
        root: {
          id: 'root',
          name: 'root',
          type: 'folder',
          parentId: null,
          children: ['file1'],
        },
        file1: {
          id: 'file1',
          name: 'readme.txt',
          type: 'file',
          parentId: 'root',
          content: 'Hello World',
        },
      },
    }),
}));

vi.mock('../../store/useWindowManager', () => ({
  useWindowManager: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      openWindow: vi.fn(),
      unfocusAll: vi.fn(),
    }),
}));

vi.mock('../../hooks/useHaptics', () => ({
  useHaptics: () => ({
    uiClick: vi.fn(),
    siteLoaded: vi.fn(),
  }),
}));

vi.mock('../../features/easter-eggs/useEasterEggProgress', () => ({
  useEasterEggProgress: () => ({
    markFound: vi.fn(),
  }),
}));

describe('Terminal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders terminal with system welcome message and prompt', () => {
    render(<Terminal windowId="test-terminal" />);
    
    // Should render welcome title
    expect(screen.getByText(/Macintosh System/i)).toBeInTheDocument();
    // Should render default prompt
    expect(screen.getByText(/macintosh:\/ >/i)).toBeInTheDocument();
  });

  test('executes help command', () => {
    render(<Terminal windowId="test-terminal" />);
    const input = screen.getByRole('textbox');
    
    fireEvent.change(input, { target: { value: 'help' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    // Command output should be rendered
    expect(screen.getByText(/List directory contents/i)).toBeInTheDocument();
  });

  test('executes about command', () => {
    render(<Terminal windowId="test-terminal" />);
    const input = screen.getByRole('textbox');
    
    fireEvent.change(input, { target: { value: 'about' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    expect(screen.getByText(/Processor: Motorola MC68040 @ 33 MHz/i)).toBeInTheDocument();
  });

  test('executes cls/clear command', () => {
    render(<Terminal windowId="test-terminal" />);
    const input = screen.getByRole('textbox');
    
    // Run a command to generate output first
    fireEvent.change(input, { target: { value: 'help' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    expect(screen.getByText(/List directory contents/i)).toBeInTheDocument();
    
    // Clear screen
    fireEvent.change(input, { target: { value: 'clear' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    // Output should be removed
    expect(screen.queryByText(/List directory contents/i)).not.toBeInTheDocument();
  });
});
