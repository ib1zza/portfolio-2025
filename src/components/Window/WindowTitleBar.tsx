import clsx from "clsx";
import { memo } from "react";
import type { MouseEventHandler } from "react";

import s from "./Window.module.scss";
import SparkleSvg from "../../assets/icons/sparkle.svg?react";

interface WindowTitleBarProps {
  onClose: () => void;
  onZoomToFit: MouseEventHandler<HTMLButtonElement>;
  showZoomToFit?: boolean;
  title: string;
  variant?: "default" | "hypercard" | "note";
}

export const WindowTitleBar = memo(function WindowTitleBar({
  onClose,
  onZoomToFit,
  showZoomToFit = true,
  title,
  variant = "default",
}: WindowTitleBarProps) {
  return (
    <div
      className={clsx(
        s.windowTop,
        variant === "hypercard" && s.windowTopHypercard,
        variant === "note" && s.windowTopNote,
      )}
    >
      <div className={s.buttonContainer}>
        <button className={s.windowTopButton} onClick={onClose}>
          <SparkleSvg />
        </button>
      </div>
      <div className={s.title}>{title}</div>
      {showZoomToFit ? (
        <div className={s.buttonContainer}>
          <button
            className={clsx(s.windowTopButton, s.windowTopButtonClose)}
            onClick={onZoomToFit}
          >
            <SparkleSvg />
          </button>
        </div>
      ) : (
        <div className={s.buttonContainer} aria-hidden="true" />
      )}
    </div>
  );
});
