import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MacProgress } from './MacProgress';

describe('MacProgress', () => {
  it('renders with default props', () => {
    const { container } = render(<MacProgress value={50} />);
    const progress = container.firstChild as HTMLElement;
    expect(progress).toBeInTheDocument();
    expect(progress).toHaveAttribute('role', 'progressbar');
    expect(progress).toHaveAttribute('aria-label', 'Progress');
  });

  it('displays correct ARIA attributes for given value', () => {
    render(<MacProgress value={50} min={0} max={100} />);
    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveAttribute('aria-valuenow', '50');
    expect(progress).toHaveAttribute('aria-valuemin', '0');
    expect(progress).toHaveAttribute('aria-valuemax', '100');
  });

  it('clamps value to min/max range', () => {
    render(<MacProgress value={200} min={0} max={100} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });

  it('clamps value below min', () => {
    render(<MacProgress value={-10} min={0} max={100} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('handles range where min equals max', () => {
    const { container } = render(<MacProgress value={50} min={100} max={100} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders in vertical orientation', () => {
    const { container } = render(<MacProgress value={50} orientation="vertical" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders custom aria-label', () => {
    render(<MacProgress value={50} aria-label="Loading" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-label', 'Loading');
  });

  it('renders fill indicator', () => {
    const { container } = render(<MacProgress value={50} />);
    const fill = container.querySelector('span');
    expect(fill).toBeInTheDocument();
    expect(fill).toHaveAttribute('aria-hidden', 'true');
  });
});
