import { memo, useCallback, useEffect, useRef, useState } from "react";
import type { MouseEventHandler, PointerEventHandler, RefObject } from "react";

import { isCoarsePointerMode } from "../../constants/responsive";
import s from "./Folder.module.scss";
import { useWindowManager } from "../../store/useWindowManager";
import { useFileSystem } from "../../store/useFileSystem";
import { useWindowOpenAnimation } from "../WindowOpenAnimation";
import { FinderIcon, type FinderIconType } from "./FinderIcon";
import { FinderItem } from "./FinderItem";
import { FinderLabel } from "./FinderLabel";
import {
  getAppWindowSize,
  getDocumentNoteWindowSize,
  getProjectModelWindowSize,
  getTopbarHeight,
  type WindowAppId,
} from "../../constants/windowLayout";
import { useHaptics } from "../../hooks/useHaptics";
import { useEasterEggs } from "../../features/easter-eggs/EasterEggContext";

interface FolderProps {
  id: string;
  name: string;
  position: { x: number; y: number };
  parentWindowId?: string;
  constraintRef?: RefObject<HTMLElement | null>;
  icon?: FinderIconType;
  savedIconId?: string;
}

interface DragState {
  pointerId: number;
  containerRect: DOMRect;
  grabOffset: { x: number; y: number };
  startPosition: { x: number; y: number };
}

const DRAG_CLICK_THRESHOLD = 3;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const Folder = memo(function Folder({
  id,
  name,
  position,
  parentWindowId,
  constraintRef,
  icon = "folder",
  savedIconId,
}: FolderProps) {
  const { openWindowAnimated } = useWindowOpenAnimation();
  const focusWindow = useWindowManager((state) => state.focusWindow);
  const unfocusAll = useWindowManager((state) => state.unfocusAll);
  const isOpened = useWindowManager((state) => Boolean(state.openFileIds[id]));
  const focusedWindowId = useWindowManager((state) => state.focusedWindowId);
  const setActive = useFileSystem((state) => state.setActive);
  const isActive =
    useFileSystem((state) => state.activeItemId === id) ||
    focusedWindowId === id;
  const moveItem = useFileSystem((state) => state.moveItem);
  const deleteSavedIconItem = useFileSystem(
    (state) => state.deleteSavedIconItem,
  );
  const getItemById = useFileSystem((state) => state.getItemById);
  const folderRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const didDragRef = useRef(false);
  const pointerCleanupRef = useRef<(() => void) | null>(null);
  const [draftPosition, setDraftPosition] = useState(position);
  const { recordItemOpenRequest, recordTrashClick } = useEasterEggs();

  const { fileOpen } = useHaptics();

  useEffect(() => {
    setDraftPosition(position);
  }, [position]);

  const getBounds = useCallback(() => {
    const container = constraintRef?.current;
    const folder = folderRef.current;
    const desktopMinY = parentWindowId ? 0 : getTopbarHeight();

    if (!container || !folder) {
      return { minX: 0, minY: desktopMinY, maxX: Infinity, maxY: Infinity };
    }

    const scrollLeft = parentWindowId ? container.scrollLeft : 0;
    const scrollTop = parentWindowId ? container.scrollTop : 0;
    const minX = scrollLeft;
    const minY = parentWindowId ? scrollTop : desktopMinY;
    const maxX = Math.max(
      minX,
      scrollLeft + container.clientWidth - folder.offsetWidth,
    );
    const maxY = Math.max(
      minY,
      scrollTop + container.clientHeight - folder.offsetHeight,
    );

    return { minX, minY, maxX, maxY };
  }, [constraintRef, parentWindowId]);

  const getClampedPosition = useCallback(
    (nextPosition: { x: number; y: number }) => {
      const bounds = getBounds();

      return {
        x: clamp(nextPosition.x, bounds.minX, bounds.maxX),
        y: clamp(nextPosition.y, bounds.minY, bounds.maxY),
      };
    },
    [getBounds],
  );

  const getPositionFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const state = dragStateRef.current;
      const container = constraintRef?.current;

      if (!state || !container) return draftPosition;

      const scrollLeft = parentWindowId ? container.scrollLeft : 0;
      const scrollTop = parentWindowId ? container.scrollTop : 0;

      return getClampedPosition({
        x: clientX - state.containerRect.left + scrollLeft - state.grabOffset.x,
        y: clientY - state.containerRect.top + scrollTop - state.grabOffset.y,
      });
    },
    [constraintRef, draftPosition, getClampedPosition, parentWindowId],
  );

  const openItem = useCallback(() => {
    if (id === "trash") return;

    fileOpen();
    const item = getItemById(id);
    if (item?.type === "link") {
      setActive(id);
      window.open(item.href, "_blank", "noopener,noreferrer");
      return;
    }

    const hasProjectModel =
      item?.type === "file" &&
      Array.isArray(item.content) &&
      item.content.some((block) => block.type === "projectModel");
    const isCenteredNote =
      item?.type === "file" && item.documentStyle === "centered-note";
    const isEggLog =
      item?.type === "file" && item.documentStyle === "easter-eggs-log";
    const preferredSize =
      item?.type === "app"
        ? getAppWindowSize(item.app as WindowAppId)
        : isCenteredNote || isEggLog
          ? getDocumentNoteWindowSize()
        : hasProjectModel
          ? getProjectModelWindowSize()
          : undefined;
    const windowOptions = isCenteredNote
      ? { resizable: false, windowVariant: "note" as const }
      : isEggLog
        ? { resizable: true, windowVariant: "note" as const }
      : undefined;

    setActive(id);
    recordItemOpenRequest(id);
    openWindowAnimated({
      id,
      title: name,
      parentId: id,
      sourceRect: folderRef.current?.getBoundingClientRect(),
      preferredSize,
      openerWindowId: parentWindowId,
      windowOptions,
    });
  }, [
    getItemById,
    id,
    name,
    openWindowAnimated,
    parentWindowId,
    recordItemOpenRequest,
    setActive,
    fileOpen,
  ]);

  const handleDoubleClick = () => {
    if (didDragRef.current) return;
    if (id === "trash") return;

    openItem();
  };

  const handleClick: MouseEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation();

    if (didDragRef.current) {
      didDragRef.current = false;
      return;
    }

    setActive(id);
    if (parentWindowId) {
      focusWindow(parentWindowId);
    } else {
      unfocusAll();
    }

    if (id === "trash") {
      recordTrashClick(folderRef.current?.getBoundingClientRect());
      return;
    }

    if (isCoarsePointerMode()) openItem();
    // TODO: связать папки и окна
    // focusWindowFromFolder(id);
  };

  const handlePointerDown: PointerEventHandler<HTMLDivElement> = (e) => {
    if (e.button !== 0) return;
    if (isCoarsePointerMode()) return;

    const container = constraintRef?.current;
    const folder = folderRef.current;
    if (!container || !folder) return;

    const folderRect = folder.getBoundingClientRect();

    folder.setPointerCapture(e.pointerId);
    didDragRef.current = false;
    dragStateRef.current = {
      pointerId: e.pointerId,
      containerRect: container.getBoundingClientRect(),
      grabOffset: {
        x: e.clientX - folderRect.left,
        y: e.clientY - folderRect.top,
      },
      startPosition: draftPosition,
    };

    setActive(id);
    if (parentWindowId) focusWindow(parentWindowId);

    pointerCleanupRef.current?.();

    const handleDocumentPointerMove = (event: PointerEvent) => {
      const state = dragStateRef.current;
      if (!state || event.pointerId !== state.pointerId) return;

      const nextPosition = getPositionFromPointer(event.clientX, event.clientY);
      const distanceX = Math.abs(nextPosition.x - state.startPosition.x);
      const distanceY = Math.abs(nextPosition.y - state.startPosition.y);

      if (
        distanceX > DRAG_CLICK_THRESHOLD ||
        distanceY > DRAG_CLICK_THRESHOLD
      ) {
        didDragRef.current = true;
      }

      setDraftPosition(nextPosition);
    };

    const stopPointerTracking = () => {
      document.removeEventListener("pointermove", handleDocumentPointerMove);
      document.removeEventListener("pointerup", handleDocumentPointerUp);
      document.removeEventListener("pointercancel", handleDocumentPointerUp);
      pointerCleanupRef.current = null;
    };

    const handleDocumentPointerUp = (event: PointerEvent) => {
      const state = dragStateRef.current;
      if (!state || event.pointerId !== state.pointerId) return;

      const nextPosition = getPositionFromPointer(event.clientX, event.clientY);
      const item = getItemById(id);
      const trashElement = document.querySelector<HTMLElement>(
        '[data-finder-item-id="trash"]',
      );
      const trashRect = trashElement?.getBoundingClientRect();
      const isOverTrash =
        item?.type === "app" &&
        Boolean(item.savedIconId) &&
        trashRect &&
        event.clientX >= trashRect.left &&
        event.clientX <= trashRect.right &&
        event.clientY >= trashRect.top &&
        event.clientY <= trashRect.bottom;

      dragStateRef.current = null;
      stopPointerTracking();

      if (isOverTrash) {
        deleteSavedIconItem(id);
        return;
      }

      setDraftPosition(nextPosition);
      moveItem(id, nextPosition);
    };

    document.addEventListener("pointermove", handleDocumentPointerMove);
    document.addEventListener("pointerup", handleDocumentPointerUp);
    document.addEventListener("pointercancel", handleDocumentPointerUp);
    pointerCleanupRef.current = stopPointerTracking;
  };

  useEffect(
    () => () => {
      pointerCleanupRef.current?.();
    },
    [],
  );

  return (
    <FinderItem
      itemRef={folderRef}
      id={id}
      isActive={isActive}
      isOpened={isOpened}
      position={draftPosition}
      onDoubleClick={handleDoubleClick}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
    >
      <div className={s.folderIcon}>
        <FinderIcon
          id={id}
          type={icon}
          savedIconId={savedIconId}
        />
      </div>
      <FinderLabel>{name}</FinderLabel>
    </FinderItem>
  );
});
