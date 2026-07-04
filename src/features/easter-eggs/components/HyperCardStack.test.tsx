import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, describe, vi, beforeEach } from 'vitest';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockReturnValue({ matches: false }),
});

vi.mock('../../../hooks/useHaptics', () => ({
  useHaptics: () => ({
    easterEgg: vi.fn(),
    uiClick: vi.fn(),
  }),
}));

import { HyperCardStack } from './HyperCardStack';

describe('HyperCardStack', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders without crashing', () => {
    render(<HyperCardStack />);
    expect(screen.getByText('Welcome')).toBeInTheDocument();
  });

  test('shows card number', () => {
    render(<HyperCardStack />);
    expect(screen.getByText('card 1')).toBeInTheDocument();
  });

  test('shows navigation with Previous and Next buttons', () => {
    render(<HyperCardStack />);
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
  });

  test('Previous button is disabled on first card', () => {
    render(<HyperCardStack />);
    const prevBtn = screen.getByText('Previous').closest('button');
    expect(prevBtn).toBeDisabled();
  });

  test('navigates to next card', async () => {
    const user = userEvent.setup();
    render(<HyperCardStack />);

    await user.click(screen.getByText('Next'));

    expect(screen.getByText('card 2')).toBeInTheDocument();
  });

  test('shows card body content', () => {
    render(<HyperCardStack />);
    expect(screen.getByText('You have discovered a hidden stack.')).toBeInTheDocument();
  });

  test('shows list items on Tools card', async () => {
    const user = userEvent.setup();
    render(<HyperCardStack />);

    await user.click(screen.getByText('Next'));

    expect(screen.getByText('Tools')).toBeInTheDocument();
  });

  test('shows correct counter', () => {
    render(<HyperCardStack />);
    expect(screen.getByText('1 / 4')).toBeInTheDocument();
  });

  test('Next button is disabled on last card', async () => {
    const user = userEvent.setup();
    render(<HyperCardStack />);

    for (let i = 0; i < 3; i++) {
      await user.click(screen.getByText('Next'));
    }

    const nextBtn = screen.getByText('Next').closest('button');
    expect(nextBtn).toBeDisabled();
  });
});
