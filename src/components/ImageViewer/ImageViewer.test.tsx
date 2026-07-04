import { render, screen, act } from '@testing-library/react';
import { expect, test, describe, vi, beforeEach } from 'vitest';

vi.mock('../../utils/assets', () => ({
  getAssetPath: (path: string) => `/base/${path}`,
}));

vi.mock('../DitherStudio/ditherCanvas', () => ({
  drawDitheredImage: vi.fn(),
}));

import { ImageViewer } from './ImageViewer';

describe('ImageViewer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('shows loading state when no fileUrl', () => {
    render(<ImageViewer windowId="test" />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
