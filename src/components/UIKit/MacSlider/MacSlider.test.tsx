import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MacSlider } from './MacSlider';

describe('MacSlider', () => {
  beforeEach(() => {
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      left: 0,
      top: 0,
      right: 100,
      bottom: 20,
      width: 100,
      height: 20,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders with default props', () => {
    render(<MacSlider value={50} onChange={() => {}} />);
    const slider = screen.getByRole('slider');
    expect(slider).toBeInTheDocument();
    expect(slider).toHaveAttribute('aria-label', 'Slider');
  });

  it('displays correct ARIA attributes', () => {
    render(<MacSlider value={30} min={0} max={100} onChange={() => {}} />);
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-valuenow', '30');
    expect(slider).toHaveAttribute('aria-valuemin', '0');
    expect(slider).toHaveAttribute('aria-valuemax', '100');
  });

  it('calls onChange when ArrowRight is pressed', async () => {
    const handleChange = vi.fn();
    render(<MacSlider value={50} onChange={handleChange} />);

    const slider = screen.getByRole('slider');
    slider.focus();
    await userEvent.keyboard('[ArrowRight]');

    expect(handleChange).toHaveBeenCalledWith(51);
  });

  it('calls onChange when ArrowLeft is pressed', async () => {
    const handleChange = vi.fn();
    render(<MacSlider value={50} onChange={handleChange} />);

    const slider = screen.getByRole('slider');
    slider.focus();
    await userEvent.keyboard('[ArrowLeft]');

    expect(handleChange).toHaveBeenCalledWith(49);
  });

  it('calls onChange with min on Home key', async () => {
    const handleChange = vi.fn();
    render(<MacSlider value={50} min={10} onChange={handleChange} />);

    const slider = screen.getByRole('slider');
    slider.focus();
    await userEvent.keyboard('[Home]');

    expect(handleChange).toHaveBeenCalledWith(10);
  });

  it('calls onChange with max on End key', async () => {
    const handleChange = vi.fn();
    render(<MacSlider value={50} max={200} onChange={handleChange} />);

    const slider = screen.getByRole('slider');
    slider.focus();
    await userEvent.keyboard('[End]');

    expect(handleChange).toHaveBeenCalledWith(200);
  });

  it('clamps value to min/max on keyboard increment', async () => {
    const handleChange = vi.fn();
    function SliderWrapper() {
      return <MacSlider value={98} max={100} onChange={handleChange} />;
    }
    render(<SliderWrapper />);

    const slider = screen.getByRole('slider');
    slider.focus();
    await userEvent.keyboard('[ArrowRight]');

    expect(handleChange).toHaveBeenCalledWith(99);
  });

  it('respects custom step', async () => {
    const handleChange = vi.fn();
    render(<MacSlider value={0} step={10} onChange={handleChange} />);

    const slider = screen.getByRole('slider');
    slider.focus();
    await userEvent.keyboard('[ArrowRight]');

    expect(handleChange).toHaveBeenCalledWith(10);
  });

  it('renders with custom aria-label', () => {
    render(<MacSlider value={50} onChange={() => {}} aria-label="Volume" />);
    expect(screen.getByRole('slider')).toHaveAttribute('aria-label', 'Volume');
  });

  it('handles Escape key with onKeyDown prop', async () => {
    const handleKeyDown = vi.fn();
    render(<MacSlider value={50} onChange={() => {}} onKeyDown={handleKeyDown} />);

    const slider = screen.getByRole('slider');
    slider.focus();
    await userEvent.keyboard('[Escape]');

    expect(handleKeyDown).toHaveBeenCalled();
  });
});
