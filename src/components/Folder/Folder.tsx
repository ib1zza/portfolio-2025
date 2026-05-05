import clsx from "clsx";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import type { MouseEventHandler, PointerEventHandler, RefObject } from "react";

import s from "./Folder.module.scss";
import { useWindowManager } from "../../store/useWindowManager";
import { useFileSystem } from "../../store/useFileSystem";

interface FolderProps {
  id: string;
  name: string;
  position: { x: number; y: number };
  parentWindowId?: string;
  constraintRef?: RefObject<HTMLElement | null>;
  icon?: string; // icon name
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
}: FolderProps) {
  const openWindow = useWindowManager((state) => state.openWindow);
  const focusWindow = useWindowManager((state) => state.focusWindow);
  const unfocusAll = useWindowManager((state) => state.unfocusAll);
  const isOpened = useWindowManager((state) =>
    Object.values(state.windows).some((window) => window.fileId === id)
  );
  const setActive = useFileSystem((state) => state.setActive);
  const isActive = useFileSystem((state) => state.activeItemId === id);
  const moveItem = useFileSystem((state) => state.moveItem);
  const getItemById = useFileSystem((state) => state.getItemById);
  const folderRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const didDragRef = useRef(false);
  const [draftPosition, setDraftPosition] = useState(position);
  const isOpenedInactive = isOpened && !isActive;
  const patternId = `opened-pattern-${id}`;
  const folderClipId = `folder-clip-${id}`;

  useEffect(() => {
    setDraftPosition(position);
  }, [position]);

  const getBounds = useCallback(() => {
    const container = constraintRef?.current;
    const folder = folderRef.current;
    const desktopMinY = parentWindowId ? 0 : 21;

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
  const folderIcon = (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
    >
      <g clipPath={`url(#${folderClipId})`}>
        <path
          d="M11 8H5V9H4V10H3V11H2V12H1V31H30V12H14V11H13V10H12V9H11V8Z"
          fill={isOpenedInactive ? `url(#${patternId})` : "white"}
        />
        <path d="M5 7H11V8H5V7Z" fill="black" />
        <path d="M4 9V8H5V9H4Z" fill="black" />
        <path d="M3 10V9H4V10H3Z" fill="black" />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M3 11V10H2V11H1V12H0V32H31V12H30V11H14V10H13V9H12V8H11V9H12V10H13V11H3ZM1 12V31H30V12H1Z"
          fill="black"
        />
      </g>
      <defs>
        <pattern
          id={patternId}
          width="4"
          height="2"
          patternUnits="userSpaceOnUse"
        >
          <rect width="4" height="2" fill="white" />
          <rect x="0" y="0" width="1" height="1" fill="black" />
          <rect x="2" y="1" width="1" height="1" fill="black" />
        </pattern>
        <clipPath id={folderClipId}>
          <rect width="32" height="32" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );

  const fileIcon = (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
    >
      <path
        d="M21 1H4V31H27V7H21V1Z"
        fill={isOpenedInactive ? `url(#${patternId})` : "white"}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M22 0V1H23V2H22V6H26V5H27V6H28V32H3V0H22ZM4 31H27V7H21V1H4V31Z"
        fill="black"
      />
      <path d="M25 4H26V5H25V4Z" fill="black" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M24 3V2H23V3H24ZM24 3H25V4H24V3Z"
        fill="black"
      />
      <path
        d="M23 2H22V6H26V5H25V4H24V3H23V2Z"
        fill={isOpenedInactive ? `url(#${patternId})` : "white"}
      />
      <defs>
        <pattern
          id={patternId}
          width="4"
          height="2"
          patternUnits="userSpaceOnUse"
        >
          <rect width="4" height="2" fill="white" />
          <rect x="0" y="0" width="1" height="1" fill="black" />
          <rect x="2" y="1" width="1" height="1" fill="black" />
        </pattern>
      </defs>
    </svg>
  );

  const handleDoubleClick = () => {
    if (didDragRef.current) return;

    const item = getItemById(id);
    const hasProjectModel =
      item?.type === "file" &&
      Array.isArray(item.content) &&
      item.content.some((block) => block.type === "projectModel");

    openWindow(
      id,
      name,
      id,
      undefined,
      hasProjectModel
        ? { width: Math.min(900, window.innerWidth), height: 440 }
        : undefined
    );
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
    // TODO: связать папки и окна
    // focusWindowFromFolder(id);
  };

  const handlePointerDown: PointerEventHandler<HTMLDivElement> = (e) => {
    if (e.button !== 0) return;

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
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const state = dragStateRef.current;
      if (!state || e.pointerId !== state.pointerId) return;

      const nextPosition = getPositionFromPointer(e.clientX, e.clientY);
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

    const handlePointerUp = (e: PointerEvent) => {
      const state = dragStateRef.current;
      if (!state || e.pointerId !== state.pointerId) return;

      const nextPosition = getPositionFromPointer(e.clientX, e.clientY);
      dragStateRef.current = null;
      setDraftPosition(nextPosition);
      moveItem(id, nextPosition);
    };

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
    document.addEventListener("pointercancel", handlePointerUp);

    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [getPositionFromPointer, id, moveItem]);

  const getIcon = () => {
    switch (icon) {
      case "file":
        return fileIcon;
      case "folder":
      default:
        return folderIcon;
    }
  };

  return (
    <div
      ref={folderRef}
      className={clsx(s.folder, {
        [s.active]: isActive,
        [s.opened]: isOpenedInactive,
      })}
      style={{
        top: draftPosition.y,
        left: draftPosition.x,
        position: "absolute",
      }}
      onDoubleClick={handleDoubleClick}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
    >
      <div className={s.folderIcon}>{getIcon()}</div>
      <div className={s.folderName}>{name}</div>
    </div>
  );
});
