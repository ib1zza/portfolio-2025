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
    (direction: "next" | "previous") => {
      if (!keyboardItems.length) return;

      const currentIndex = activeItemId
        ? keyboardItems.findIndex((item) => item.id === activeItemId)
        : -1;
      const nextIndex =
        direction === "next"
          ? (currentIndex + 1) % keyboardItems.length
          : currentIndex <= 0
            ? keyboardItems.length - 1
            : currentIndex - 1;

      setActive(keyboardItems[nextIndex].id);
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

      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        navigateActiveItem("next");
        return;
      }

      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        navigateActiveItem("previous");
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
