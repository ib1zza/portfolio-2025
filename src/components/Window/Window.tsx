import clsx from "clsx";
import { motion, type PanInfo } from "framer-motion";
import { lazy, Suspense, useCallback, useState, useRef, useEffect } from "react";
import type {
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
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

const ProjectModelViewer = lazy(() =>
  import("../ProjectModelViewer").then((module) => ({
    default: module.ProjectModelViewer,
  }))
);

interface WindowProps {
  data: WindowInstance;
}

export function Window({ data }: WindowProps) {
  const {
    focusWindow,
    moveWindow,
    updateWindowBounds,
    closeWindow,
    focusedWindowId,
  } =
    useWindowManager();
  const { getChildren, setActive, getItemById } = useFileSystem();
  const { id, position, title, zIndex, fileId, parentId, size } = data;

  const [isDraggingProxy, setIsDraggingProxy] = useState(false);
  const [currentDragOffset, setCurrentDragOffset] = useState({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const verticalTrackRef = useRef<HTMLDivElement>(null);
  const horizontalTrackRef = useRef<HTMLDivElement>(null);
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
  const [scrollMetrics, setScrollMetrics] = useState({
    scrollLeft: 0,
    scrollTop: 0,
    scrollWidth: 0,
    scrollHeight: 0,
    clientWidth: 0,
    clientHeight: 0,
    verticalTrackHeight: 0,
    horizontalTrackWidth: 0,
  });

  // --- 🔧 Добавлено: состояние для ресайза
  const [isResizing, setIsResizing] = useState(false);
  const startMouse = useRef({ x: 0, y: 0 });
  const startSize = useRef({ width: 0, height: 0 });

  const isFile = fileId ? getItemById(fileId)?.type === "file" : false;

  const isFocused = focusedWindowId === id;
  const hasVerticalScroll =
    scrollMetrics.scrollHeight > scrollMetrics.clientHeight + 1;
  const hasHorizontalScroll =
    scrollMetrics.scrollWidth > scrollMetrics.clientWidth + 1;

  const updateScrollMetrics = useCallback(() => {
    const node = contentRef.current;
    if (!node) return;

    setScrollMetrics({
      scrollLeft: node.scrollLeft,
      scrollTop: node.scrollTop,
      scrollWidth: node.scrollWidth,
      scrollHeight: node.scrollHeight,
      clientWidth: node.clientWidth,
      clientHeight: node.clientHeight,
      verticalTrackHeight: verticalTrackRef.current?.clientHeight ?? 0,
      horizontalTrackWidth: horizontalTrackRef.current?.clientWidth ?? 0,
    });
  }, []);

  useEffect(() => {
    updateScrollMetrics();
  }, [fileId, windowDimensions.width, windowDimensions.height, updateScrollMetrics]);

  useEffect(() => {
    const node = contentRef.current;
    if (!node) return;

    const resizeObserver = new ResizeObserver(updateScrollMetrics);
    resizeObserver.observe(node);
    if (node.firstElementChild) resizeObserver.observe(node.firstElementChild);

    return () => resizeObserver.disconnect();
  }, [fileId, updateScrollMetrics]);

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

      updateScrollMetrics();
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
  }, [updateScrollMetrics]);

  const handleDragStartProxy = () => {
    setIsDraggingProxy(true);
    setCurrentDragOffset({ x: 0, y: 0 });
  };

  const handleDragProxy = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    setCurrentDragOffset({ x: info.offset.x, y: info.offset.y });
  };

  const handleDragEndProxy = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    setIsDraggingProxy(false);
    moveWindow(id, {
      x: position.x + info.offset.x,
      y: position.y + info.offset.y,
    });
    setCurrentDragOffset({ x: 0, y: 0 });
    handleWindowClick();
  };

  const handleWindowClick = () => {
    focusWindow(id);
    if (parentId) setActive(parentId);
  };

  const handleZoomToFit = (e: ReactMouseEvent) => {
    e.stopPropagation();
    const node = contentRef.current;
    if (!node) return;

    const topbarHeight = 21;
    const chromeWidth = windowDimensions.width - node.clientWidth;
    const chromeHeight = windowDimensions.height - node.clientHeight;
    const maxWidth = window.innerWidth;
    const maxHeight = window.innerHeight - topbarHeight;
    const nextWidth = Math.min(
      maxWidth,
      Math.max(MIN_WIDTH, node.scrollWidth + chromeWidth)
    );
    const nextHeight = Math.min(
      maxHeight,
      Math.max(MIN_HEIGHT, node.scrollHeight + chromeHeight)
    );
    const nextPosition = {
      x: Math.min(position.x, Math.max(0, window.innerWidth - nextWidth)),
      y: Math.min(
        Math.max(topbarHeight, position.y),
        Math.max(topbarHeight, window.innerHeight - nextHeight)
      ),
    };

    setWindowDimensions({ width: nextWidth, height: nextHeight });
    updateWindowBounds(id, {
      position: nextPosition,
      size: { width: nextWidth, height: nextHeight },
    });
  };

  // --- 🔧 Добавлено: обработчики ресайза ---
  const handleResizeMouseDown = (e: ReactMouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    startMouse.current = { x: e.clientX, y: e.clientY };
    startSize.current = { ...windowDimensions };
  };

  const MIN_WIDTH = 300;
  const MIN_HEIGHT = 200;

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - startMouse.current.x;
      const dy = e.clientY - startMouse.current.y;

      // обновляем размеры, не трогая левый верхний угол
      setWindowDimensions({
        width: Math.max(MIN_WIDTH, startSize.current.width + dx),
        height: Math.max(MIN_HEIGHT, startSize.current.height + dy),
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      updateWindowBounds(id, {
        position,
        size: windowDimensions,
      });
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [id, isResizing, position, updateWindowBounds, windowDimensions]);
  // --- 🔧 конец добавленного блока ---

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
                  <img src={block.src} alt={block.alt} onLoad={updateScrollMetrics} />
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
      const item = getItemById(fileId);

      if (item?.type === "file") {
        return renderDocument(item.content);
      }

      const children = getChildren(fileId);
      const getDefaultPosition = (index: number) => ({
        x: 20 + (index % 3) * 130,
        y: 20 + Math.floor(index / 3) * 70,
      });

      const arrToRender = children.map((child, i) => {
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

        return null;
      });
      return arrToRender;
    }
  };

  const finderData = {
    files: fileId ? getChildren(fileId).length : 0,
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
        onMouseDown={handleWindowClick}
      >
        <div className={s.windowTop}>
          <motion.div
            className={s.dragHandle}
            drag
            dragMomentum={false}
            onDragStart={handleDragStartProxy}
            onDrag={handleDragProxy}
            onDragEnd={handleDragEndProxy}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              cursor: "grab",
              left: 0,
              top: 0,
            }}
          />

          <div className={s.buttonContainer}>
            <button
              className={s.windowTopButton}
              onClick={() => closeWindow(id)}
            >
              <img src="/icons/sparkle.svg" alt="sparkle" draggable={false} />
            </button>
          </div>
          <div className={s.title}>{title}</div>
          <div className={s.buttonContainer}>
            <button
              className={clsx(s.windowTopButton, s.windowTopButtonClose)}
              onClick={handleZoomToFit}
            >
              <img src="/icons/sparkle.svg" alt="sparkle" draggable={false} />
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
            onMouseDown={handleResizeMouseDown}
          ></button>
        </div>
      </motion.div>

      {/* Прокси-элемент */}
      {isDraggingProxy &&
        windowDimensions.width > 0 &&
        windowDimensions.height > 0 && (
          <motion.div
            className={s.windowProxy}
            style={{
              zIndex: isFocused ? Z_INDEX.windowProxy : zIndex + 1,
              position: "absolute",
              left: position.x + currentDragOffset.x,
              top: position.y + currentDragOffset.y,
              width: windowDimensions.width,
              height: windowDimensions.height,
            }}
          />
        )}
    </>
  );
}
