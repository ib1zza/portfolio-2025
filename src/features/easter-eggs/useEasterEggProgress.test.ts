import { expect, test, describe, vi } from 'vitest';

vi.mock('../../utils/storage', () => ({
  createThrottledLocalStorage: () => ({
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  }),
}));

import { useEasterEggProgress } from './useEasterEggProgress';

describe('useEasterEggProgress', () => {
  beforeEach(() => {
    useEasterEggProgress.setState({ foundEggIds: [] });
  });

  test('initializes with empty foundEggIds', () => {
    const state = useEasterEggProgress.getState();
    expect(state.foundEggIds).toEqual([]);
  });

  test('markFound adds egg id', () => {
    const { markFound } = useEasterEggProgress.getState();
    markFound('hypercard-stack');
    expect(useEasterEggProgress.getState().foundEggIds).toContain('hypercard-stack');
  });

  test('markFound is no-op when egg already found', () => {
    useEasterEggProgress.setState({ foundEggIds: ['hypercard-stack'] });
    const { markFound } = useEasterEggProgress.getState();
    markFound('hypercard-stack');
    expect(useEasterEggProgress.getState().foundEggIds).toEqual(['hypercard-stack']);
  });

  test('markFound adds multiple unique eggs', () => {
    const { markFound } = useEasterEggProgress.getState();
    markFound('hypercard-stack');
    markFound('time-machine-hd');
    markFound('special-menu');
    expect(useEasterEggProgress.getState().foundEggIds).toHaveLength(3);
  });
});
