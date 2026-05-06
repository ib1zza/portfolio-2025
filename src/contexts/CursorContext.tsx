import { useCallback, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { CursorType } from "../types/cursor";
import { CursorContext } from "./cursor";

export function CursorProvider({ children }: { children: ReactNode }) {
  const [baseCursor, setBaseCursor] = useState<CursorType>("arrow");
  const [overrideCursor, setOverrideCursor] = useState<CursorType | null>(null);
  const overrideCountRef = useRef(0);

  const setCursor = useCallback((cursor: CursorType) => {
    setBaseCursor(cursor);
  }, []);

  const resetCursor = useCallback(() => {
    setBaseCursor("arrow");
  }, []);

  const startCursorOverride = useCallback((cursor: CursorType) => {
    let isReleased = false;

    overrideCountRef.current += 1;
    setOverrideCursor(cursor);

    return () => {
      if (isReleased) return;

      isReleased = true;
      overrideCountRef.current = Math.max(0, overrideCountRef.current - 1);
      if (overrideCountRef.current === 0) {
        setOverrideCursor(null);
      }
    };
  }, []);

  const value = useMemo(
    () => ({
      cursor: overrideCursor ?? baseCursor,
      resetCursor,
      setCursor,
      startCursorOverride,
    }),
    [baseCursor, overrideCursor, resetCursor, setCursor, startCursorOverride],
  );

  return (
    <CursorContext.Provider value={value}>
      {children}
    </CursorContext.Provider>
  );
}
