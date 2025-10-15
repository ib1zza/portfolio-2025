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
  isFocused: boolean;
}

interface WindowManagerStore {
  windows: Record<string, WindowInstance>;
  openWindow: (
    id: string,
    title: string,
    parentId?: string | null,
    position?: Position
  ) => void;
  focusWindow: (id: string) => void;
  moveWindow: (id: string, position: Position) => void;
  closeWindow: (id: string) => void;
  unfocusAll: () => void;
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
          isFocused: true,
        },
      },
    }));
  },
  focusWindow: (id) => {
    const zIndex = Object.keys(get().windows).length + 1;
    set((state) => ({
      windows: Object.fromEntries(
        Object.entries(state.windows).map(([key, win]) => [
          key,
          {
            ...win,
            isFocused: key === id,
            zIndex: key === id ? zIndex : win.zIndex,
          },
        ])
      ),
    }));
  },
  moveWindow: (id, position) =>
    set((state) => ({
      windows: {
        ...state.windows,
        [id]: { ...state.windows[id], position },
      },
    })),
  closeWindow: (id) =>
    set((state) => {
      const newWindows = { ...state.windows };
      delete newWindows[id];
      return { windows: newWindows };
    }),
  unfocusAll: () =>
    set((state) => ({
      windows: Object.fromEntries(
        Object.entries(state.windows).map(([key, win]) => [
          key,
          {
            ...win,
            isFocused: false,
          },
        ])
      ),
    })),
}));
