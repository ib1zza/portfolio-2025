import clsx from "clsx";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import type { MouseEventHandler, PointerEventHandler, RefObject } from "react";

import s from "./Folder.module.scss";
import { useWindowManager } from "../../store/useWindowManager";
import { useFileSystem } from "../../store/useFileSystem";
import { useWindowOpenAnimation } from "../WindowOpenAnimation";
import { getAssetPath } from "../../utils/assets";

interface FolderProps {
  id: string;
  name: string;
  position: { x: number; y: number };
  parentWindowId?: string;
  constraintRef?: RefObject<HTMLElement | null>;
  icon?: "folder" | "file" | "app" | "vk" | "telegram" | "email" | "github";
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
  const { openWindowAnimated } = useWindowOpenAnimation();
  const focusWindow = useWindowManager((state) => state.focusWindow);
  const unfocusAll = useWindowManager((state) => state.unfocusAll);
  const isOpened = useWindowManager((state) =>
    Object.values(state.windows).some((window) => window.fileId === id),
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

  const vkIcon = (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
    >
      <path d="M5 3H27V4H28V28H27V29H5V28H4V4H5V3Z" fill="black" />
      <path d="M5 4H27V28H5V4Z" fill="white" />
      <path d="M7 6H25V7H26V10H25V11H7V10H6V7H7V6Z" fill="black" />
      <path d="M8 7H24V9H8V7Z" fill="white" />
      <path
        d="M7 13H10V18H11V21H12V23H14V21H15V18H16V13H19V19H18V22H17V24H16V26H10V24H9V22H8V19H7V13Z"
        fill="black"
      />
      <path
        d="M19 13H22V18H23V17H24V15H25V13H27V16H26V18H25V20H24V21H25V23H26V26H24V24H23V22H22V26H19V13Z"
        fill="black"
      />
    </svg>
  );

  const githubIcon = (
    <svg
      id="Github"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      shape-rendering="crispEdges"
    >
      <rect x="5" y="5" width="14" height="11" fill="white" />
      <rect x="3" y="16" width="14" height="3" fill="white" />
      <rect x="6" y="19" width="10" height="3" fill="white" />
      <rect x="9" y="22" width="6" height="1" fill="white" />

      <polygon
        fill="currentColor"
        points="23 9 23 15 22 15 22 17 21 17 21 19 20 19 20 20 19 20 19 21 18 21 18 22 16 22 16 23 15 23 15 18 14 18 14 17 15 17 15 16 17 16 17 15 18 15 18 14 19 14 19 9 18 9 18 6 16 6 16 7 15 7 15 8 14 8 14 7 10 7 10 8 9 8 9 7 8 7 8 6 6 6 6 9 5 9 5 14 6 14 6 15 7 15 7 16 9 16 9 18 7 18 7 17 6 17 6 16 4 16 4 17 5 17 5 19 6 19 6 20 9 20 9 23 8 23 8 22 6 22 6 21 5 21 5 20 4 20 4 19 3 19 3 17 2 17 2 15 1 15 1 9 2 9 2 7 3 7 3 5 4 5 4 4 5 4 5 3 7 3 7 2 9 2 9 1 15 1 15 2 17 2 17 3 19 3 19 4 20 4 20 5 21 5 21 7 22 7 22 9 23 9"
      />
    </svg>
  );

  const telegramIcon = (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
    >
      <path
        d="M3 15H4V14H6V13H8V12H10V11H12V10H14V9H16V8H18V7H20V6H22V5H26V6H27V9H26V12H25V15H24V18H23V21H22V24H21V27H18V26H17V25H16V24H15V23H14V22H13V21H12V20H11V19H7V18H4V17H3V15Z"
        fill="black"
      />
      <path
        d="M6 15H8V14H10V13H12V12H14V11H16V10H18V9H20V8H22V7H24V8H23V11H22V14H21V17H20V20H19V23H18V22H17V21H16V20H15V19H14V18H13V17H10V16H6V15Z"
        fill="white"
      />
      <path
        d="M12 17H13V16H14V15H15V14H16V13H17V12H18V11H19V10H21V11H20V12H19V13H18V14H17V15H16V16H15V17H14V18H13V19H12V17Z"
        fill="black"
      />
    </svg>
  );

  const emailIcon = (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
    >
      <path d="M3 9H29V10H30V24H29V25H3V24H2V10H3V9Z" fill="black" />
      <path d="M4 11H28V23H4V11Z" fill="white" />
      <path
        d="M5 12H7V13H8V14H9V15H10V16H11V17H12V18H13V19H14V20H18V19H19V18H20V17H21V16H22V15H23V14H24V13H25V12H27V13H26V14H25V15H24V16H23V17H22V18H21V19H20V20H19V21H13V20H12V19H11V18H10V17H9V16H8V15H7V14H6V13H5V12Z"
        fill="black"
      />
      <path
        d="M5 22H7V21H8V20H9V19H10V18H11V19H10V20H9V21H8V22H7V23H5V22Z"
        fill="black"
      />
      <path
        d="M27 22H25V21H24V20H23V19H22V18H21V19H22V20H23V21H24V22H25V23H27V22Z"
        fill="black"
      />
    </svg>
  );

  const appIcon = (
    <img
      src={getAssetPath("/icons/icon-drawer.svg")}
      alt=""
      draggable={false}
    />
  );

  const handleDoubleClick = () => {
    if (didDragRef.current) return;

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
    const preferredSize =
      item?.type === "app"
        ? { width: 640, height: 492 }
        : hasProjectModel
          ? { width: Math.min(900, window.innerWidth), height: 440 }
          : undefined;

    setActive(id);
    openWindowAnimated({
      id,
      title: name,
      parentId: id,
      sourceRect: folderRef.current?.getBoundingClientRect(),
      preferredSize,
      openerWindowId: parentWindowId,
    });
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
      case "app":
        return appIcon;
      case "vk":
        return vkIcon;
      case "telegram":
        return telegramIcon;
      case "email":
        return emailIcon;
      case "github":
        return githubIcon;
      case "folder":
      default:
        return folderIcon;
    }
  };

  return (
    <div
      ref={folderRef}
      data-finder-item-id={id}
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
      onDragStart={(event) => event.preventDefault()}
    >
      <div className={s.folderIcon}>{getIcon()}</div>
      <div className={s.folderName}>{name}</div>
    </div>
  );
});
