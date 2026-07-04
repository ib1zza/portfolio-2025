import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { MacPromptDialog } from './MacPromptDialog';

describe('MacPromptDialog', () => {
  const defaultProps = {
    initialValue: 'test',
    label: 'Name',
    title: 'Enter Name',
    onCancel: vi.fn(),
    onConfirm: vi.fn(),
  };

  it('renders with given title and label', () => {
    render(<MacPromptDialog {...defaultProps} />);
    expect(screen.getByText('Enter Name')).toBeInTheDocument();
    expect(screen.getByText('Name:')).toBeInTheDocument();
  });

  it('displays initial value in input', () => {
    render(<MacPromptDialog {...defaultProps} />);
    expect(screen.getByRole('textbox')).toHaveValue('test');
  });

  it('calls onConfirm with the input value on form submit', async () => {
    const handleConfirm = vi.fn();
    render(<MacPromptDialog {...defaultProps} onConfirm={handleConfirm} />);

    await userEvent.click(screen.getByText('OK'));

    expect(handleConfirm).toHaveBeenCalledWith('test');
  });

  it('calls onConfirm with updated value after editing', async () => {
    const handleConfirm = vi.fn();
    render(<MacPromptDialog {...defaultProps} onConfirm={handleConfirm} />);

    const input = screen.getByRole('textbox');
    await userEvent.clear(input);
    await userEvent.type(input, 'new value');
    await userEvent.click(screen.getByText('OK'));

    expect(handleConfirm).toHaveBeenCalledWith('new value');
  });

  it('calls onCancel when Escape is pressed', async () => {
    const handleCancel = vi.fn();
    render(<MacPromptDialog {...defaultProps} onCancel={handleCancel} />);

    const input = screen.getByRole('textbox');
    input.focus();
    await userEvent.keyboard('[Escape]');

    expect(handleCancel).toHaveBeenCalled();
  });

  it('disables OK button when value is empty (whitespace only)', () => {
    render(<MacPromptDialog {...defaultProps} initialValue="   " />);
    const okButton = screen.getByText('OK').closest('button');
    expect(okButton).toBeDisabled();
  });

  it('renders with dialog role and aria-modal', () => {
    const { container } = render(<MacPromptDialog {...defaultProps} />);
    const dialog = container.querySelector('[role="dialog"]');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });
});
