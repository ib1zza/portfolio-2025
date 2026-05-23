import clsx from "clsx";
import { memo } from "react";
import type { MouseEventHandler } from "react";

import { getAssetPath } from "../../utils/assets";
import s from "./Window.module.scss";

interface WindowTitleBarProps {
  onClose: () => void;
  onZoomToFit: MouseEventHandler<HTMLButtonElement>;
  title: string;
}

export const WindowTitleBar = memo(function WindowTitleBar({
  onClose,
  onZoomToFit,
  title,
}: WindowTitleBarProps) {
  return (
    <div className={s.windowTop}>
      <div className={s.buttonContainer}>
        <button className={s.windowTopButton} onClick={onClose}>
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
          onClick={onZoomToFit}
        >
          <img
            src={getAssetPath("/icons/sparkle.svg")}
            alt="sparkle"
            draggable={false}
          />
        </button>
      </div>
    </div>
  );
});
