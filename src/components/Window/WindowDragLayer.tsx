import { motion, type PanInfo } from "framer-motion";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

import { Z_INDEX } from "../../constants/zIndex";
import { useFileSystem } from "../../store/useFileSystem";
import {
  useWindowManager,
  type WindowInstance,
} from "../../store/useWindowManager";
import s from "./Window.module.scss";
import { arePositionsEqual, getContainedPosition } from "./windowGeometry";
import {
  getWindowTitlebarButtonSafeArea,
  getWindowTitlebarHeight,
} from "../../constants/windowLayout";

interface WindowDragLayerProps {
  id: string;
  position: WindowInstance["position"];
  size: WindowInstance["size"];
  zIndex: number;
  isFocused: boolean;
}

export const WindowDragLayer = memo(function WindowDragLayer({
  id,
  position,
  size,
  zIndex,
  isFocused,
}: WindowDragLayerProps) {
  const focusWindow = useWindowManager((state) => state.focusWindow);
  const moveWindow = useWindowManager((state) => state.moveWindow);
  const removeActive = useFileSystem((state) => state.removeActive);
  const [isDraggingProxy, setIsDraggingProxy] = useState(false);
  const [currentDragOffset, setCurrentDragOffset] = useState({ x: 0, y: 0 });
  const dragFrameRef = useRef<number | null>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  const focusOwner = useCallback(() => {
    focusWindow(id);
    removeActive();
  }, [focusWindow, id, removeActive]);

  const scheduleDragOffset = useCallback((offset: { x: number; y: number }) => {
    dragOffsetRef.current = offset;

    if (dragFrameRef.current !== null) return;

    dragFrameRef.current = window.requestAnimationFrame(() => {
      dragFrameRef.current = null;
      setCurrentDragOffset((currentOffset) =>
        arePositionsEqual(currentOffset, dragOffsetRef.current)
          ? currentOffset
          : dragOffsetRef.current,
      );
    });
  }, []);

  useEffect(
    () => () => {
      if (dragFrameRef.current !== null) {
        window.cancelAnimationFrame(dragFrameRef.current);
      }
    },
    [],
  );

  const handleDragStartProxy = () => {
    focusOwner();
    dragOffsetRef.current = { x: 0, y: 0 };
    setCurrentDragOffset({ x: 0, y: 0 });
    setIsDraggingProxy(true);
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    focusOwner();
  };

  const handleDragProxy = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    scheduleDragOffset({ x: info.offset.x, y: info.offset.y });
  };

  const handleDragEndProxy = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    if (dragFrameRef.current !== null) {
      window.cancelAnimationFrame(dragFrameRef.current);
      dragFrameRef.current = null;
    }

    setIsDraggingProxy(false);
    setCurrentDragOffset({ x: 0, y: 0 });
    moveWindow(
      id,
      getContainedPosition(
        {
          x: position.x + info.offset.x,
          y: position.y + info.offset.y,
        },
        size,
      ),
    );
    focusOwner();
  };

  const handleZIndex = isFocused ? Z_INDEX.windowFocused : zIndex;
  const titlebarButtonSafeArea = getWindowTitlebarButtonSafeArea();
  const handleWidth = Math.max(0, size.width - titlebarButtonSafeArea * 2);
  const handleHeight = getWindowTitlebarHeight();

  return (
    <>
      <motion.div
        className={s.dragHandle}
        drag
        dragMomentum={false}
        onPointerDown={handlePointerDown}
        onDragStart={handleDragStartProxy}
        onDrag={handleDragProxy}
        onDragEnd={handleDragEndProxy}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0}
        style={{
          position: "absolute",
          left: position.x + titlebarButtonSafeArea,
          top: position.y,
          width: handleWidth,
          height: handleHeight,
          cursor: "grab",
          zIndex: handleZIndex,
        }}
      />

      {isDraggingProxy && size.width > 0 && size.height > 0 && (
        <motion.div
          className={s.windowProxy}
          style={{
            zIndex: isFocused ? Z_INDEX.windowProxy : zIndex + 1,
            position: "absolute",
            left: position.x + currentDragOffset.x,
            top: position.y + currentDragOffset.y,
            width: size.width,
            height: size.height,
          }}
        />
      )}
    </>
  );
});
