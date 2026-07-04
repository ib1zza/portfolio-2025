import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createThrottledLocalStorage, readVersionedStorage, writeVersionedStorage } from './storage';

const createMockLocalStorage = () => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    getStore: () => store,
  };
};

describe('createThrottledLocalStorage', () => {
  let mockStorage: ReturnType<typeof createMockLocalStorage>;

  beforeEach(() => {
    vi.useFakeTimers();
    mockStorage = createMockLocalStorage();
    Object.defineProperty(window, 'localStorage', { value: mockStorage, configurable: true });
    vi.stubGlobal('window', window);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('returns a StateStorage object with getItem, setItem, removeItem', () => {
    const storage = createThrottledLocalStorage(100);
    expect(storage).toHaveProperty('getItem');
    expect(storage).toHaveProperty('setItem');
    expect(storage).toHaveProperty('removeItem');
  });

  it('getItem flushes pending writes and reads from localStorage', () => {
    const storage = createThrottledLocalStorage(100);
    mockStorage.setItem('key1', 'value1');

    const result = storage.getItem('key1');
    expect(result).toBe('value1');
  });

  it('setItem throttles writes to localStorage', () => {
    const storage = createThrottledLocalStorage(100);
    storage.setItem('key2', 'value2');

    expect(mockStorage.setItem).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(mockStorage.setItem).toHaveBeenCalledWith('key2', 'value2');
  });

  it('removeItem flushes pending writes and removes from localStorage', () => {
    const storage = createThrottledLocalStorage(100);
    mockStorage.setItem('key3', 'value3');

    storage.removeItem('key3');
    expect(mockStorage.removeItem).toHaveBeenCalledWith('key3');
  });

  it('updates pending value without scheduling new timeout', () => {
    const storage = createThrottledLocalStorage(100);
    storage.setItem('key4', 'first');
    storage.setItem('key4', 'second');

    vi.advanceTimersByTime(100);
    expect(mockStorage.setItem).toHaveBeenCalledTimes(1);
    expect(mockStorage.setItem).toHaveBeenCalledWith('key4', 'first');
  });
});

describe('readVersionedStorage', () => {
  let mockStorage: ReturnType<typeof createMockLocalStorage>;

  beforeEach(() => {
    mockStorage = createMockLocalStorage();
    Object.defineProperty(window, 'localStorage', { value: mockStorage, configurable: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns fallback when key does not exist', () => {
    expect(readVersionedStorage('nonexistent', 1, 'fallback')).toBe('fallback');
  });

  it('returns parsed data when version matches', () => {
    mockStorage.setItem('test', JSON.stringify({ version: 1, data: 'hello' }));
    expect(readVersionedStorage('test', 1, 'fallback')).toBe('hello');
  });

  it('calls migrate and returns its result when version mismatches', () => {
    mockStorage.setItem('test', JSON.stringify({ version: 1, data: 'old' }));
    const migrate = vi.fn(() => 'migrated');
    expect(readVersionedStorage('test', 2, 'fallback', migrate)).toBe('migrated');
    expect(migrate).toHaveBeenCalledWith({ version: 1, data: 'old' });
  });

  it('returns fallback when stored data is invalid JSON', () => {
    mockStorage.setItem('test', '{invalid}');
    expect(readVersionedStorage('test', 1, 'fallback')).toBe('fallback');
  });

  it('returns fallback when window is undefined', () => {
    const origWindow = globalThis.window;
    Object.defineProperty(globalThis, 'window', { value: undefined, configurable: true });

    expect(readVersionedStorage('test', 1, 'fallback')).toBe('fallback');

    Object.defineProperty(globalThis, 'window', { value: origWindow, configurable: true });
  });
});

describe('writeVersionedStorage', () => {
  let mockStorage: ReturnType<typeof createMockLocalStorage>;

  beforeEach(() => {
    vi.useFakeTimers();
    mockStorage = createMockLocalStorage();
    Object.defineProperty(window, 'localStorage', { value: mockStorage, configurable: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('writes versioned data to localStorage after delay', () => {
    writeVersionedStorage('test', 1, { foo: 'bar' }, 100);
    expect(mockStorage.setItem).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(mockStorage.setItem).toHaveBeenCalledWith(
      'test',
      JSON.stringify({ version: 1, data: { foo: 'bar' } }),
    );
  });

  it('does not throw when window is undefined', () => {
    const origWindow = globalThis.window;
    Object.defineProperty(globalThis, 'window', { value: undefined, configurable: true });

    expect(() => writeVersionedStorage('test', 1, 'data')).not.toThrow();

    Object.defineProperty(globalThis, 'window', { value: origWindow, configurable: true });
  });
});
