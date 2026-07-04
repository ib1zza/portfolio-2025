import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { createRef } from 'react';
import { MacTextInput } from './MacTextInput';

describe('MacTextInput', () => {
  it('renders an input element', () => {
    render(<MacTextInput />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('applies className correctly', () => {
    render(<MacTextInput className="custom-class" />);
    const input = screen.getByRole('textbox');
    expect(input.className).toContain('custom-class');
  });

  it('forwards ref to the input element', () => {
    const ref = createRef<HTMLInputElement>();
    render(<MacTextInput ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('passes through HTML input props', () => {
    render(<MacTextInput placeholder="Enter text" maxLength={10} disabled />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('placeholder', 'Enter text');
    expect(input).toHaveAttribute('maxlength', '10');
    expect(input).toBeDisabled();
  });

  it('handles value and onChange events', async () => {
    const handleChange = vi.fn();
    render(<MacTextInput value="hello" onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'x');

    expect(handleChange).toHaveBeenCalled();
  });

  it('supports controlled value updates', () => {
    const { rerender } = render(<MacTextInput value="initial" readOnly />);
    expect(screen.getByRole('textbox')).toHaveValue('initial');

    rerender(<MacTextInput value="updated" readOnly />);
    expect(screen.getByRole('textbox')).toHaveValue('updated');
  });
});
