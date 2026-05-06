import s from "./Desktop.module.scss";
import { Topbar } from "../Topbar";
import { useFileSystem } from "../../store/useFileSystem";
import { useWindowManager } from "../../store/useWindowManager";
import Folder from "../Folder";
import Window from "../Window";
import { useCallback, useEffect, useRef, type MouseEventHandler } from "react";
import { useShallow } from "zustand/react/shallow";
import { WindowOpenAnimationProvider } from "../WindowOpenAnimation";

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

const getSpatialItems = (items: Array<{ id: string }>) =>
  items
    .map((item) => {
      const element = document.querySelector<HTMLElement>(
        `[data-finder-item-id="${CSS.escape(item.id)}"]`
      );
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

const getFirstSpatialItem = (items: SpatialItem[]) =>
  [...items].sort((a, b) => a.rect.top - b.rect.top || a.rect.left - b.rect.left)[0];

const getSpatialScore = (
  current: SpatialItem,
  candidate: SpatialItem,
  direction: NavigationDirection
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
  direction: NavigationDirection
) => {
  if (!items.length) return undefined;

  const current = activeItemId
    ? items.find((item) => item.id === activeItemId)
    : undefined;

  if (!current) return getFirstSpatialItem(items);

  const nextItem = items
    .filter((item) => item.id !== current.id)
    .map((item) => ({
      item,
      score: getSpatialScore(current, item, direction),
    }))
    .filter(({ score }) => Number.isFinite(score))
    .sort(
      (a, b) =>
        a.score - b.score ||
        a.item.rect.top - b.item.rect.top ||
        a.item.rect.left - b.item.rect.left
    )[0]?.item;

  return nextItem ?? current;
};

export function Desktop() {
  const removeActive = useFileSystem((state) => state.removeActive);
  const setActive = useFileSystem((state) => state.setActive);
  const activeItemId = useFileSystem((state) => state.activeItemId);
  const desktopItems = useFileSystem(
    useShallow((state) =>
      Object.values(state.items).filter((item) => item.parentId === "root")
    )
  );
  const windows = useWindowManager(
    useShallow((state) => Object.values(state.windows))
  );
  const focusedWindowId = useWindowManager((state) => state.focusedWindowId);
  const focusedWindowFileId = useWindowManager((state) =>
    state.focusedWindowId
      ? state.windows[state.focusedWindowId]?.fileId
      : undefined
  );
  const keyboardItems = useFileSystem(
    useShallow((state) => {
      const focusedItem = focusedWindowFileId
        ? state.items[focusedWindowFileId]
        : undefined;
      const parentId = focusedItem?.type === "folder" ? focusedItem.id : "root";

      return Object.values(state.items).filter(
        (item) =>
          item.parentId === parentId &&
          (item.type === "folder" ||
            item.type === "file" ||
            item.type === "link" ||
            item.type === "app")
      );
    })
  );
  const openWindow = useWindowManager((state) => state.openWindow);
  const focusWindow = useWindowManager((state) => state.focusWindow);
  const unfocusAll = useWindowManager((state) => state.unfocusAll);
  const desktopRef = useRef<HTMLDivElement | null>(null);

  const handleBgClick: MouseEventHandler<HTMLDivElement> = (e) => {
    if (e.target === desktopRef.current) {
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
        direction
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
    ]
  );

  const openActiveItem = useCallback(() => {
    if (!activeItemId) return;

    const item = useFileSystem.getState().items[activeItemId];
    if (
      !item ||
      (item.type !== "folder" &&
        item.type !== "file" &&
        item.type !== "link" &&
        item.type !== "app")
    ) {
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
    const preferredSize =
      item.type === "app"
        ? { width: 580, height: 384 }
        : hasProjectModel
          ? { width: Math.min(900, window.innerWidth), height: 440 }
          : undefined;

    openWindow(
      item.id,
      item.name,
      item.id,
      undefined,
      preferredSize,
      focusedWindowId
    );
    setActive(item.id);
  }, [activeItemId, focusedWindowId, openWindow, setActive]);

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
  }, [
    navigateActiveItem,
    openActiveItem,
    removeActive,
    unfocusAll,
  ]);

  return (
    <div className={s.desktop} ref={desktopRef} onClick={handleBgClick}>
      <WindowOpenAnimationProvider>
      <Topbar />

      {/* Папки на рабочем столе */}
      {desktopItems.map((item) =>
        item.type === "folder" || item.type === "app" ? (
          <Folder
            key={item.id}
            id={item.id}
            name={item.name}
            position={item.position!}
            constraintRef={desktopRef}
            icon={item.type === "app" ? "app" : "folder"}
          />
        ) : null
      )}

      {/* Окна */}
      {windows.map((win) => (
        <Window key={win.id} data={win} />
      ))}
      </WindowOpenAnimationProvider>
    </div>
  );
}
