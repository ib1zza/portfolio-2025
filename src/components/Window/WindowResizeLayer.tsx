import { motion } from "framer-motion";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";

import { Z_INDEX } from "../../constants/zIndex";
import {
  useWindowManager,
  type WindowInstance,
} from "../../store/useWindowManager";
import s from "./Window.module.scss";
import {
  areSizesEqual,
  getContainedPosition,
  getResizableSize,
} from "./windowGeometry";
import { getWindowResizeHandleSize } from "../../constants/windowLayout";

interface WindowResizeLayerProps {
  id: string;
  position: WindowInstance["position"];
  size: WindowInstance["size"];
  zIndex: number;
  isFocused: boolean;
}

export const WindowResizeLayer = memo(function WindowResizeLayer({
  id,
  position,
  size,
  zIndex,
  isFocused,
}: WindowResizeLayerProps) {
  const focusWindow = useWindowManager((state) => state.focusWindow);
  const updateWindowBounds = useWindowManager(
    (state) => state.updateWindowBounds
  );
  const [isResizingProxy, setIsResizingProxy] = useState(false);
  const [proxySize, setProxySize] = useState(size);
  const resizeFrameRef = useRef<number | null>(null);
  const resizeDraftSizeRef = useRef(size);
  const startMouseRef = useRef({ x: 0, y: 0 });
  const startSizeRef = useRef(size);

  useEffect(() => {
    if (!isResizingProxy) {
      setProxySize(size);
      resizeDraftSizeRef.current = size;
    }
  }, [isResizingProxy, size]);

  useEffect(
    () => () => {
      if (resizeFrameRef.current !== null) {
        window.cancelAnimationFrame(resizeFrameRef.current);
      }
    },
    []
  );

  const scheduleProxySize = useCallback((nextSize: WindowInstance["size"]) => {
    resizeDraftSizeRef.current = nextSize;

    if (resizeFrameRef.current !== null) return;

    resizeFrameRef.current = window.requestAnimationFrame(() => {
      resizeFrameRef.current = null;
      setProxySize((currentSize) =>
        areSizesEqual(currentSize, resizeDraftSizeRef.current)
          ? currentSize
          : resizeDraftSizeRef.current
      );
    });
  }, []);

  const handleResizeMouseDown = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    focusWindow(id);
    startMouseRef.current = { x: event.clientX, y: event.clientY };
    startSizeRef.current = size;
    resizeDraftSizeRef.current = size;
    setProxySize(size);
    setIsResizingProxy(true);
  };

  useEffect(() => {
    if (!isResizingProxy) return;

    const handleMouseMove = (event: MouseEvent) => {
      const dx = event.clientX - startMouseRef.current.x;
      const dy = event.clientY - startMouseRef.current.y;

      scheduleProxySize(
        getResizableSize(position, {
          width: startSizeRef.current.width + dx,
          height: startSizeRef.current.height + dy,
        })
      );
    };

    const handleMouseUp = () => {
      if (resizeFrameRef.current !== null) {
        window.cancelAnimationFrame(resizeFrameRef.current);
        resizeFrameRef.current = null;
      }

      const nextSize = resizeDraftSizeRef.current;

      setProxySize(nextSize);
      setIsResizingProxy(false);
      updateWindowBounds(id, {
        position: getContainedPosition(position, nextSize),
        size: nextSize,
      });
      focusWindow(id);

      const suppressNextClick = (event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        document.removeEventListener("click", suppressNextClick, true);
        focusWindow(id);
      };

      document.addEventListener("click", suppressNextClick, true);
      window.setTimeout(() => {
        document.removeEventListener("click", suppressNextClick, true);
      }, 0);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    id,
    isResizingProxy,
    position,
    scheduleProxySize,
    focusWindow,
    updateWindowBounds,
  ]);

  const layerZIndex = isFocused ? Z_INDEX.windowFocused : zIndex;
  const resizeHandleSize = getWindowResizeHandleSize();

  return (
    <>
      <button
        aria-label="Resize window"
        className={s.windowResizeHitbox}
        onMouseDown={handleResizeMouseDown}
        style={{
          left: position.x + size.width - resizeHandleSize,
          top: position.y + size.height - resizeHandleSize,
          width: resizeHandleSize,
          height: resizeHandleSize,
          zIndex: layerZIndex,
        }}
      />

      {isResizingProxy && (
        <motion.div
          className={s.windowProxy}
          style={{
            zIndex: isFocused ? Z_INDEX.windowProxy : zIndex + 1,
            position: "absolute",
            left: position.x,
            top: position.y,
            width: proxySize.width,
            height: proxySize.height,
          }}
        />
      )}
    </>
  );
});
