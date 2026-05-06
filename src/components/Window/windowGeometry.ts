import type { WindowInstance } from "../../store/useWindowManager";

export const MIN_WIDTH = 300;
export const MIN_HEIGHT = 132;
export const TOPBAR_HEIGHT = 21;
export const RESIZE_HANDLE_SIZE = 15;
export const TITLEBAR_BUTTON_SAFE_AREA = 30;

export const areSizesEqual = (
  a: { width: number; height: number },
  b: { width: number; height: number }
) => a.width === b.width && a.height === b.height;

export const arePositionsEqual = (
  a: { x: number; y: number },
  b: { x: number; y: number }
) => a.x === b.x && a.y === b.y;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const getContainedPosition = (
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

export const getResizableSize = (
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

