import clsx from "clsx";
import { memo } from "react";
import type { MouseEventHandler } from "react";

import s from "./Window.module.scss";
import SparkleSvg from "../../assets/icons/sparkle.svg?react";

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
          <SparkleSvg />
        </button>
      </div>
      <div className={s.title}>{title}</div>
      <div className={s.buttonContainer}>
        <button
          className={clsx(s.windowTopButton, s.windowTopButtonClose)}
          onClick={onZoomToFit}
        >
          <SparkleSvg />
        </button>
      </div>
    </div>
  );
});
