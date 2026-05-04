import { createContext, useContext } from "react";
import type { CursorType } from "../types/cursor";

interface CursorContextType {
  cursor: CursorType;
  setCursor: (cursor: CursorType) => void;
  resetCursor: () => void;
}

export const CursorContext = createContext<CursorContextType | undefined>(
  undefined
);

export function useCursor() {
  const context = useContext(CursorContext);

  if (context === undefined) {
    throw new Error("useCursor must be used within a CursorProvider");
  }

  return context;
}
