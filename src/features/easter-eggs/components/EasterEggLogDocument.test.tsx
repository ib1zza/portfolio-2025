import { render, screen } from '@testing-library/react';
import { expect, test, describe, vi } from 'vitest';

vi.mock('../useEasterEggProgress', () => ({
  useEasterEggProgress: (selector: (s: { foundEggIds: string[] }) => unknown) =>
    selector({ foundEggIds: ['hypercard-stack', 'time-machine-hd'] }),
}));

vi.mock('../../../components/UIKit', () => ({
  MacProgress: ({ value, max }: { value: number; max: number }) => (
    <div data-testid="progress">{value}/{max}</div>
  ),
}));

import { EasterEggLogDocument } from './EasterEggLogDocument';

describe('EasterEggLogDocument', () => {
  test('shows found count', () => {
    render(<EasterEggLogDocument />);
    expect(screen.getByText('Found 2 of 5')).toBeInTheDocument();
  });

  test('shows progress', () => {
    render(<EasterEggLogDocument />);
    expect(screen.getByTestId('progress')).toHaveTextContent('2/5');
  });

  test('renders found egg labels', () => {
    render(<EasterEggLogDocument />);
    expect(screen.getByText('HyperCard Stack')).toBeInTheDocument();
    expect(screen.getByText('Time Machine HD')).toBeInTheDocument();
  });
});
