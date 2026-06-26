import { createContext, useContext } from "react";

export type SpecialAction =
  | "defragment-reality"
  | "increase-creativity"
  | "reboot-universe"
  | "calibrate-inspiration";

export interface EasterEggContextValue {
  canRevealLastDisk: boolean;
  isShiftHeld: boolean;
  recordDesktopBackgroundClick: (event: { altKey: boolean }) => void;
  recordItemOpenRequest: (itemId: string) => void;
  recordTrashClick: (sourceRect?: DOMRect) => void;
  revealLastDiskFromSpecial: () => void;
  runSpecialAction: (action: SpecialAction) => void;
}

export const EasterEggContext =
  createContext<EasterEggContextValue | null>(null);

export const useEasterEggs = () => {
  const context = useContext(EasterEggContext);

  if (!context) {
    throw new Error("useEasterEggs must be used inside EasterEggProvider");
  }

  return context;
};
