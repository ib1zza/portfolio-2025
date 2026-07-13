import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createThrottledLocalStorage } from "../../utils/storage";
import {
  deleteSavedIcon,
  type SavedDesktopIcon,
} from "../../components/IconPainter/iconPainterDesktop";
import type { FileSystemItem, Position } from "./types";
import { getChildItems } from "./types";
import {
  isAutoLayoutRootItemId,
  getCleanPosition,
  recalculateRootPositions,
} from "./layout";
import {
  savedIconItemId,
  isGeneratedFileItemId,
  getRootChildren,
  getExtraRootItemIds,
  createInitialItems,
} from "./initialItems";
import {
  STORAGE_KEY,
  STORAGE_VERSION,
  sanitizeStoredPositions,
  readStoredPositions,
} from "./storage";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FileSystemStore {
  items: Record<string, FileSystemItem>;
  itemPositions: Record<string, Position>;
  activeItemId: string | null;
  getChildren: (parentId: string | null) => FileSystemItem[];
  getItemById: (id: string) => FileSystemItem | undefined;
  setActive: (id: string) => void;
  removeActive: () => void;
  moveItem: (id: string, position: Position) => void;
  upsertSavedIconItem: (icon: SavedDesktopIcon) => void;
  deleteSavedIconItem: (id: string) => void;
  addExtraRootItem: (itemId: string) => void;
  cleanUpChildren: (parentId: string | null) => void;
  resetLayout: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const shouldPersistItemPosition = (item: FileSystemItem) =>
  item.parentId !== "root" || !isAutoLayoutRootItemId(item.id);

/**
 * Shared helper: rebuild root.children and recalculate all root positions.
 */
const applyRootUpdate = (
  items: Record<string, FileSystemItem>,
  itemPositions: Record<string, Position>,
  generatedFileIds: string[],
  extraItemIds: string[],
): Record<string, FileSystemItem> => {
  const root = items.root;
  if (root?.type !== "folder") return items;

  const baseItems = {
    ...items,
    root: { ...root, children: getRootChildren(generatedFileIds, extraItemIds) },
  };

  return recalculateRootPositions(baseItems, itemPositions);
};

// ─── Store ────────────────────────────────────────────────────────────────────

const storedPositions = readStoredPositions();

export const useFileSystem = create<FileSystemStore>()(
  persist(
    (set, get) => ({
      items: createInitialItems(storedPositions),
      itemPositions: storedPositions,
      activeItemId: null,

      getChildren: (parentId) => getChildItems(get().items, parentId),
      getItemById: (id) => get().items[id],

      setActive: (id) => {
        set((state) =>
          state.activeItemId === id ? state : { activeItemId: id },
        );
      },

      removeActive: () => {
        set((state) =>
          state.activeItemId === null ? state : { activeItemId: null },
        );
      },

      moveItem: (id, position) => {
        set((state) => {
          const item = state.items[id];
          if (!item) return state;
          if (
            item.position?.x === position.x &&
            item.position?.y === position.y
          ) {
            return state;
          }

          const shouldPersist = shouldPersistItemPosition(item);

          return {
            items: { ...state.items, [id]: { ...item, position } },
            itemPositions: shouldPersist
              ? { ...state.itemPositions, [id]: position }
              : (() => {
                  const next = { ...state.itemPositions };
                  delete next[id];
                  return next;
                })(),
          };
        });
      },

      upsertSavedIconItem: (icon) => {
        set((state) => {
          const root = state.items.root;
          if (root?.type !== "folder") return state;

          const itemId = savedIconItemId(icon.id);
          const currentGenIds = root.children.filter(isGeneratedFileItemId);
          const generatedFileIds = currentGenIds.includes(itemId)
            ? currentGenIds
            : [...currentGenIds, itemId];

          const baseItems: Record<string, FileSystemItem> = {
            ...state.items,
            [itemId]: {
              id: itemId,
              name: icon.name,
              type: "app",
              parentId: "root",
              position: { x: 0, y: 0 },
              app: "icon-painter",
              savedIconId: icon.id,
            },
          };

          return {
            items: applyRootUpdate(
              baseItems,
              state.itemPositions,
              generatedFileIds,
              getExtraRootItemIds(root.children),
            ),
          };
        });
      },

      deleteSavedIconItem: (id) => {
        set((state) => {
          const item = state.items[id];
          const root = state.items.root;

          if (item?.type !== "app" || !item.savedIconId || root?.type !== "folder") {
            return state;
          }

          deleteSavedIcon(item.savedIconId);

          const nextItems = { ...state.items };
          const nextPositions = { ...state.itemPositions };
          delete nextItems[id];
          delete nextPositions[id];

          const generatedFileIds = root.children.filter(
            (childId) => isGeneratedFileItemId(childId) && childId !== id,
          );

          return {
            items: applyRootUpdate(
              nextItems,
              nextPositions,
              generatedFileIds,
              getExtraRootItemIds(root.children),
            ),
            itemPositions: nextPositions,
            activeItemId: state.activeItemId === id ? null : state.activeItemId,
          };
        });
      },

      addExtraRootItem: (itemId) => {
        set((state) => {
          const root = state.items.root;
          if (root?.type !== "folder" || root.children.includes(itemId)) {
            return state;
          }

          const existingItem = state.items[itemId];
          const baseItems: Record<string, FileSystemItem> = {
            ...state.items,
            ...(existingItem
              ? { [itemId]: { ...existingItem, position: { x: 0, y: 0 } } }
              : {}),
          };

          const extraItemIds = [
            ...getExtraRootItemIds(root.children),
            itemId,
          ];
          const generatedFileIds = root.children.filter(isGeneratedFileItemId);

          return {
            items: applyRootUpdate(
              baseItems,
              state.itemPositions,
              generatedFileIds,
              extraItemIds,
            ),
          };
        });
      },

      cleanUpChildren: (parentId) => {
        set((state) => {
          const children = getChildItems(state.items, parentId);
          let nextItems = state.items;
          let nextPositions = state.itemPositions;
          let hasChanges = false;

          children.forEach((item, index) => {
            const position = getCleanPosition(parentId, item, index, children);

            if (
              item.position?.x === position.x &&
              item.position?.y === position.y
            ) {
              return;
            }

            if (!hasChanges) {
              nextItems = { ...state.items };
              nextPositions = { ...state.itemPositions };
              hasChanges = true;
            }

            nextItems[item.id] = { ...item, position };

            if (shouldPersistItemPosition(item)) {
              nextPositions[item.id] = position;
            } else {
              delete nextPositions[item.id];
            }
          });

          return hasChanges
            ? { items: nextItems, itemPositions: nextPositions }
            : state;
        });
      },

      resetLayout: () => {
        set((state) => {
          const currentRoot = state.items.root;
          const extraRootItems =
            currentRoot?.type === "folder"
              ? getExtraRootItemIds(currentRoot.children)
              : [];

          const initialItems = createInitialItems();

          if (extraRootItems.length > 0) {
            const newRoot = initialItems.root;
            if (newRoot?.type === "folder") {
              const existingChildSet = new Set(newRoot.children);
              const missingExtras = extraRootItems.filter(
                (id) => !existingChildSet.has(id),
              );
              const generatedFileIds = newRoot.children.filter(isGeneratedFileItemId);

              initialItems.root = {
                ...newRoot,
                children: getRootChildren(generatedFileIds, missingExtras),
              };

              for (const id of missingExtras) {
                if (state.items[id]) {
                  initialItems[id] = state.items[id];
                }
              }
            }
          }

          return { items: initialItems, itemPositions: {}, activeItemId: null };
        });
      },
    }),
    {
      name: STORAGE_KEY,
      version: STORAGE_VERSION,
      storage: createJSONStorage(() => createThrottledLocalStorage()),
      migrate: (persistedState, version) => {
        const state = persistedState as Partial<FileSystemStore> | undefined;
        const itemPositions = version < 2 ? {} : (state?.itemPositions ?? {});

        return {
          itemPositions: sanitizeStoredPositions(itemPositions, version),
        } as Partial<FileSystemStore>;
      },
      partialize: (state) => ({ itemPositions: state.itemPositions }),
    },
  ),
);
