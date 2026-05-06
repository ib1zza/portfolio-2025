import clsx from "clsx";
import { motion } from "framer-motion";
import { memo, useCallback, useState, useRef, useEffect } from "react";
import type {
  DragEvent as ReactDragEvent,
  MouseEvent as ReactMouseEvent,
} from "react";
import { useShallow } from "zustand/react/shallow";
import s from "./Window.module.scss";
import {
  useWindowManager,
  type WindowInstance,
} from "../../store/useWindowManager";
import { getChildItems, useFileSystem } from "../../store/useFileSystem";
import { Z_INDEX } from "../../constants/zIndex";
import { useWindowOpenAnimation } from "../WindowOpenAnimation";
import { useWindowFitToContent } from "./hooks/useWindowFitToContent";
import { useWindowScrollbars } from "./hooks/useWindowScrollbars";
import { WindowAppContent } from "./WindowAppContent";
import { WindowDocumentContent } from "./WindowDocumentContent";
import { WindowDragLayer } from "./WindowDragLayer";
import { WindowFinderData } from "./WindowFinderData";
import { WindowFolderContent } from "./WindowFolderContent";
import { WindowResizeLayer } from "./WindowResizeLayer";
import { WindowScrollbars } from "./WindowScrollbars";
import { WindowTitleBar } from "./WindowTitleBar";
import {
  MIN_HEIGHT,
  MIN_WIDTH,
} from "./windowGeometry";

interface WindowProps {
  data: WindowInstance;
}

export const Window = memo(function Window({ data }: WindowProps) {
  const { id, position, title, zIndex, fileId, size } = data;
  const focusWindow = useWindowManager((state) => state.focusWindow);
  const updateWindowBounds = useWindowManager(
    (state) => state.updateWindowBounds
  );
  const { closeWindowAnimated } = useWindowOpenAnimation();
  const isFocused = useWindowManager((state) => state.focusedWindowId === id);
  const removeActive = useFileSystem((state) => state.removeActive);
  const currentItem = useFileSystem((state) =>
    fileId ? state.items[fileId] : undefined
  );
  const childItems = useFileSystem(
    useShallow((state) =>
      fileId ? getChildItems(state.items, fileId) : []
    )
  );

  const windowRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const verticalTrackRef = useRef<HTMLDivElement>(null);
  const horizontalTrackRef = useRef<HTMLDivElement>(null);

  const [windowDimensions, setWindowDimensions] = useState({
    width: size.width,
    height: size.height,
  });

  const isFile = currentItem?.type === "file" || currentItem?.type === "app";

  const { commitWindowDimensions, handleZoomToFit } = useWindowFitToContent({
    contentRef,
    id,
    position,
    setWindowDimensions,
    size: windowDimensions,
    updateWindowBounds,
  });

  const {
    getThumbStyle,
    hasHorizontalScroll,
    hasVerticalScroll,
    scrollContent,
    startThumbDrag,
    updateScrollMetrics,
  } = useWindowScrollbars({
    contentRef,
    fileId,
    height: windowDimensions.height,
    horizontalTrackRef,
    verticalTrackRef,
    width: windowDimensions.width,
  });

  const handleWindowMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    focusWindow(id);
    if (!(event.target as HTMLElement).closest("[data-finder-item-id]")) {
      removeActive();
    }
  };

  const preventNativeDrag = (event: ReactDragEvent) => {
    event.preventDefault();
  };

  const handleCloseWindow = useCallback(() => {
    closeWindowAnimated(id);
  }, [closeWindowAnimated, id]);

  useEffect(() => {
    commitWindowDimensions(size);
  }, [commitWindowDimensions, size]);

  const renderChildren = () => {
    if (!fileId || !currentItem) return null;

    if (currentItem.type === "app") {
      return <WindowAppContent app={currentItem.app} />;
    }

    if (currentItem.type === "file") {
      return (
        <WindowDocumentContent
          content={currentItem.content}
          isActive={isFocused}
          onImageLoad={updateScrollMetrics}
        />
      );
    }

    return (
      <WindowFolderContent
        childItems={childItems}
        parentWindowId={id}
        constraintRef={contentRef}
      />
    );
  };

  return (
    <>
      <motion.div
        ref={windowRef}
        className={clsx(s.window, { [s.inactive]: !isFocused })}
        style={{
          zIndex: isFocused ? Z_INDEX.windowFocused : zIndex,
          position: "absolute",
          left: position.x,
          top: position.y,
          width: windowDimensions.width || "auto",
          height: windowDimensions.height || "auto",
          minHeight: MIN_HEIGHT,
          minWidth: MIN_WIDTH,
        }}
        onMouseDown={handleWindowMouseDown}
        draggable={false}
        onDragStartCapture={preventNativeDrag}
      >
        <WindowTitleBar
          onClose={handleCloseWindow}
          onZoomToFit={handleZoomToFit}
          title={title}
        />

        {!isFile && <WindowFinderData files={fileId ? childItems.length : 0} />}

        <WindowScrollbars
          contentRef={contentRef}
          getThumbStyle={getThumbStyle}
          hasHorizontalScroll={hasHorizontalScroll}
          hasVerticalScroll={hasVerticalScroll}
          horizontalTrackRef={horizontalTrackRef}
          scrollContent={scrollContent}
          startThumbDrag={startThumbDrag}
          updateScrollMetrics={updateScrollMetrics}
          verticalTrackRef={verticalTrackRef}
        >
          {renderChildren()}
        </WindowScrollbars>
      </motion.div>

      <WindowDragLayer
        id={id}
        position={position}
        size={windowDimensions}
        zIndex={zIndex}
        isFocused={isFocused}
      />
      <WindowResizeLayer
        id={id}
        position={position}
        size={windowDimensions}
        zIndex={zIndex}
        isFocused={isFocused}
      />
    </>
  );
});
