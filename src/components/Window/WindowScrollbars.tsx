import clsx from "clsx";
import { memo } from "react";
import type {
  CSSProperties,
  PointerEvent as ReactPointerEvent,
  ReactNode,
  RefObject,
} from "react";

import s from "./Window.module.scss";

interface WindowScrollbarsProps {
  children: ReactNode;
  contentRef: RefObject<HTMLDivElement | null>;
  getThumbStyle: (axis: "x" | "y") => CSSProperties;
  hasHorizontalScroll: boolean;
  hasVerticalScroll: boolean;
  horizontalTrackRef: RefObject<HTMLDivElement | null>;
  scrollContent: (deltaLeft: number, deltaTop: number) => void;
  showControls?: boolean;
  startThumbDrag: (
    event: ReactPointerEvent<HTMLDivElement>,
    axis: "x" | "y"
  ) => void;
  updateScrollMetrics: () => void;
  verticalTrackRef: RefObject<HTMLDivElement | null>;
}

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

export const WindowScrollbars = memo(function WindowScrollbars({
  children,
  contentRef,
  getThumbStyle,
  hasHorizontalScroll,
  hasVerticalScroll,
  horizontalTrackRef,
  scrollContent,
  showControls = true,
  startThumbDrag,
  updateScrollMetrics,
  verticalTrackRef,
}: WindowScrollbarsProps) {
  if (!showControls) {
    return (
      <div className={s.contentPlain}>
        <div
          ref={contentRef}
          onScroll={updateScrollMetrics}
          className={s.contentWindowPlain}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={s.content}>
      <div
        ref={contentRef}
        onScroll={updateScrollMetrics}
        className={clsx(s.contentWindow, {
          [s.needToScrollHorizontal]: hasHorizontalScroll,
          [s.needToScrollVertical]: hasVerticalScroll,
        })}
      >
        {children}
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

      <button
        className={s.windowResize}
        tabIndex={-1}
        aria-hidden="true"
      ></button>
    </div>
  );
});
