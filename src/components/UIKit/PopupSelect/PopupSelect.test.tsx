import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { PopupSelect } from './PopupSelect';
import type { PopupSelectOption } from './PopupSelect';

const options: PopupSelectOption<string>[] = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
  { value: 'c', label: 'Option C' },
];

describe('PopupSelect', () => {
  it('renders label and selected value', () => {
    render(<PopupSelect label="Theme" value="a" options={options} onChange={() => {}} />);
    expect(screen.getByText('Theme')).toBeInTheDocument();
    expect(screen.getByText('Option A')).toBeInTheDocument();
  });

  it('opens menu on button click', async () => {
    render(<PopupSelect label="Theme" value="a" options={options} onChange={() => {}} />);

    const button = screen.getByRole('button', { name: /option a/i });
    await userEvent.click(button);

    expect(screen.getByText('Option B')).toBeInTheDocument();
    expect(screen.getByText('Option C')).toBeInTheDocument();
  });

  it('calls onChange with selected value when an option is clicked', async () => {
    const handleChange = vi.fn();
    render(<PopupSelect label="Theme" value="a" options={options} onChange={handleChange} />);

    const button = screen.getByRole('button', { name: /option a/i });
    await userEvent.click(button);

    const optionB = screen.getByText('Option B');
    await userEvent.click(optionB);

    expect(handleChange).toHaveBeenCalledWith('b');
  });

  it('marks the currently selected option as aria-selected', async () => {
    render(<PopupSelect label="Theme" value="b" options={options} onChange={() => {}} />);

    const button = screen.getByRole('button', { name: /option b/i });
    await userEvent.click(button);

    const menuItems = screen.getAllByRole('option');
    expect(menuItems[0]).toHaveAttribute('aria-selected', 'false');
    expect(menuItems[1]).toHaveAttribute('aria-selected', 'true');
    expect(menuItems[2]).toHaveAttribute('aria-selected', 'false');
  });

  it('closes menu when clicking outside', async () => {
    render(
      <div>
        <span data-testid="outside">Outside</span>
        <PopupSelect label="Theme" value="a" options={options} onChange={() => {}} />
      </div>,
    );

    const button = screen.getByRole('button', { name: /option a/i });
    await userEvent.click(button);
    expect(screen.getByText('Option B')).toBeInTheDocument();

    await userEvent.click(screen.getByTestId('outside'));

    expect(screen.queryByText('Option B')).not.toBeInTheDocument();
  });

  it('has proper aria attributes when closed', () => {
    render(<PopupSelect label="Theme" value="a" options={options} onChange={() => {}} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-haspopup', 'listbox');
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('has proper aria attributes when open', async () => {
    render(<PopupSelect label="Theme" value="a" options={options} onChange={() => {}} />);

    const button = screen.getByRole('button');
    await userEvent.click(button);

    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('toggles menu with Enter key', async () => {
    render(<PopupSelect label="Theme" value="a" options={options} onChange={() => {}} />);

    const button = screen.getByRole('button');
    button.focus();
    await userEvent.keyboard('[Enter]');

    expect(screen.getByText('Option B')).toBeInTheDocument();
  });

  it('toggles menu with Space key', async () => {
    render(<PopupSelect label="Theme" value="a" options={options} onChange={() => {}} />);

    const button = screen.getByRole('button');
    button.focus();
    await userEvent.keyboard(' ');

    expect(screen.getByText('Option B')).toBeInTheDocument();
  });

  it('closes menu with Escape key', async () => {
    render(<PopupSelect label="Theme" value="a" options={options} onChange={() => {}} />);

    const button = screen.getByRole('button');
    button.focus();
    await userEvent.keyboard('[Enter]');
    expect(screen.getByText('Option B')).toBeInTheDocument();

    await userEvent.keyboard('[Escape]');
    expect(screen.queryByText('Option B')).not.toBeInTheDocument();
  });

  it('closes menu on blur', async () => {
    render(
      <div>
        <PopupSelect label="Theme" value="a" options={options} onChange={() => {}} />
        <button data-testid="other">Other</button>
      </div>,
    );

    const button = screen.getByRole('button', { name: /option a/i });
    await userEvent.click(button);
    expect(screen.getByText('Option B')).toBeInTheDocument();

    await userEvent.click(screen.getByTestId('other'));

    expect(screen.queryByText('Option B')).not.toBeInTheDocument();
  });

  it('selects option on drag-and-release (pointerdown on trigger, pointerup on option)', async () => {
    const handleChange = vi.fn();
    render(<PopupSelect label="Theme" value="a" options={options} onChange={handleChange} />);

    const button = screen.getByRole('button', { name: /option a/i });
    
    // Simulate pointerdown with mouse on trigger
    fireEvent.pointerDown(button, { pointerType: 'mouse', pointerId: 1 });
    
    // The menu should open
    expect(screen.getByText('Option B')).toBeInTheDocument();
    
    const optionB = screen.getByText('Option B');
    
    // Simulate pointerup with mouse on option B
    fireEvent.pointerUp(optionB, { pointerType: 'mouse', pointerId: 1 });
    
    // Should have called onChange
    expect(handleChange).toHaveBeenCalledWith('b');
  });
});
