import clsx from "clsx";
import { motion } from "framer-motion";
import { memo, useCallback, useState, useRef, useEffect } from "react";
import type {
  MouseEventHandler,
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
  getAppWindowSize,
  getTopbarHeight,
  getWindowMinSize,
} from "../../constants/windowLayout";
import type { WindowAppId } from "../../constants/windowLayout";
import { useHaptics } from "../../hooks/useHaptics";

interface WindowProps {
  data: WindowInstance;
}

export const Window = memo(function Window({ data }: WindowProps) {
  const {
    id,
    position,
    title,
    zIndex,
    fileId,
    size,
    resizable = true,
    windowVariant = "default",
  } = data;
  const focusWindow = useWindowManager((state) => state.focusWindow);
  const updateWindowBounds = useWindowManager(
    (state) => state.updateWindowBounds,
  );
  const { closeWindowAnimated } = useWindowOpenAnimation();
  const isFocused = useWindowManager((state) => state.focusedWindowId === id);
  const removeActive = useFileSystem((state) => state.removeActive);
  const currentItem = useFileSystem((state) =>
    fileId ? state.items[fileId] : undefined,
  );
  const childItems = useFileSystem(
    useShallow((state) => (fileId ? getChildItems(state.items, fileId) : [])),
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
  const showFinderData = !isFile && windowVariant === "default";
  const minSize = getWindowMinSize();

  const { fileOpen, fileClose } = useHaptics();

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
    fileClose();
  }, [closeWindowAnimated, fileClose, id]);

  const handleFitWindow = useCallback<MouseEventHandler<HTMLButtonElement>>(
    (e) => {
      fileOpen();
      const itemAppId: WindowAppId | undefined =
        currentItem?.type === "app"
          ? currentItem.app
          : currentItem?.type === "file" && currentItem.openWithApp
            ? currentItem.openWithApp
            : undefined;

      if (itemAppId) {
        const targetSize = getAppWindowSize(itemAppId);
        const topbarHeight = getTopbarHeight();
        const nextPosition = {
          x: Math.min(position.x, Math.max(0, window.innerWidth - targetSize.width)),
          y: Math.min(
            Math.max(topbarHeight, position.y),
            Math.max(topbarHeight, window.innerHeight - targetSize.height),
          ),
        };
        commitWindowDimensions(targetSize);
        updateWindowBounds(id, { position: nextPosition, size: targetSize });
        return;
      }

      handleZoomToFit(e);
    },
    [fileOpen, handleZoomToFit, currentItem, commitWindowDimensions, updateWindowBounds, id, position],
  );

  useEffect(() => {
    commitWindowDimensions(size);
  }, [commitWindowDimensions, size]);

  const renderChildren = () => {
    if (!fileId || !currentItem) return null;

    if (currentItem.type === "app") {
      return (
        <WindowAppContent
          app={currentItem.app}
          isActive={isFocused}
          savedIconId={currentItem.savedIconId}
          title={currentItem.name}
          windowId={id}
        />
      );
    }

    if (currentItem.type === "file") {
      if (currentItem.openWithApp) {
        return (
          <WindowAppContent
            app={currentItem.openWithApp}
            isActive={isFocused}
            title={currentItem.name}
            windowId={id}
            fileUrl={currentItem.fileUrl}
          />
        );
      }

      return (
        <WindowDocumentContent
          content={currentItem.content}
          documentStyle={currentItem.documentStyle}
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
        data-window-id={id}
        className={clsx(
          s.window,
          windowVariant === "hypercard" && s.hypercardWindow,
          windowVariant === "note" && s.noteWindow,
          { [s.inactive]: !isFocused },
        )}
        style={{
          zIndex: isFocused ? Z_INDEX.windowFocused : zIndex,
          position: "absolute",
          left: position.x,
          top: position.y,
          width: windowDimensions.width || "auto",
          height: windowDimensions.height || "auto",
          minHeight: minSize.height,
          minWidth: minSize.width,
        }}
        onMouseDown={handleWindowMouseDown}
        draggable={false}
        onDragStartCapture={preventNativeDrag}
      >
        <WindowTitleBar
          onClose={handleCloseWindow}
          onZoomToFit={handleFitWindow}
          showZoomToFit={resizable}
          title={title}
          variant={windowVariant}
        />

        {showFinderData && (
          <WindowFinderData files={fileId ? childItems.length : 0} />
        )}

        <WindowScrollbars
          contentRef={contentRef}
          getThumbStyle={getThumbStyle}
          hasHorizontalScroll={hasHorizontalScroll}
          hasVerticalScroll={hasVerticalScroll}
          horizontalTrackRef={horizontalTrackRef}
          scrollContent={scrollContent}
          showControls={windowVariant === "default"}
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
      {resizable && (
        <WindowResizeLayer
          id={id}
          position={position}
          size={windowDimensions}
          zIndex={zIndex}
          isFocused={isFocused}
        />
      )}
    </>
  );
});
