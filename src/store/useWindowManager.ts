// src/store/useWindowManager.ts
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createThrottledLocalStorage } from "../utils/storage";
import {
  getDefaultWindowPosition,
  getDefaultWindowSize,
} from "../constants/windowLayout";
import type { Position } from "./useFileSystem";

export interface WindowInstance {
  id: string;
  title: string;
  parentId?: string | null;
  openerWindowId?: string;
  fileId?: string;
  position: Position;
  size: { width: number; height: number };
  zIndex: number;
}

interface WindowManagerStore {
  windows: Record<string, WindowInstance>;
  windowIds: string[];
  openFileIds: Record<string, true>;
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
    preferredSize?: WindowInstance["size"],
    openerWindowId?: string
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

const arePositionsEqual = (a: Position, b: Position) =>
  a.x === b.x && a.y === b.y;

const areSizesEqual = (
  a: WindowInstance["size"],
  b: WindowInstance["size"]
) => a.width === b.width && a.height === b.height;

export const useWindowManager = create<WindowManagerStore>()(
  persist(
    (set, get) => ({
  windows: {},
  windowIds: [],
  openFileIds: {},
  windowHistory: {},
  openWindow: (
    id,
    title,
    parentId = null,
    position = getDefaultWindowPosition(),
    preferredSize,
    openerWindowId
  ) => {
    const zIndex = get().windowIds.length + 1;
    const savedBounds = get().windowHistory[id];
    set((state) => ({
      windows: {
        ...state.windows,
        [id]: {
          id,
          title,
          parentId,
          openerWindowId,
          fileId: id,
          position: savedBounds?.position ?? position,
          size: savedBounds?.size ?? preferredSize ?? getDefaultWindowSize(),
          zIndex,
        },
      },
      windowIds: state.windowIds.includes(id)
        ? state.windowIds
        : [...state.windowIds, id],
      openFileIds: {
        ...state.openFileIds,
        [id]: true,
      },
      focusedWindowId: id,
    }));
  },
  focusWindow: (id) =>
    set((state) =>
      state.focusedWindowId === id ? state : { focusedWindowId: id }
    ),
  moveWindow: (id, position) =>
    set((state) => {
      const currentWindow = state.windows[id];

      if (!currentWindow || arePositionsEqual(currentWindow.position, position)) {
        return state;
      }

      return {
        windows: {
          ...state.windows,
          [id]: { ...currentWindow, position },
        },
        windowHistory: {
          ...state.windowHistory,
          [id]: {
            position,
            size: currentWindow.size,
          },
        },
      };
    }),
  updateWindowBounds: (id, bounds) =>
    set((state) => {
      const currentWindow = state.windows[id];
      if (!currentWindow) return state;

      const nextPosition = bounds.position ?? currentWindow.position;
      const nextSize = bounds.size ?? currentWindow.size;
      const hasSamePosition = arePositionsEqual(
        currentWindow.position,
        nextPosition
      );
      const hasSameSize = areSizesEqual(currentWindow.size, nextSize);

      if (hasSamePosition && hasSameSize) return state;

      const nextWindow = { ...currentWindow, ...bounds };

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
      const closingWindow = state.windows[id];
      if (!closingWindow) return state;

      const newWindows = { ...state.windows };
      const newOpenFileIds = { ...state.openFileIds };
      delete newWindows[id];
      if (closingWindow.fileId) delete newOpenFileIds[closingWindow.fileId];
      const openerWindowId =
        closingWindow.openerWindowId && newWindows[closingWindow.openerWindowId]
          ? closingWindow.openerWindowId
          : undefined;

      return {
        windows: newWindows,
        windowIds: state.windowIds.filter((windowId) => windowId !== id),
        openFileIds: newOpenFileIds,
        focusedWindowId:
          state.focusedWindowId === id ? openerWindowId : state.focusedWindowId,
      };
    }),
  closeFocusedWindow: () =>
    set((state) => {
      if (!state.focusedWindowId) return state;

      const closingWindow = state.windows[state.focusedWindowId];
      const newWindows = { ...state.windows };
      const newOpenFileIds = { ...state.openFileIds };
      delete newWindows[state.focusedWindowId];
      if (closingWindow?.fileId) delete newOpenFileIds[closingWindow.fileId];
      const openerWindowId =
        closingWindow?.openerWindowId && newWindows[closingWindow.openerWindowId]
          ? closingWindow.openerWindowId
          : undefined;

      return {
        windows: newWindows,
        windowIds: state.windowIds.filter(
          (windowId) => windowId !== state.focusedWindowId,
        ),
        openFileIds: newOpenFileIds,
        focusedWindowId: openerWindowId,
      };
    }),
  closeAllWindows: () =>
    set((state) =>
      state.windowIds.length || state.focusedWindowId
        ? {
            windows: {},
            windowIds: [],
            openFileIds: {},
            focusedWindowId: undefined,
          }
        : state
    ),
  resetWindows: () =>
    set(() => ({
      windows: {},
      windowIds: [],
      openFileIds: {},
      windowHistory: {},
      focusedWindowId: undefined,
    })),
  unfocusAll: (triggerId?: string) =>
    set((state) => {
      if (!triggerId) {
        return state.focusedWindowId ? { focusedWindowId: undefined } : state;
      }
      const focusedWindow = state.windows[state.focusedWindowId || ""];
      if (!focusedWindow) {
        return state.focusedWindowId ? { focusedWindowId: undefined } : state;
      }
      if (focusedWindow.parentId === triggerId) return state;

      return { focusedWindowId: undefined };
    }),
}),
    {
      name: "portfolio-2025-window-manager",
      version: 2,
      storage: createJSONStorage(() => createThrottledLocalStorage()),
      migrate: (persistedState, version) => {
        const state = persistedState as Partial<WindowManagerStore> | undefined;

        if (version < 2) {
          return { windowHistory: {} } as Partial<WindowManagerStore>;
        }

        return {
          windowHistory: state?.windowHistory ?? {},
        } as Partial<WindowManagerStore>;
      },
      partialize: (state) => ({ windowHistory: state.windowHistory }),
    }
  )
);
