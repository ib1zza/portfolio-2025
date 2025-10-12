// hooks/useCustomCursor.ts
import { useCursor } from "../contexts/CursorContext";
import type { CursorType } from "../types/cursor";

export const useCustomCursor = () => {
  const { setCursor, resetCursor } = useCursor();

  const withCursor = (cursor: CursorType) => ({
    onMouseEnter: () => setCursor(cursor),
    onMouseLeave: resetCursor,
  });

  return {
    setCursor,
    resetCursor,
    withCursor,
  };
};
