import clsx from "clsx";
import { motion, type PanInfo } from "framer-motion";
import {
  lazy,
  memo,
  Suspense,
  useCallback,
  useState,
  useRef,
  useEffect,
} from "react";
import type {
  DragEvent as ReactDragEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import { useShallow } from "zustand/react/shallow";
import s from "./Window.module.scss";
import {
  useWindowManager,
  type WindowInstance,
} from "../../store/useWindowManager";
import {
  useFileSystem,
  type DocumentBlock,
} from "../../store/useFileSystem";
import Folder from "../Folder";
import { Z_INDEX } from "../../constants/zIndex";
import { useWindowOpenAnimation } from "../WindowOpenAnimation";
import { getAssetPath } from "../../utils/assets";

const ProjectModelViewer = lazy(() =>
  import("../ProjectModelViewer").then((module) => ({
    default: module.ProjectModelViewer,
  }))
);

interface WindowProps {
  data: WindowInstance;
}

interface WindowDragLayerProps {
  id: string;
  position: WindowInstance["position"];
  size: WindowInstance["size"];
  zIndex: number;
  isFocused: boolean;
}

interface WindowResizeLayerProps {
  id: string;
  position: WindowInstance["position"];
  size: WindowInstance["size"];
  zIndex: number;
  isFocused: boolean;
}

interface ScrollMetrics {
  scrollLeft: number;
  scrollTop: number;
  scrollWidth: number;
  scrollHeight: number;
  clientWidth: number;
  clientHeight: number;
  verticalTrackHeight: number;
  horizontalTrackWidth: number;
}

const MIN_WIDTH = 300;
const MIN_HEIGHT = 132;
const TOPBAR_HEIGHT = 21;
const RESIZE_HANDLE_SIZE = 15;
const TITLEBAR_BUTTON_SAFE_AREA = 30;

const INITIAL_SCROLL_METRICS: ScrollMetrics = {
  scrollLeft: 0,
  scrollTop: 0,
  scrollWidth: 0,
  scrollHeight: 0,
  clientWidth: 0,
  clientHeight: 0,
  verticalTrackHeight: 0,
  horizontalTrackWidth: 0,
};

const areSizesEqual = (
  a: { width: number; height: number },
  b: { width: number; height: number }
) => a.width === b.width && a.height === b.height;

const arePositionsEqual = (
  a: { x: number; y: number },
  b: { x: number; y: number }
) => a.x === b.x && a.y === b.y;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const getContainedPosition = (
  position: WindowInstance["position"],
  size: WindowInstance["size"]
) => ({
  x: clamp(position.x, 0, Math.max(0, window.innerWidth - size.width)),
  y: clamp(
    position.y,
    TOPBAR_HEIGHT,
    Math.max(TOPBAR_HEIGHT, window.innerHeight - size.height)
  ),
});

const getResizableSize = (
  position: WindowInstance["position"],
  size: WindowInstance["size"]
) => ({
  width: clamp(
    size.width,
    MIN_WIDTH,
    Math.max(MIN_WIDTH, window.innerWidth - position.x)
  ),
  height: clamp(
    size.height,
    MIN_HEIGHT,
    Math.max(MIN_HEIGHT, window.innerHeight - position.y)
  ),
});

const areScrollMetricsEqual = (a: ScrollMetrics, b: ScrollMetrics) =>
  a.scrollLeft === b.scrollLeft &&
  a.scrollTop === b.scrollTop &&
  a.scrollWidth === b.scrollWidth &&
  a.scrollHeight === b.scrollHeight &&
  a.clientWidth === b.clientWidth &&
  a.clientHeight === b.clientHeight &&
  a.verticalTrackHeight === b.verticalTrackHeight &&
  a.horizontalTrackWidth === b.horizontalTrackWidth;

const getNumericStyleValue = (style: CSSStyleDeclaration, property: string) =>
  parseFloat(style.getPropertyValue(property)) || 0;

const getArticleContentSize = (article: HTMLElement) => {
  const articleRect = article.getBoundingClientRect();
  const articleStyle = window.getComputedStyle(article);
  const paddingRight = getNumericStyleValue(articleStyle, "padding-right");
  const paddingBottom = getNumericStyleValue(articleStyle, "padding-bottom");
  let width = 0;
  let height = 0;

  Array.from(article.children).forEach((child) => {
    const element = child as HTMLElement;
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    const marginRight = getNumericStyleValue(style, "margin-right");
    const marginBottom = getNumericStyleValue(style, "margin-bottom");

    width = Math.max(
      width,
      rect.right - articleRect.left + marginRight + paddingRight
    );
    height = Math.max(
      height,
      rect.bottom - articleRect.top + marginBottom + paddingBottom
    );
  });

  return {
    width: Math.ceil(width || article.scrollWidth),
    height: Math.ceil(height || article.scrollHeight),
  };
};

const getContentSize = (node: HTMLElement) => {
  const children = Array.from(node.children) as HTMLElement[];

  if (!children.length) {
    return { width: node.scrollWidth, height: node.scrollHeight };
  }

  if (children.length === 1 && children[0].tagName === "ARTICLE") {
    return getArticleContentSize(children[0]);
  }

  const nodeRect = node.getBoundingClientRect();
  let width = 0;
  let height = 0;

  children.forEach((child) => {
    const rect = child.getBoundingClientRect();
    const style = window.getComputedStyle(child);
    const marginRight = getNumericStyleValue(style, "margin-right");
    const marginBottom = getNumericStyleValue(style, "margin-bottom");

    width = Math.max(
      width,
      rect.right - nodeRect.left + node.scrollLeft + marginRight
    );
    height = Math.max(
      height,
      rect.bottom - nodeRect.top + node.scrollTop + marginBottom
    );
  });

  return {
    width: Math.ceil(width || node.scrollWidth),
    height: Math.ceil(height || node.scrollHeight),
  };
};

const WindowDragLayer = memo(function WindowDragLayer({
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
          : dragOffsetRef.current
      );
    });
  }, []);

  useEffect(
    () => () => {
      if (dragFrameRef.current !== null) {
        window.cancelAnimationFrame(dragFrameRef.current);
      }
    },
    []
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
    info: PanInfo
  ) => {
    scheduleDragOffset({ x: info.offset.x, y: info.offset.y });
  };

  const handleDragEndProxy = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
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
        size
      )
    );
    focusOwner();
  };

  const handleZIndex = isFocused ? Z_INDEX.windowFocused : zIndex;
  const handleWidth = Math.max(0, size.width - TITLEBAR_BUTTON_SAFE_AREA * 2);

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
          left: position.x + TITLEBAR_BUTTON_SAFE_AREA,
          top: position.y,
          width: handleWidth,
          height: 17,
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

const WindowResizeLayer = memo(function WindowResizeLayer({
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

  const scheduleProxySize = useCallback(
    (nextSize: WindowInstance["size"]) => {
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
    },
    []
  );

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

  return (
    <>
      <button
        aria-label="Resize window"
        className={s.windowResizeHitbox}
        onMouseDown={handleResizeMouseDown}
        style={{
          left: position.x + size.width - RESIZE_HANDLE_SIZE,
          top: position.y + size.height - RESIZE_HANDLE_SIZE,
          width: RESIZE_HANDLE_SIZE,
          height: RESIZE_HANDLE_SIZE,
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
      fileId
        ? Object.values(state.items).filter((item) => item.parentId === fileId)
        : []
    )
  );

  const windowRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const verticalTrackRef = useRef<HTMLDivElement>(null);
  const horizontalTrackRef = useRef<HTMLDivElement>(null);
  const scrollMetricsFrameRef = useRef<number | null>(null);
  const scrollDragRef = useRef<{
    axis: "x" | "y";
    pointerStart: number;
    scrollStart: number;
    maxScroll: number;
    maxThumbOffset: number;
  } | null>(null);

  const [windowDimensions, setWindowDimensions] = useState({
    width: size.width,
    height: size.height,
  });
  const [scrollMetrics, setScrollMetrics] = useState(INITIAL_SCROLL_METRICS);
  const scrollMetricsRef = useRef(INITIAL_SCROLL_METRICS);

  const isFile = currentItem?.type === "file";

  const hasVerticalScroll =
    scrollMetrics.scrollHeight > scrollMetrics.clientHeight + 1;
  const hasHorizontalScroll =
    scrollMetrics.scrollWidth > scrollMetrics.clientWidth + 1;

  const commitWindowDimensions = useCallback(
    (nextSize: { width: number; height: number }) => {
      setWindowDimensions((currentSize) =>
        areSizesEqual(currentSize, nextSize) ? currentSize : nextSize
      );
    },
    []
  );

  useEffect(() => {
    commitWindowDimensions(size);
  }, [commitWindowDimensions, size]);

  const updateScrollMetrics = useCallback(() => {
    const node = contentRef.current;
    if (!node) return;

    const nextMetrics = {
      scrollLeft: node.scrollLeft,
      scrollTop: node.scrollTop,
      scrollWidth: node.scrollWidth,
      scrollHeight: node.scrollHeight,
      clientWidth: node.clientWidth,
      clientHeight: node.clientHeight,
      verticalTrackHeight: verticalTrackRef.current?.clientHeight ?? 0,
      horizontalTrackWidth: horizontalTrackRef.current?.clientWidth ?? 0,
    };

    if (areScrollMetricsEqual(scrollMetricsRef.current, nextMetrics)) return;

    scrollMetricsRef.current = nextMetrics;
    setScrollMetrics(nextMetrics);
  }, []);

  const scheduleScrollMetricsUpdate = useCallback(() => {
    if (scrollMetricsFrameRef.current !== null) return;

    scrollMetricsFrameRef.current = window.requestAnimationFrame(() => {
      scrollMetricsFrameRef.current = null;
      updateScrollMetrics();
    });
  }, [updateScrollMetrics]);

  useEffect(
    () => () => {
      if (scrollMetricsFrameRef.current !== null) {
        window.cancelAnimationFrame(scrollMetricsFrameRef.current);
      }
    },
    []
  );

  useEffect(() => {
    updateScrollMetrics();
  }, [fileId, windowDimensions.width, windowDimensions.height, updateScrollMetrics]);

  useEffect(() => {
    const node = contentRef.current;
    if (!node) return;

    const resizeObserver = new ResizeObserver(scheduleScrollMetricsUpdate);
    resizeObserver.observe(node);
    if (node.firstElementChild) resizeObserver.observe(node.firstElementChild);

    return () => resizeObserver.disconnect();
  }, [fileId, scheduleScrollMetricsUpdate]);

  const scrollContent = (deltaLeft: number, deltaTop: number) => {
    contentRef.current?.scrollBy({
      left: deltaLeft,
      top: deltaTop,
      behavior: "smooth",
    });
  };

  const getThumbStyle = (axis: "x" | "y") => {
    const isY = axis === "y";
    const client = isY ? scrollMetrics.clientHeight : scrollMetrics.clientWidth;
    const track = isY
      ? scrollMetrics.verticalTrackHeight
      : scrollMetrics.horizontalTrackWidth;
    const scroll = isY ? scrollMetrics.scrollHeight : scrollMetrics.scrollWidth;
    const offset = isY ? scrollMetrics.scrollTop : scrollMetrics.scrollLeft;
    const size = scroll ? Math.max(16, (client / scroll) * track) : 16;
    const maxOffset = Math.max(1, scroll - client);
    const maxThumbOffset = Math.max(0, track - size);
    const position = (offset / maxOffset) * maxThumbOffset;

    return isY
      ? { height: size, transform: `translateY(${position}px)` }
      : { width: size, transform: `translateX(${position}px)` };
  };

  const startThumbDrag = (
    event: ReactPointerEvent<HTMLDivElement>,
    axis: "x" | "y"
  ) => {
    const node = contentRef.current;
    if (!node) return;

    const isY = axis === "y";
    const client = isY ? scrollMetrics.clientHeight : scrollMetrics.clientWidth;
    const track = isY
      ? scrollMetrics.verticalTrackHeight
      : scrollMetrics.horizontalTrackWidth;
    const scroll = isY ? scrollMetrics.scrollHeight : scrollMetrics.scrollWidth;
    const maxScroll = Math.max(0, scroll - client);
    const thumbSize = scroll ? Math.max(16, (client / scroll) * track) : 16;

    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);

    scrollDragRef.current = {
      axis,
      pointerStart: isY ? event.clientY : event.clientX,
      scrollStart: isY ? node.scrollTop : node.scrollLeft,
      maxScroll,
      maxThumbOffset: Math.max(1, track - thumbSize),
    };
  };

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const drag = scrollDragRef.current;
      const node = contentRef.current;
      if (!drag || !node) return;

      const isY = drag.axis === "y";
      const pointer = isY ? event.clientY : event.clientX;
      const delta = pointer - drag.pointerStart;
      const nextScroll =
        drag.scrollStart + (delta / drag.maxThumbOffset) * drag.maxScroll;

      if (isY) {
        node.scrollTop = nextScroll;
      } else {
        node.scrollLeft = nextScroll;
      }

      scheduleScrollMetricsUpdate();
    };

    const handlePointerUp = () => {
      scrollDragRef.current = null;
    };

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
    document.addEventListener("pointercancel", handlePointerUp);

    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [scheduleScrollMetricsUpdate]);

  const handleWindowMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    focusWindow(id);
    if (!(event.target as HTMLElement).closest("[data-finder-item-id]")) {
      removeActive();
    }
  };

  const preventNativeDrag = (event: ReactDragEvent) => {
    event.preventDefault();
  };

  const handleZoomToFit = (e: ReactMouseEvent) => {
    e.stopPropagation();
    const node = contentRef.current;
    if (!node) return;

    const contentSize = getContentSize(node);
    const chromeWidth = windowDimensions.width - node.clientWidth;
    const chromeHeight = windowDimensions.height - node.clientHeight;
    const maxWidth = window.innerWidth;
    const maxHeight = window.innerHeight - TOPBAR_HEIGHT;
    const nextWidth = Math.min(
      maxWidth,
      Math.max(MIN_WIDTH, contentSize.width + chromeWidth)
    );
    const nextHeight = Math.min(
      maxHeight,
      Math.max(MIN_HEIGHT, contentSize.height + chromeHeight)
    );
    const nextPosition = {
      x: Math.min(position.x, Math.max(0, window.innerWidth - nextWidth)),
      y: Math.min(
        Math.max(TOPBAR_HEIGHT, position.y),
        Math.max(TOPBAR_HEIGHT, window.innerHeight - nextHeight)
      ),
    };

    commitWindowDimensions({ width: nextWidth, height: nextHeight });
    updateWindowBounds(id, {
      position: nextPosition,
      size: { width: nextWidth, height: nextHeight },
    });
  };

  const renderDocument = (content: string | DocumentBlock[]) => {
    if (typeof content === "string") {
      return <div className={s.contentText}>{content}</div>;
    }

    const projectModel = content.find((block) => block.type === "projectModel");
    const textBlocks = content.filter((block) => block.type !== "projectModel");

    return (
      <article className={s.document}>
        <div className={s.documentText}>
        {textBlocks.map((block, index) => {
          switch (block.type) {
            case "title":
              return <h1 key={index}>{block.text}</h1>;
            case "heading":
              return <h2 key={index}>{block.text}</h2>;
            case "paragraph":
              return <p key={index}>{block.text}</p>;
            case "meta":
              return (
                <p key={index} className={s.documentMeta}>
                  <span>{block.label}:</span> {block.value}
                </p>
              );
            case "list":
              return (
                <ul key={index}>
                  {block.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              );
            case "links":
              return (
                <ul key={index} className={s.documentLinks}>
                  {block.items.map((item) => (
                    <li key={item.href}>
                      <a href={item.href} target="_blank" rel="noreferrer">
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              );
            case "image":
              return (
                <figure key={index}>
                  <img
                    src={getAssetPath(block.src)}
                    alt={block.alt}
                    onLoad={updateScrollMetrics}
                  />
                  {block.caption && <figcaption>{block.caption}</figcaption>}
                </figure>
              );
          }
        })}
        </div>
        {projectModel?.type === "projectModel" && (
          <Suspense fallback={<div className={s.modelFallback} />}>
            <ProjectModelViewer model={projectModel.model} />
          </Suspense>
        )}
      </article>
    );
  };

  const renderChildren = () => {
    if (fileId) {
      if (currentItem?.type === "file") {
        return renderDocument(currentItem.content);
      }

      const getDefaultPosition = (index: number) => ({
        x: 16 + (index % 3) * 112,
        y: 14 + Math.floor(index / 3) * 58,
      });

      const arrToRender = childItems.map((child, i) => {
        const itemPosition = child.position ?? getDefaultPosition(i);

        if (child.type === "folder") {
          return (
            <Folder
              key={child.id}
              id={child.id}
              name={child.name}
              position={itemPosition}
              parentWindowId={id}
              constraintRef={contentRef}
            />
          );
        }
        if (child.type === "file") {
          return (
            <Folder
              key={child.id}
              id={child.id}
              name={child.name}
              position={itemPosition}
              parentWindowId={id}
              constraintRef={contentRef}
              icon="file"
            />
          );
        }
        if (child.type === "link") {
          return (
            <Folder
              key={child.id}
              id={child.id}
              name={child.name}
              position={itemPosition}
              parentWindowId={id}
              constraintRef={contentRef}
              icon={child.icon}
            />
          );
        }

        return null;
      });
      return arrToRender;
    }
  };

  const finderData = {
    files: fileId ? childItems.length : 0,
    inDisk: "64 MB",
    available: "128 MB",
  };

  const arrowIcon = (
    <svg
      width="12"
      height="10"
      viewBox="0 0 12 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7 0H5V1H4V2H3V3H2V4H1V5H0V6H3V10H9V6H12V5H11V4H10V3H9V2H8V1H7V0ZM7 1V2H8V3H9V4H10V5H8V9H4V5H2V4H3V3H4V2H5V1H7Z"
        fill="black"
      />
      <path d="M7 1H5V2H4V3H3V4H2V5H4V9H8V5H10V4H9V3H8V2H7V1Z" />
    </svg>
  );

  return (
    <>
      {/* Основное окно */}
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
        <div className={s.windowTop}>
          <div className={s.buttonContainer}>
            <button
              className={s.windowTopButton}
              onClick={() => closeWindowAnimated(id)}
            >
              <img
                src={getAssetPath("/icons/sparkle.svg")}
                alt="sparkle"
                draggable={false}
              />
            </button>
          </div>
          <div className={s.title}>{title}</div>
          <div className={s.buttonContainer}>
            <button
              className={clsx(s.windowTopButton, s.windowTopButtonClose)}
              onClick={handleZoomToFit}
            >
              <img
                src={getAssetPath("/icons/sparkle.svg")}
                alt="sparkle"
                draggable={false}
              />
            </button>
          </div>
        </div>

        {!isFile && finderData && (
          <div className={s.finderData}>
            <div className={s.finderItemsCount}>
              {finderData.files} item
              {finderData.files > 1 && "s"}
            </div>
            <div className={s.finderInDisk}>{finderData.inDisk} in disk</div>
            <div className={s.finderAvailable}>
              {finderData.available} available
            </div>
          </div>
        )}

        <div className={s.content}>
          <div
            ref={contentRef}
            onScroll={updateScrollMetrics}
            className={clsx(s.contentWindow, {
              [s.needToScrollHorizontal]: hasHorizontalScroll,
              [s.needToScrollVertical]: hasVerticalScroll,
            })}
          >
            {renderChildren()}
          </div>
          <div className={s.verticalScroll}>
            <button
              className={clsx(s.navigationButton, s.navigationButtonUp)}
              onClick={() => scrollContent(0, -48)}
              disabled={!hasVerticalScroll}
            >
              {arrowIcon}
            </button>
            <div
              ref={verticalTrackRef}
              className={clsx(s.verticalScrollBar, {
                [s.emptyScrollBar]: !hasVerticalScroll,
              })}
            >
              {hasVerticalScroll && (
                <div
                  className={s.scrollThumb}
                  style={getThumbStyle("y")}
                  onPointerDown={(event) => startThumbDrag(event, "y")}
                />
              )}
            </div>
            <button
              className={clsx(s.navigationButton, s.navigationButtonDown)}
              onClick={() => scrollContent(0, 48)}
              disabled={!hasVerticalScroll}
            >
              {arrowIcon}
            </button>
          </div>
          <div className={s.horizontalScroll}>
            <button
              className={clsx(s.navigationButton, s.navigationButtonLeft)}
              onClick={() => scrollContent(-48, 0)}
              disabled={!hasHorizontalScroll}
            >
              {arrowIcon}
            </button>
            <div
              ref={horizontalTrackRef}
              className={clsx(s.horizontalScrollBar, {
                [s.emptyScrollBar]: !hasHorizontalScroll,
              })}
            >
              {hasHorizontalScroll && (
                <div
                  className={s.scrollThumb}
                  style={getThumbStyle("x")}
                  onPointerDown={(event) => startThumbDrag(event, "x")}
                />
              )}
            </div>
            <button
              className={clsx(s.navigationButton, s.navigationButtonRight)}
              onClick={() => scrollContent(48, 0)}
              disabled={!hasHorizontalScroll}
            >
              {arrowIcon}
            </button>
          </div>

          {/* 👇 теперь ресайз работает */}
          <button
            className={s.windowResize}
            tabIndex={-1}
            aria-hidden="true"
          ></button>
        </div>
      </motion.div>

      {/* Прокси-элемент */}
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
