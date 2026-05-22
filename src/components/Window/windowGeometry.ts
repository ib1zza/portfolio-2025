import type { WindowInstance } from "../../store/useWindowManager";
import {
  getTopbarHeight,
  getWindowMinSize,
} from "../../constants/windowLayout";

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
) => {
  const topbarHeight = getTopbarHeight();

  return {
    x: clamp(position.x, 0, Math.max(0, window.innerWidth - size.width)),
    y: clamp(
      position.y,
      topbarHeight,
      Math.max(topbarHeight, window.innerHeight - size.height),
    ),
  };
};

export const getResizableSize = (
  position: WindowInstance["position"],
  size: WindowInstance["size"]
) => {
  const minSize = getWindowMinSize();

  return {
    width: clamp(
      size.width,
      minSize.width,
      Math.max(minSize.width, window.innerWidth - position.x),
    ),
    height: clamp(
      size.height,
      minSize.height,
      Math.max(minSize.height, window.innerHeight - position.y),
    ),
  };
};
