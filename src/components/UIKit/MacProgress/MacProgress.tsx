import clsx from "clsx";
import { memo, useMemo } from "react";
import type { CSSProperties, HTMLAttributes } from "react";

import s from "./MacProgress.module.scss";

type MacProgressOrientation = "horizontal" | "vertical";

type ProgressStyle = CSSProperties & {
  "--progress-value"?: number;
};

interface MacProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  min?: number;
  max?: number;
  className?: string;
  orientation?: MacProgressOrientation;
  "aria-label"?: string;
}

function MacProgressComponent({
  value,
  min = 0,
  max = 100,
  className,
  style,
  role = "progressbar",
  orientation = "horizontal",
  "aria-label": ariaLabel = "Progress",
  ...props
}: MacProgressProps) {
  const progress = useMemo(() => {
    const range = max - min;
    if (range <= 0) return 0;

    return Math.min(Math.max((value - min) / range, 0), 1);
  }, [max, min, value]);

  const clampedValue = Math.min(Math.max(value, min), max);

  return (
    <div
      {...props}
      className={clsx(
        s.progress,
        orientation === "vertical" && s.vertical,
        className,
      )}
      role={role}
      aria-label={ariaLabel}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={clampedValue}
      style={{ ...style, "--progress-value": progress } as ProgressStyle}
    >
      <span className={s.fill} aria-hidden="true" />
    </div>
  );
}

export const MacProgress = memo(MacProgressComponent);
MacProgress.displayName = 'MacProgress';
