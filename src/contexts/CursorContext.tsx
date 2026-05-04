import { useState } from "react";
import type { ReactNode } from "react";
import type { CursorType } from "../types/cursor";
import { CursorContext } from "./cursor";

export function CursorProvider({ children }: { children: ReactNode }) {
  const [cursor, setCursor] = useState<CursorType>("arrow");
  const resetCursor = () => setCursor("arrow");

  return (
    <CursorContext.Provider value={{ cursor, setCursor, resetCursor }}>
      {children}
    </CursorContext.Provider>
  );
}
