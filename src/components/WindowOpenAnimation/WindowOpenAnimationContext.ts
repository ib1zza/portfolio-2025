import { createContext, useContext } from "react";

import type { WindowInstance } from "../../store/useWindowManager";
import type { Position } from "../../store/useFileSystem";

export interface OpenWindowAnimatedParams {
  id: string;
  title: string;
  parentId?: string | null;
  sourceRect?: DOMRect | null;
  position?: Position;
  preferredSize?: WindowInstance["size"];
  openerWindowId?: string;
}

export interface WindowOpenAnimationContextValue {
  openWindowAnimated: (params: OpenWindowAnimatedParams) => void;
  closeWindowAnimated: (id: string) => void;
}

export const WindowOpenAnimationContext =
  createContext<WindowOpenAnimationContextValue | null>(null);

export const useWindowOpenAnimation = () => {
  const context = useContext(WindowOpenAnimationContext);

  if (!context) {
    throw new Error(
      "useWindowOpenAnimation must be used inside WindowOpenAnimationProvider"
    );
  }

  return context;
};
