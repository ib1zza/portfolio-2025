import { scaleUiValue } from "../../utils/uiScale";
import type { FileSystemItem, Position } from "./types";
import { getChildItems } from "./types";

// ─── Constants ────────────────────────────────────────────────────────────────

export const MOBILE_LAYOUT_BREAKPOINT = 768;
const FALLBACK_VIEWPORT_WIDTH = 1280;
const FALLBACK_VIEWPORT_HEIGHT = 800;
const MIN_VIEWPORT_WIDTH = 320;
const MIN_VIEWPORT_HEIGHT = 480;

const DESKTOP_GRID = {
  startX: 32,
  startY: 110,
  stepX: 104,
  stepY: 70,
} as const;

const DESKTOP_TRASH = {
  right: 32,
  bottom: 42,
  width: 72,
  height: 64,
} as const;

export const MOBILE_GRID = {
  startX: 12,
  startY: 36,
  itemWidth: 64,
  stepY: 58,
  columns: 4,
} as const;

const MOBILE_APP_ROW_COUNTS = [3, 2] as const;
export const MOBILE_GENERATED_START_ROW = 1 + MOBILE_APP_ROW_COUNTS.length;

const MOBILE_TRASH = {
  right: 12,
  bottom: 16,
  width: 64,
  height: 58,
} as const;

export const WINDOW_GRID = {
  columns: 3,
  startX: 16,
  startY: 14,
  stepX: 112,
  stepY: 58,
} as const;

// IDs that are auto-positioned and should never be stored in itemPositions
export const ROOT_FOLDER_ITEM_IDS: readonly string[] = [
  "about",
  "projects",
  "education",
  "contact",
];

export const ROOT_APP_ITEM_IDS: readonly string[] = [
  "iconPainter",
  "ditherStudio",
  "modelViewer",
  "badgeGenerator",
  "audioPlayer",
  "videoPlayer",
  "spaceInvaders",
  "portfolioAssistant",
  "terminal",
  "ditherCamera",
];

export const ROOT_FILE_ITEM_IDS: readonly string[] = ["credits"];
export const ROOT_SYSTEM_ITEM_IDS: readonly string[] = ["mediaHd"];

export const ROOT_LAYOUT_ITEM_IDS = new Set<string>([
  ...ROOT_FOLDER_ITEM_IDS,
  ...ROOT_APP_ITEM_IDS,
  ...ROOT_FILE_ITEM_IDS,
  ...ROOT_SYSTEM_ITEM_IDS,
  "trash",
]);

const ROOT_DYNAMIC_LAYOUT_EXCLUDED_IDS = new Set<string>([
  ...ROOT_FOLDER_ITEM_IDS,
  ...ROOT_APP_ITEM_IDS,
  "trash",
]);

// ─── Viewport ─────────────────────────────────────────────────────────────────

export const getViewportMetrics = () => {
  const width =
    typeof window === "undefined"
      ? FALLBACK_VIEWPORT_WIDTH
      : Math.max(MIN_VIEWPORT_WIDTH, window.innerWidth);
  const height =
    typeof window === "undefined"
      ? FALLBACK_VIEWPORT_HEIGHT
      : Math.max(MIN_VIEWPORT_HEIGHT, window.innerHeight);

  return {
    width,
    height,
    isMobile: width < MOBILE_LAYOUT_BREAKPOINT,
  };
};

// ─── ID helpers ───────────────────────────────────────────────────────────────

export const isAutoLayoutRootItemId = (id: string) =>
  ROOT_LAYOUT_ITEM_IDS.has(id) || id.startsWith("saved-icon-");

// ─── Desktop grid ─────────────────────────────────────────────────────────────

const getDesktopGridPosition = (index: number) => {
  const { width } = getViewportMetrics();
  const startX = scaleUiValue(DESKTOP_GRID.startX);
  const startY = scaleUiValue(DESKTOP_GRID.startY);
  const stepX = scaleUiValue(DESKTOP_GRID.stepX);
  const stepY = scaleUiValue(DESKTOP_GRID.stepY);
  const columns = Math.max(1, Math.floor((width - startX * 2) / stepX));

  return {
    x: startX + (index % columns) * stepX,
    y: startY + Math.floor(index / columns) * stepY,
  };
};

// ─── Mobile grid ──────────────────────────────────────────────────────────────

const getMobileColumnX = (columnIndex: number, columnCount: number) => {
  const { width } = getViewportMetrics();
  const safeColumnCount = Math.max(1, columnCount);
  const availableWidth = Math.max(
    0,
    width - MOBILE_GRID.startX * 2 - MOBILE_GRID.itemWidth,
  );

  if (safeColumnCount === 1) {
    return Math.round(MOBILE_GRID.startX + availableWidth / 2);
  }

  return Math.round(
    MOBILE_GRID.startX + (availableWidth * columnIndex) / (safeColumnCount - 1),
  );
};

const getMobileRowPosition = (
  rowIndex: number,
  columnIndex: number,
  columnCount: number = MOBILE_GRID.columns,
) => ({
  x: getMobileColumnX(columnIndex, columnCount),
  y: MOBILE_GRID.startY + rowIndex * MOBILE_GRID.stepY,
});

const getMobileAppPosition = (index: number) => {
  let remainingIndex = index;

  for (
    let rowIndex = 0;
    rowIndex < MOBILE_APP_ROW_COUNTS.length;
    rowIndex += 1
  ) {
    const rowCount = MOBILE_APP_ROW_COUNTS[rowIndex];

    if (remainingIndex < rowCount) {
      return getMobileRowPosition(1 + rowIndex, remainingIndex, rowCount);
    }

    remainingIndex -= rowCount;
  }

  return getMobileRowPosition(
    1 +
      MOBILE_APP_ROW_COUNTS.length +
      Math.floor(remainingIndex / MOBILE_GRID.columns),
    remainingIndex % MOBILE_GRID.columns,
  );
};

// ─── Per-category positions ───────────────────────────────────────────────────

const getFolderPosition = (index: number) =>
  getViewportMetrics().isMobile
    ? getMobileRowPosition(0, index, ROOT_FOLDER_ITEM_IDS.length)
    : getDesktopGridPosition(index);

const getAppPosition = (index: number) =>
  getViewportMetrics().isMobile
    ? getMobileAppPosition(index)
    : getDesktopGridPosition(ROOT_FOLDER_ITEM_IDS.length + index);

const getGeneratedFilePosition = (index: number) =>
  getViewportMetrics().isMobile
    ? getMobileRowPosition(
        MOBILE_GENERATED_START_ROW + Math.floor(index / MOBILE_GRID.columns),
        index % MOBILE_GRID.columns,
      )
    : getDesktopGridPosition(
        ROOT_FOLDER_ITEM_IDS.length + ROOT_APP_ITEM_IDS.length + index,
      );

export const getTrashPosition = () => {
  const { width, height, isMobile } = getViewportMetrics();
  const trash = isMobile ? MOBILE_TRASH : DESKTOP_TRASH;
  const iconWidth = isMobile ? trash.width : scaleUiValue(trash.width);
  const iconHeight = isMobile ? trash.height : scaleUiValue(trash.height);
  const right = isMobile ? trash.right : scaleUiValue(trash.right);
  const bottom = isMobile ? trash.bottom : scaleUiValue(trash.bottom);

  return {
    x: Math.max(0, Math.round(width - right - iconWidth)),
    y: Math.max(0, Math.round(height - bottom - iconHeight)),
  };
};

// ─── Root position resolver ───────────────────────────────────────────────────

export const getCleanRootPosition = (
  item: FileSystemItem,
  siblings: FileSystemItem[],
): Position => {
  if (item.id === "trash") return getTrashPosition();

  const folderIndex = ROOT_FOLDER_ITEM_IDS.indexOf(item.id);
  if (folderIndex >= 0) return getFolderPosition(folderIndex);

  const appIndex = ROOT_APP_ITEM_IDS.indexOf(item.id);
  if (appIndex >= 0) return getAppPosition(appIndex);

  // credits, mediaHd, extra items, saved icons
  const otherSiblings = siblings.filter(
    (s) => !ROOT_DYNAMIC_LAYOUT_EXCLUDED_IDS.has(s.id),
  );
  const otherIndex = otherSiblings.findIndex((s) => s.id === item.id);

  return otherIndex >= 0 ? getGeneratedFilePosition(otherIndex) : { x: 0, y: 0 };
};

// ─── Window (folder interior) position ───────────────────────────────────────

export const getCleanWindowPosition = (index: number): Position => ({
  x:
    scaleUiValue(WINDOW_GRID.startX) +
    (index % WINDOW_GRID.columns) * scaleUiValue(WINDOW_GRID.stepX),
  y:
    scaleUiValue(WINDOW_GRID.startY) +
    Math.floor(index / WINDOW_GRID.columns) * scaleUiValue(WINDOW_GRID.stepY),
});

export const getCleanPosition = (
  parentId: string | null,
  item: FileSystemItem,
  index: number,
  siblings: FileSystemItem[],
): Position =>
  parentId === "root"
    ? getCleanRootPosition(item, siblings)
    : getCleanWindowPosition(index);

// ─── Bulk recalculation ───────────────────────────────────────────────────────

export const recalculateRootPositions = (
  items: Record<string, FileSystemItem>,
  itemPositions: Record<string, Position>,
): Record<string, FileSystemItem> => {
  const root = items.root;
  if (!root || root.type !== "folder") return items;

  const siblings = getChildItems(items, "root");
  const nextItems = { ...items };

  for (const child of siblings) {
    if (child.parentId === "root") {
      const isAutoLayout = isAutoLayoutRootItemId(child.id);
      const position = getCleanRootPosition(child, siblings);

      nextItems[child.id] = {
        ...child,
        position: isAutoLayout ? position : (itemPositions[child.id] ?? position),
      };
    }
  }

  return nextItems;
};
