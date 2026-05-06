import { useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";

import s from "./WindowOpenAnimation.module.scss";
import {
  WindowOpenAnimationContext,
  type OpenWindowAnimatedParams,
} from "./WindowOpenAnimationContext";
import { Z_INDEX } from "../../constants/zIndex";
import {
  WINDOW_OPEN_ANIMATION_DURATION_MS,
  WINDOW_OPEN_ANIMATION_START_WIDTH,
} from "../../constants/windowAnimation";
import {
  useWindowManager,
  type WindowInstance,
} from "../../store/useWindowManager";
import { useCursor } from "../../contexts/cursor";

interface AnimationFrame {
  key: string;
  from: WindowInstance["position"] & WindowInstance["size"];
  to: WindowInstance["position"] & WindowInstance["size"];
}

const DEFAULT_WINDOW_POSITION = { x: 200, y: 100 };
const DEFAULT_WINDOW_SIZE = { width: 400, height: 300 };

const getStartBounds = (
  sourceRect: DOMRect | null | undefined,
  targetSize: WindowInstance["size"]
) => {
  const aspectRatio = targetSize.width / targetSize.height;
  const startWidth = WINDOW_OPEN_ANIMATION_START_WIDTH;
  const startHeight = Math.max(10, startWidth / aspectRatio);
  const centerX = sourceRect
    ? sourceRect.left + sourceRect.width / 2
    : window.innerWidth / 2;
  const centerY = sourceRect
    ? sourceRect.top + sourceRect.height / 2
    : window.innerHeight / 2;

  return {
    x: centerX - startWidth / 2,
    y: centerY - startHeight / 2,
    width: startWidth,
    height: startHeight,
  };
};

export function WindowOpenAnimationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const openWindow = useWindowManager((state) => state.openWindow);
  const closeWindow = useWindowManager((state) => state.closeWindow);
  const { startCursorOverride } = useCursor();
  const [animations, setAnimations] = useState<AnimationFrame[]>([]);

  const openWindowAnimated = useCallback(
    ({
      id,
      title,
      parentId = null,
      sourceRect,
      position = DEFAULT_WINDOW_POSITION,
      preferredSize,
      openerWindowId,
    }: OpenWindowAnimatedParams) => {
      const windowHistory = useWindowManager.getState().windowHistory[id];
      const targetPosition = windowHistory?.position ?? position;
      const targetSize =
        windowHistory?.size ?? preferredSize ?? DEFAULT_WINDOW_SIZE;
      const animationKey = `${id}-${Date.now()}`;
      const releaseCursor = startCursorOverride("watch");

      setAnimations((currentAnimations) => [
        ...currentAnimations,
        {
          key: animationKey,
          from: getStartBounds(sourceRect, targetSize),
          to: { ...targetPosition, ...targetSize },
        },
      ]);

      window.setTimeout(() => {
        releaseCursor();
        setAnimations((currentAnimations) =>
          currentAnimations.filter((animation) => animation.key !== animationKey)
        );
        openWindow(
          id,
          title,
          parentId,
          position,
          preferredSize,
          openerWindowId
        );
      }, WINDOW_OPEN_ANIMATION_DURATION_MS);
    },
    [openWindow, startCursorOverride]
  );

  const closeWindowAnimated = useCallback(
    (id: string) => {
      const windowToClose = useWindowManager.getState().windows[id];
      if (!windowToClose) return;

      const destinationElement = document.querySelector<HTMLElement>(
        `[data-finder-item-id="${windowToClose.fileId ?? id}"]`
      );
      const targetBounds = getStartBounds(
        destinationElement?.getBoundingClientRect(),
        windowToClose.size
      );
      const animationKey = `${id}-close-${Date.now()}`;

      setAnimations((currentAnimations) => [
        ...currentAnimations,
        {
          key: animationKey,
          from: { ...windowToClose.position, ...windowToClose.size },
          to: targetBounds,
        },
      ]);
      closeWindow(id);

      window.setTimeout(() => {
        setAnimations((currentAnimations) =>
          currentAnimations.filter((animation) => animation.key !== animationKey)
        );
      }, WINDOW_OPEN_ANIMATION_DURATION_MS);
    },
    [closeWindow]
  );

  const value = useMemo(
    () => ({ openWindowAnimated, closeWindowAnimated }),
    [closeWindowAnimated, openWindowAnimated]
  );

  return (
    <WindowOpenAnimationContext.Provider value={value}>
      {children}
      {animations.map((animation) => (
        <motion.div
          key={animation.key}
          className={s.openWindowProxy}
          initial={{
            x: animation.from.x,
            y: animation.from.y,
            width: animation.from.width,
            height: animation.from.height,
          }}
          animate={{
            x: animation.to.x,
            y: animation.to.y,
            width: animation.to.width,
            height: animation.to.height,
          }}
          transition={{
            duration: WINDOW_OPEN_ANIMATION_DURATION_MS / 1000,
            ease: "linear",
          }}
          style={{ zIndex: Z_INDEX.windowProxy }}
        />
      ))}
    </WindowOpenAnimationContext.Provider>
  );
}
