// contexts/CursorContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";
import type { CursorType } from "../types/cursor";

interface CursorContextType {
  cursor: CursorType;
  setCursor: (cursor: CursorType) => void;
  resetCursor: () => void;
}

const CursorContext = createContext<CursorContextType | undefined>(undefined);

export const CursorProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Устанавливаем arrow как курсор по умолчанию вместо default
  const [cursor, setCursor] = useState<CursorType>("arrow");

  const resetCursor = () => setCursor("arrow");

  return (
    <CursorContext.Provider value={{ cursor, setCursor, resetCursor }}>
      {children}
    </CursorContext.Provider>
  );
};

export const useCursor = () => {
  const context = useContext(CursorContext);
  if (context === undefined) {
    throw new Error("useCursor must be used within a CursorProvider");
  }
  return context;
};
