import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, describe, vi, beforeEach } from 'vitest';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockReturnValue({ matches: false }),
});

class IntersectionObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);

const mockOpenWindowAnimated = vi.fn();

vi.mock('../WindowOpenAnimation', () => ({
  useWindowOpenAnimation: () => ({
    openWindowAnimated: mockOpenWindowAnimated,
    closeWindowAnimated: vi.fn(),
  }),
}));

const mockSetActive = vi.fn();

vi.mock('../../store/useFileSystem', () => ({
  useFileSystem: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      setActive: mockSetActive,
      items: {},
      removeActive: vi.fn(),
      cleanUpChildren: vi.fn(),
      resetLayout: vi.fn(),
      upsertSavedIconItem: vi.fn(),
    }),
}));

import { ModelViewerApp } from './ModelViewerApp';

describe('ModelViewerApp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders without crashing', () => {
    render(<ModelViewerApp isActive windowId="test-win" />);
    expect(screen.getByText('3D Model Viewer')).toBeInTheDocument();
  });

  test('renders preset selector with project names', () => {
    render(<ModelViewerApp isActive windowId="test-win" />);
    expect(screen.getByText('Simplex Clinic')).toBeInTheDocument();
  });

  test('renders open readme button', () => {
    render(<ModelViewerApp isActive windowId="test-win" />);
    expect(screen.getByText('open readme')).toBeInTheDocument();
  });

  test('open readme calls openWindowAnimated', async () => {
    const user = userEvent.setup();
    render(<ModelViewerApp isActive windowId="test-win" />);

    await user.click(screen.getByText('open readme'));
    expect(mockOpenWindowAnimated).toHaveBeenCalled();
    expect(mockSetActive).toHaveBeenCalled();
  });
});
