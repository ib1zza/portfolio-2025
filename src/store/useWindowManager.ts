// src/store/useWindowManager.ts
import { create } from "zustand";
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
  focusedWindowId?: string;
  openWindow: (
    id: string,
    title: string,
    parentId?: string | null,
    position?: Position
  ) => void;
  focusWindow: (id: string) => void;
  moveWindow: (id: string, position: Position) => void;
  updateWindowBounds: (
    id: string,
    bounds: Partial<Pick<WindowInstance, "position" | "size">>
  ) => void;
  closeWindow: (id: string) => void;
  unfocusAll: (id?: string) => void;
}

export const useWindowManager = create<WindowManagerStore>((set, get) => ({
  windows: {},
  openWindow: (id, title, parentId = null, position = { x: 200, y: 100 }) => {
    const zIndex = Object.keys(get().windows).length + 1;
    set((state) => ({
      windows: {
        ...state.windows,
        [id]: {
          id,
          title,
          parentId,
          fileId: id,
          position,
          size: { width: 400, height: 300 },
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
    })),
  updateWindowBounds: (id, bounds) =>
    set((state) => ({
      windows: {
        ...state.windows,
        [id]: { ...state.windows[id], ...bounds },
      },
    })),
  closeWindow: (id) =>
    set((state) => {
      const newWindows = { ...state.windows };
      delete newWindows[id];
      return { windows: newWindows };
    }),
  unfocusAll: (triggerId?: string) =>
    set((state) => {
      if (!triggerId) return { focusedWindowId: undefined };
      const focusedWindow = state.windows[state.focusedWindowId || ""];
      if (!focusedWindow) return { focusedWindowId: undefined };
      if (focusedWindow.parentId === triggerId) return {};

      return { focusedWindowId: undefined };
    }),
}));
