// src/store/useWindowManager.ts
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Position } from "./useFileSystem";

export interface WindowInstance {
  id: string;
  title: string;
  parentId?: string | null;
  fileId?: string;
  position: Position;
  size: { width: number; height: number };
  zIndex: number;
}

interface WindowManagerStore {
  windows: Record<string, WindowInstance>;
  windowHistory: Record<
    string,
    Pick<WindowInstance, "position" | "size">
  >;
  focusedWindowId?: string;
  openWindow: (
    id: string,
    title: string,
    parentId?: string | null,
    position?: Position,
    preferredSize?: WindowInstance["size"]
  ) => void;
  focusWindow: (id: string) => void;
  moveWindow: (id: string, position: Position) => void;
  updateWindowBounds: (
    id: string,
    bounds: Partial<Pick<WindowInstance, "position" | "size">>
  ) => void;
  closeWindow: (id: string) => void;
  closeFocusedWindow: () => void;
  closeAllWindows: () => void;
  resetWindows: () => void;
  unfocusAll: (id?: string) => void;
}

const getDefaultWindowSize = () => ({ width: 400, height: 300 });

export const useWindowManager = create<WindowManagerStore>()(
  persist(
    (set, get) => ({
  windows: {},
  windowHistory: {},
  openWindow: (
    id,
    title,
    parentId = null,
    position = { x: 200, y: 100 },
    preferredSize
  ) => {
    const zIndex = Object.keys(get().windows).length + 1;
    const savedBounds = get().windowHistory[id];
    set((state) => ({
      windows: {
        ...state.windows,
        [id]: {
          id,
          title,
          parentId,
          fileId: id,
          position: savedBounds?.position ?? position,
          size: savedBounds?.size ?? preferredSize ?? getDefaultWindowSize(),
          zIndex,
        },
      },
      focusedWindowId: id,
    }));
  },
  focusWindow: (id) => {
    // const zIndex = Object.keys(get().windows).length + 1;
    set(() => ({
      focusedWindowId: id,
    }));
  },
  moveWindow: (id, position) =>
    set((state) => ({
      windows: {
        ...state.windows,
        [id]: { ...state.windows[id], position },
      },
      windowHistory: {
        ...state.windowHistory,
        [id]: {
          position,
          size: state.windows[id].size,
        },
      },
    })),
  updateWindowBounds: (id, bounds) =>
    set((state) => {
      const nextWindow = { ...state.windows[id], ...bounds };

      return {
        windows: {
          ...state.windows,
          [id]: nextWindow,
        },
        windowHistory: {
          ...state.windowHistory,
          [id]: {
            position: nextWindow.position,
            size: nextWindow.size,
          },
        },
      };
    }),
  closeWindow: (id) =>
    set((state) => {
      const newWindows = { ...state.windows };
      delete newWindows[id];
      return {
        windows: newWindows,
        focusedWindowId:
          state.focusedWindowId === id ? undefined : state.focusedWindowId,
      };
    }),
  closeFocusedWindow: () =>
    set((state) => {
      if (!state.focusedWindowId) return {};

      const newWindows = { ...state.windows };
      delete newWindows[state.focusedWindowId];

      return { windows: newWindows, focusedWindowId: undefined };
    }),
  closeAllWindows: () =>
    set(() => ({
      windows: {},
      focusedWindowId: undefined,
    })),
  resetWindows: () =>
    set(() => ({
      windows: {},
      windowHistory: {},
      focusedWindowId: undefined,
    })),
  unfocusAll: (triggerId?: string) =>
    set((state) => {
      if (!triggerId) return { focusedWindowId: undefined };
      const focusedWindow = state.windows[state.focusedWindowId || ""];
      if (!focusedWindow) return { focusedWindowId: undefined };
      if (focusedWindow.parentId === triggerId) return {};

      return { focusedWindowId: undefined };
    }),
}),
    {
      name: "portfolio-2025-window-manager",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ windowHistory: state.windowHistory }),
    }
  )
);
