import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockTrigger = vi.fn();
const mockCancel = vi.fn();

vi.mock('web-haptics/react', () => ({
  useWebHaptics: () => ({
    trigger: mockTrigger,
    cancel: mockCancel,
  }),
}));

import { useHaptics } from './useHaptics';

describe('useHaptics', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockTrigger.mockReset();
    mockCancel.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('returns all haptic effect functions', () => {
    const { result } = renderHook(() => useHaptics());

    expect(result.current).toHaveProperty('siteLoaded');
    expect(result.current).toHaveProperty('fileOpen');
    expect(result.current).toHaveProperty('fileClose');
    expect(result.current).toHaveProperty('folderOpen');
    expect(result.current).toHaveProperty('folderClose');
    expect(result.current).toHaveProperty('uiClick');
    expect(result.current).toHaveProperty('dragStart');
    expect(result.current).toHaveProperty('dragEnd');
    expect(result.current).toHaveProperty('success');
    expect(result.current).toHaveProperty('nudge');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('buzz');
    expect(result.current).toHaveProperty('softTap');
    expect(result.current).toHaveProperty('hardTap');
    expect(result.current).toHaveProperty('doubleTap');
    expect(result.current).toHaveProperty('tripleTap');
    expect(result.current).toHaveProperty('easterEgg');
    expect(result.current).toHaveProperty('cancel');
    expect(result.current).toHaveProperty('play');
  });

  it('triggers haptic on uiClick', async () => {
    const { result } = renderHook(() => useHaptics());

    await act(async () => {
      await result.current.uiClick();
    });

    expect(mockTrigger).toHaveBeenCalledOnce();
  });

  it('does not trigger when disabled', async () => {
    const { result } = renderHook(() => useHaptics({ disabled: true }));

    await act(async () => {
      await result.current.uiClick();
    });

    expect(mockTrigger).not.toHaveBeenCalled();
  });

  it('respects throttleMs', async () => {
    const { result } = renderHook(() => useHaptics({ throttleMs: 1000 }));

    await act(async () => {
      await result.current.uiClick();
      await result.current.uiClick();
    });

    expect(mockTrigger).toHaveBeenCalledTimes(1);
  });

  it('allows plays after throttle period', async () => {
    const { result } = renderHook(() => useHaptics({ throttleMs: 100 }));

    await act(async () => {
      await result.current.uiClick();
    });

    vi.advanceTimersByTime(200);

    await act(async () => {
      await result.current.uiClick();
    });

    expect(mockTrigger).toHaveBeenCalledTimes(2);
  });

  it('siteLoaded plays on mount when playOnMount is true', () => {
    renderHook(() => useHaptics({ playOnMount: true, startupDelayMs: 100 }));

    expect(mockTrigger).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);

    expect(mockTrigger).toHaveBeenCalled();
  });

  it('does not play on mount when playOnMount is false', () => {
    renderHook(() => useHaptics({ playOnMount: false }));

    vi.advanceTimersByTime(1000);

    expect(mockTrigger).not.toHaveBeenCalled();
  });

  it('cancels the startup timeout on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');
    const { unmount } = renderHook(() => useHaptics({ playOnMount: true, startupDelayMs: 500 }));

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it('easterEgg plays happyMac pattern', async () => {
    const { result } = renderHook(() => useHaptics());

    await act(async () => {
      await result.current.easterEgg('happyMac');
    });

    expect(mockTrigger).toHaveBeenCalledOnce();
  });

  it('easterEgg plays startupChime by default', async () => {
    const { result } = renderHook(() => useHaptics());

    await act(async () => {
      await result.current.easterEgg();
    });

    expect(mockTrigger).toHaveBeenCalledOnce();
  });

  it('play function accepts a number', async () => {
    const { result } = renderHook(() => useHaptics());

    await act(async () => {
      await result.current.play(50, 0.5);
    });

    expect(mockTrigger).toHaveBeenCalledWith(50, { intensity: 0.5 });
  });

  it('clamps intensity value between 0 and 1', async () => {
    const { result } = renderHook(() => useHaptics({ throttleMs: 0 }));

    await act(async () => {
      await result.current.play('nudge', 2.5);
    });

    expect(mockTrigger).toHaveBeenCalledWith('nudge', { intensity: 1 });

    await act(async () => {
      await result.current.play('nudge', -1);
    });

    expect(mockTrigger).toHaveBeenCalledWith('nudge', { intensity: 0 });
  });
});
