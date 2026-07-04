import { render, screen } from '@testing-library/react';
import { expect, test, describe } from 'vitest';
import Loader from './Loader';

describe('Loader', () => {
  test('renders without crashing', () => {
    const { container } = render(<Loader />);
    expect(container.firstChild).toBeInTheDocument();
  });

  test('renders SVG with correct dimensions', () => {
    const { container } = render(<Loader />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '512');
    expect(svg).toHaveAttribute('height', '512');
    expect(svg).toHaveAttribute('viewBox', '1 0 32 32');
  });

  test('has aria-hidden on SVG', () => {
    const { container } = render(<Loader />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  test('renders white background rect', () => {
    const { container } = render(<Loader />);
    const rects = container.querySelectorAll('svg > rect');
    const bgRect = Array.from(rects).find((r) => r.getAttribute('fill') === 'white');
    expect(bgRect).toBeInTheDocument();
  });

  test('renders pixel rects for hello strokes', () => {
    const { container } = render(<Loader />);
    const pixels = container.querySelectorAll('svg rect[fill="black"]');
    expect(pixels.length).toBeGreaterThan(0);
  });
});
