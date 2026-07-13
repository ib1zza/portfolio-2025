import type { Position } from "./types";
import { isAutoLayoutRootItemId } from "./layout";

export const STORAGE_KEY = "portfolio-2025-file-system";
export const STORAGE_VERSION = 3;

export const sanitizeStoredPositions = (
  itemPositions: Record<string, Position> = {},
  version = STORAGE_VERSION,
): Record<string, Position> => {
  if (version < 2) return {};

  return Object.fromEntries(
    Object.entries(itemPositions).filter(([id]) => !isAutoLayoutRootItemId(id)),
  );
};

export const readStoredPositions = (): Record<string, Position> => {
  if (typeof window === "undefined") return {};

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};

    const parsed = JSON.parse(stored);
    const version = typeof parsed.version === "number" ? parsed.version : 0;

    return sanitizeStoredPositions(parsed.state?.itemPositions ?? {}, version);
  } catch {
    return {};
  }
};
