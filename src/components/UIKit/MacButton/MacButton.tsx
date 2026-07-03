import clsx from "clsx";
import { memo } from "react";
import type { ButtonHTMLAttributes } from "react";

import s from "./MacButton.module.scss";

interface MacButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  iconOnly?: boolean;
  isPressed?: boolean;
  variant?: "regular" | "default";
}

export const MacButton = memo(function MacButton({
  children,
  className,
  iconOnly = false,
  isPressed,
  variant = "regular",
  ...props
}: MacButtonProps) {
  return (
  <button
    className={clsx(
      s.macButton,
      s[variant],
      {
        [s.pressed]: isPressed,
        [s.iconOnly]: iconOnly,
      },
      className,
    )}
    type="button"
    {...props}
  >
    <span className={s.defaultFill} aria-hidden="true" />
    <span className={s.defaultTop} aria-hidden="true" />
    <span className={s.defaultLeft} aria-hidden="true" />
    <span className={s.defaultRight} aria-hidden="true" />
    <span className={s.defaultBottom} aria-hidden="true" />
    <span
      className={clsx(s.defaultCorner, s.defaultCornerTopLeft)}
      aria-hidden="true"
    />
    <span
      className={clsx(s.defaultCorner, s.defaultCornerTopRight)}
      aria-hidden="true"
    />
    <span
      className={clsx(s.defaultCorner, s.defaultCornerBottomLeft)}
      aria-hidden="true"
    />
    <span
      className={clsx(s.defaultCorner, s.defaultCornerBottomRight)}
      aria-hidden="true"
    />
    <span className={s.buttonFill} aria-hidden="true" />
    <span className={s.buttonTop} aria-hidden="true" />
    <span className={s.buttonLeft} aria-hidden="true" />
    <span className={s.buttonRight} aria-hidden="true" />
    <span className={s.buttonBottom} aria-hidden="true" />
    <span
      className={clsx(s.buttonCorner, s.cornerTopLeft)}
      aria-hidden="true"
    />
    <span
      className={clsx(s.buttonCorner, s.cornerTopRight)}
      aria-hidden="true"
    />
    <span
      className={clsx(s.buttonCorner, s.cornerBottomLeft)}
      aria-hidden="true"
    />
    <span
      className={clsx(s.buttonCorner, s.cornerBottomRight)}
      aria-hidden="true"
    />
    <span className={s.buttonLabel}>{children}</span>
  </button>
  );
});
