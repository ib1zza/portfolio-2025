import { useCallback, useEffect, useRef, useState } from "react";
import type {
  CSSProperties,
  PointerEvent as ReactPointerEvent,
  RefObject,
} from "react";

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

interface ScrollDragState {
  axis: "x" | "y";
  pointerStart: number;
  scrollStart: number;
  maxScroll: number;
  maxThumbOffset: number;
}

interface UseWindowScrollbarsParams {
  contentRef: RefObject<HTMLDivElement | null>;
  verticalTrackRef: RefObject<HTMLDivElement | null>;
  horizontalTrackRef: RefObject<HTMLDivElement | null>;
  fileId?: string;
  width: number;
  height: number;
}

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

const areScrollMetricsEqual = (a: ScrollMetrics, b: ScrollMetrics) =>
  a.scrollLeft === b.scrollLeft &&
  a.scrollTop === b.scrollTop &&
  a.scrollWidth === b.scrollWidth &&
  a.scrollHeight === b.scrollHeight &&
  a.clientWidth === b.clientWidth &&
  a.clientHeight === b.clientHeight &&
  a.verticalTrackHeight === b.verticalTrackHeight &&
  a.horizontalTrackWidth === b.horizontalTrackWidth;

export const useWindowScrollbars = ({
  contentRef,
  verticalTrackRef,
  horizontalTrackRef,
  fileId,
  width,
  height,
}: UseWindowScrollbarsParams) => {
  const scrollMetricsFrameRef = useRef<number | null>(null);
  const scrollDragRef = useRef<ScrollDragState | null>(null);
  const [scrollMetrics, setScrollMetrics] = useState(INITIAL_SCROLL_METRICS);
  const scrollMetricsRef = useRef(INITIAL_SCROLL_METRICS);

  const hasVerticalScroll =
    scrollMetrics.scrollHeight > scrollMetrics.clientHeight + 1;
  const hasHorizontalScroll =
    scrollMetrics.scrollWidth > scrollMetrics.clientWidth + 1;

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
  }, [contentRef, horizontalTrackRef, verticalTrackRef]);

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
  }, [fileId, height, updateScrollMetrics, width]);

  useEffect(() => {
    const node = contentRef.current;
    if (!node) return;

    const resizeObserver = new ResizeObserver(scheduleScrollMetricsUpdate);
    resizeObserver.observe(node);
    if (node.firstElementChild) resizeObserver.observe(node.firstElementChild);

    return () => resizeObserver.disconnect();
  }, [contentRef, fileId, scheduleScrollMetricsUpdate]);

  const scrollContent = useCallback(
    (deltaLeft: number, deltaTop: number) => {
      contentRef.current?.scrollBy({
        left: deltaLeft,
        top: deltaTop,
        behavior: "smooth",
      });
    },
    [contentRef]
  );

  const getThumbStyle = useCallback(
    (axis: "x" | "y"): CSSProperties => {
      const isY = axis === "y";
      const client = isY
        ? scrollMetrics.clientHeight
        : scrollMetrics.clientWidth;
      const track = isY
        ? scrollMetrics.verticalTrackHeight
        : scrollMetrics.horizontalTrackWidth;
      const scroll = isY
        ? scrollMetrics.scrollHeight
        : scrollMetrics.scrollWidth;
      const offset = isY ? scrollMetrics.scrollTop : scrollMetrics.scrollLeft;
      const size = scroll ? Math.max(16, (client / scroll) * track) : 16;
      const maxOffset = Math.max(1, scroll - client);
      const maxThumbOffset = Math.max(0, track - size);
      const clampedOffset = Math.max(0, Math.min(offset, maxOffset));
      const position = (clampedOffset / maxOffset) * maxThumbOffset;

      return isY
        ? { height: size, transform: `translateY(${position}px)` }
        : { width: size, transform: `translateX(${position}px)` };
    },
    [scrollMetrics]
  );

  const startThumbDrag = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>, axis: "x" | "y") => {
      const node = contentRef.current;
      if (!node) return;

      const isY = axis === "y";
      const client = isY
        ? scrollMetrics.clientHeight
        : scrollMetrics.clientWidth;
      const track = isY
        ? scrollMetrics.verticalTrackHeight
        : scrollMetrics.horizontalTrackWidth;
      const scroll = isY
        ? scrollMetrics.scrollHeight
        : scrollMetrics.scrollWidth;
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
    },
    [contentRef, scrollMetrics]
  );

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
  }, [contentRef, scheduleScrollMetricsUpdate]);

  return {
    getThumbStyle,
    hasHorizontalScroll,
    hasVerticalScroll,
    scrollContent,
    startThumbDrag,
    updateScrollMetrics,
  };
};

