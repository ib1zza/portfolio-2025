import { render, screen } from '@testing-library/react';
import { expect, test, describe, vi } from 'vitest';

import { EasterEggContext, useEasterEggs } from './EasterEggContext';
import type { EasterEggContextValue } from './EasterEggContext';

function TestConsumer() {
  const ctx = useEasterEggs();
  return <div data-testid="shift-held">{String(ctx.isShiftHeld)}</div>;
}

describe('EasterEggContext', () => {
  test('provides value to consumers', () => {
    const mockValue: EasterEggContextValue = {
      canRevealLastDisk: false,
      isShiftHeld: true,
      recordDesktopBackgroundClick: vi.fn(),
      recordItemOpenRequest: vi.fn(),
      recordTrashClick: vi.fn(),
      revealLastDiskFromSpecial: vi.fn(),
      runSpecialAction: vi.fn(),
    };

    render(
      <EasterEggContext.Provider value={mockValue}>
        <TestConsumer />
      </EasterEggContext.Provider>,
    );

    expect(screen.getByTestId('shift-held')).toHaveTextContent('true');
  });

  test('useEasterEggs throws outside provider', () => {
    expect(() => render(<TestConsumer />)).toThrow(
      'useEasterEggs must be used inside EasterEggProvider',
    );
  });
});
