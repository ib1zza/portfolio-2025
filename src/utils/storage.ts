import type { StateStorage } from "zustand/middleware";

interface VersionedStorage<T> {
  data: T;
  version: number;
}

const pendingWrites = new Map<
  string,
  {
    timeoutId: number;
    value: string;
  }
>();
let hasFlushListener = false;

const flush = (name: string) => {
  const pending = pendingWrites.get(name);
  if (!pending || typeof window === "undefined") return;

  window.clearTimeout(pending.timeoutId);
  window.localStorage.setItem(name, pending.value);
  pendingWrites.delete(name);
};

const ensureStorageFlushListener = () => {
  if (hasFlushListener || typeof window === "undefined") return;

  window.addEventListener("beforeunload", () => {
    Array.from(pendingWrites.keys()).forEach(flush);
  });
  hasFlushListener = true;
};

const scheduleLocalStorageWrite = (name: string, value: string, delay: number) => {
  ensureStorageFlushListener();

  const current = pendingWrites.get(name);
  if (current) {
    current.value = value;
    return;
  }

  const timeoutId = window.setTimeout(() => {
    window.localStorage.setItem(name, value);
    pendingWrites.delete(name);
  }, delay);

  pendingWrites.set(name, { timeoutId, value });
};

export const createThrottledLocalStorage = (delay = 250): StateStorage => {
  ensureStorageFlushListener();

  return {
    getItem: (name) => {
      flush(name);
      return window.localStorage.getItem(name);
    },
    removeItem: (name) => {
      flush(name);
      window.localStorage.removeItem(name);
    },
    setItem: (name, value) => {
      scheduleLocalStorageWrite(name, value, delay);
    },
  };
};

export const readVersionedStorage = <T>(
  key: string,
  version: number,
  fallback: T,
  migrate?: (stored: unknown) => T,
) => {
  if (typeof window === "undefined") return fallback;

  try {
    const stored = window.localStorage.getItem(key);
    if (!stored) return fallback;

    const parsed = JSON.parse(stored) as VersionedStorage<T> | unknown;

    if (
      parsed &&
      typeof parsed === "object" &&
      "version" in parsed &&
      "data" in parsed &&
      (parsed as VersionedStorage<T>).version === version
    ) {
      return (parsed as VersionedStorage<T>).data;
    }

    return migrate?.(parsed) ?? fallback;
  } catch {
    return fallback;
  }
};

export const writeVersionedStorage = <T>(
  key: string,
  version: number,
  data: T,
  delay = 250,
) => {
  if (typeof window === "undefined") return;

  const value = JSON.stringify({ version, data });
  scheduleLocalStorageWrite(key, value, delay);
};
