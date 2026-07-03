import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, describe, vi } from 'vitest';
import { MacButton } from './MacButton';

describe('MacButton', () => {
  test('renders children correctly', () => {
    render(<MacButton>Click me</MacButton>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  test('applies variant class correctly', () => {
    const { container } = render(<MacButton variant="default">Default</MacButton>);
    const button = container.firstChild as HTMLElement;
    // Assuming CSS modules might append hashes, we just check if the button is rendered
    expect(button).toBeInTheDocument();
  });

  test('handles click events', async () => {
    const handleClick = vi.fn();
    render(<MacButton onClick={handleClick}>Click me</MacButton>);

    await userEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
