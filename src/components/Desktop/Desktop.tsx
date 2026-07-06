import s from "./Desktop.module.scss";
import { Topbar } from "../Topbar";
import { getChildItems, useFileSystem } from "../../store/useFileSystem";
import { useWindowManager } from "../../store/useWindowManager";
import Folder from "../Folder";
import { lazy, Suspense, useCallback, useEffect, useRef, type MouseEventHandler } from "react";
import { useShallow } from "zustand/react/shallow";
import { WindowOpenAnimationProvider } from "../WindowOpenAnimation";
import { useWindowOpenAnimation } from "../WindowOpenAnimation";
import {
  getDocumentNoteWindowSize,
  getAppWindowSize,
  getProjectModelWindowSize,
  type WindowAppId,
} from "../../constants/windowLayout";
import type { FinderIconType } from "../Folder/FinderIcon";
import { EasterEggProvider } from "../../features/easter-eggs/EasterEggProvider";
import { useEasterEggs } from "../../features/easter-eggs/EasterEggContext";

const LazyWindowContainer = lazy(() =>
  import("../Window").then((m) => ({ default: m.WindowContainer })),
);

const isEditableTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;

  return (
    target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  );
};

type NavigationDirection = "left" | "right" | "up" | "down";
interface SpatialItem {
  id: string;
  rect: DOMRect;
  centerX: number;
  centerY: number;
}

const getSpatialItems = (items: Array<{ id: string }>) => {
  const elements = document.querySelectorAll<HTMLElement>(
    "[data-finder-item-id]",
  );
  const elementsMap = new Map<string, HTMLElement>();
  for (const el of elements) {
    const id = el.getAttribute("data-finder-item-id");
    if (id) {
      elementsMap.set(id, el);
    }
  }

  return items
    .map((item) => {
      const element = elementsMap.get(item.id);
      const rect = element?.getBoundingClientRect();

      if (!rect) return null;

      return {
        id: item.id,
        rect,
        centerX: rect.left + rect.width / 2,
        centerY: rect.top + rect.height / 2,
      };
    })
    .filter((item): item is SpatialItem => item !== null);
};

const getFirstSpatialItem = (items: SpatialItem[]) => {
  if (!items.length) return undefined;
  return items.reduce((first, current) => {
    const dTop = current.rect.top - first.rect.top;
    if (dTop < 0 || (dTop === 0 && current.rect.left < first.rect.left)) {
      return current;
    }
    return first;
  });
};

const getSpatialScore = (
  current: SpatialItem,
  candidate: SpatialItem,
  direction: NavigationDirection,
) => {
  const dx = candidate.centerX - current.centerX;
  const dy = candidate.centerY - current.centerY;

  if (direction === "left" && dx >= 0) return Infinity;
  if (direction === "right" && dx <= 0) return Infinity;
  if (direction === "up" && dy >= 0) return Infinity;
  if (direction === "down" && dy <= 0) return Infinity;

  const primaryDistance =
    direction === "left" || direction === "right" ? Math.abs(dx) : Math.abs(dy);
  const crossDistance =
    direction === "left" || direction === "right" ? Math.abs(dy) : Math.abs(dx);

  return primaryDistance * 4 + crossDistance;
};

const getNextSpatialItem = (
  items: SpatialItem[],
  activeItemId: string | null,
  direction: NavigationDirection,
) => {
  if (!items.length) return undefined;

  const current = activeItemId
    ? items.find((item) => item.id === activeItemId)
    : undefined;

  if (!current) return getFirstSpatialItem(items);

  const nextItemInfo = items.reduce<{
    item: SpatialItem | undefined;
    score: number;
  }>(
    (best, item) => {
      if (item.id === current.id) return best;

      const score = getSpatialScore(current, item, direction);
      if (!Number.isFinite(score)) return best;

      if (!best.item) return { item, score };

      const scoreDiff = score - best.score;
      if (scoreDiff < 0) return { item, score };
      if (scoreDiff === 0) {
        const topDiff = item.rect.top - best.item.rect.top;
        if (
          topDiff < 0 ||
          (topDiff === 0 && item.rect.left < best.item.rect.left)
        ) {
          return { item, score };
        }
      }

      return best;
    },
    { item: undefined, score: Infinity },
  );

  return nextItemInfo.item ?? current;
};

function DesktopContent() {
  const removeActive = useFileSystem((state) => state.removeActive);
  const setActive = useFileSystem((state) => state.setActive);
  const activeItemId = useFileSystem((state) => state.activeItemId);
  const desktopItems = useFileSystem(
    useShallow((state) => getChildItems(state.items, "root")),
  );
  const windowIds = useWindowManager((state) => state.windowIds);
  const focusedWindowId = useWindowManager((state) => state.focusedWindowId);
  const focusedWindowFileId = useWindowManager((state) =>
    state.focusedWindowId
      ? state.windows[state.focusedWindowId]?.fileId
      : undefined,
  );
  const keyboardItems = useFileSystem(
    useShallow((state) => {
      const focusedItem = focusedWindowFileId
        ? state.items[focusedWindowFileId]
        : undefined;
      const parentId = focusedItem?.type === "folder" ? focusedItem.id : "root";

      return getChildItems(state.items, parentId).filter(
        (item) =>
          item.type === "folder" ||
          item.type === "system" ||
          item.type === "file" ||
          item.type === "link" ||
          item.type === "app",
      );
    }),
  );
  const focusWindow = useWindowManager((state) => state.focusWindow);
  const unfocusAll = useWindowManager((state) => state.unfocusAll);
  const { openWindowAnimated } = useWindowOpenAnimation();
  const { recordDesktopBackgroundClick, recordItemOpenRequest } =
    useEasterEggs();
  const desktopRef = useRef<HTMLDivElement | null>(null);

  const handleBgClick: MouseEventHandler<HTMLDivElement> = (e) => {
    if (e.target === desktopRef.current) {
      recordDesktopBackgroundClick(e);
      removeActive();
      unfocusAll();
    }
  };

  const navigateActiveItem = useCallback(
    (direction: NavigationDirection) => {
      if (!keyboardItems.length) return;

      const nextItem = getNextSpatialItem(
        getSpatialItems(keyboardItems),
        activeItemId,
        direction,
      );

      if (!nextItem) return;

      setActive(nextItem.id);
      if (focusedWindowId) {
        focusWindow(focusedWindowId);
      } else {
        unfocusAll();
      }
    },
    [
      activeItemId,
      focusWindow,
      focusedWindowId,
      keyboardItems,
      setActive,
      unfocusAll,
    ],
  );

  const openActiveItem = useCallback(() => {
    if (!activeItemId) return;

    const item = useFileSystem.getState().items[activeItemId];
    if (
      !item ||
      (item.type !== "folder" &&
        item.type !== "system" &&
        item.type !== "file" &&
        item.type !== "link" &&
        item.type !== "app")
    ) {
      return;
    }

    if (item.id === "trash") {
      setActive(item.id);
      return;
    }

    if (item.type === "link") {
      window.open(item.href, "_blank", "noopener,noreferrer");
      setActive(item.id);
      return;
    }

    const hasProjectModel =
      item.type === "file" &&
      Array.isArray(item.content) &&
      item.content.some((block) => block.type === "projectModel");
    const isCenteredNote =
      item.type === "file" && item.documentStyle === "centered-note";
    const isEggLog =
      item.type === "file" && item.documentStyle === "easter-eggs-log";
    const preferredSize =
      item.type === "app"
        ? getAppWindowSize(item.app as WindowAppId)
        : isCenteredNote || isEggLog
          ? getDocumentNoteWindowSize()
        : hasProjectModel
          ? getProjectModelWindowSize()
          : undefined;
    const windowOptions = isCenteredNote || isEggLog
      ? { resizable: false, windowVariant: "note" as const }
      : undefined;

    const sourceElement = document.querySelector<HTMLElement>(
      `[data-finder-item-id="${CSS.escape(item.id)}"]`,
    );

    recordItemOpenRequest(item.id);
    openWindowAnimated({
      id: item.id,
      title: item.name,
      parentId: item.id,
      sourceRect: sourceElement?.getBoundingClientRect(),
      preferredSize,
      openerWindowId: focusedWindowId,
      windowOptions,
    });
    setActive(item.id);
  }, [
    activeItemId,
    focusedWindowId,
    openWindowAnimated,
    recordItemOpenRequest,
    setActive,
  ]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return;

      if (event.key === "Escape") {
        removeActive();
        unfocusAll();
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        openActiveItem();
        return;
      }

      if (focusedWindowId) return;

      if (event.key === "ArrowRight") {
        event.preventDefault();
        navigateActiveItem("right");
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        navigateActiveItem("down");
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        navigateActiveItem("left");
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        navigateActiveItem("up");
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [navigateActiveItem, openActiveItem, removeActive, unfocusAll, focusedWindowId]);

  return (
    <div className={s.desktop} ref={desktopRef} onClick={handleBgClick}>
      <Topbar />

      {/* Папки на рабочем столе */}
      {desktopItems.map((item) =>
        item.type === "folder" ||
        item.type === "system" ||
        item.type === "app" ||
        item.type === "file" ? (
          <Folder
            key={item.id}
            id={item.id}
            name={item.name}
            position={item.position!}
            constraintRef={desktopRef}
            icon={
              item.type === "app"
                ? item.savedIconId
                  ? "saved-icon"
                  : (("app-" + item.id) as FinderIconType)
                : item.type === "file"
                  ? "file"
                  : item.type === "system"
                    ? "disk"
                  : item.id === "trash"
                    ? "trash"
                    : "folder"
            }
            savedIconId={item.type === "app" ? item.savedIconId : undefined}
          />
        ) : null,
      )}

      {/* Окна */}
      {windowIds.map((windowId) => (
        <Suspense fallback={null} key={windowId}>
          <LazyWindowContainer id={windowId} />
        </Suspense>
      ))}
    </div>
  );
}

export function Desktop() {
  return (
    <WindowOpenAnimationProvider>
      <EasterEggProvider>
        <DesktopContent />
      </EasterEggProvider>
    </WindowOpenAnimationProvider>
  );
}
