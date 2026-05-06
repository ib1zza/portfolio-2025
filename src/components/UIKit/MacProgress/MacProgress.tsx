import clsx from "clsx";
import { memo, useMemo } from "react";
import type { CSSProperties, HTMLAttributes } from "react";

import s from "./MacProgress.module.scss";

type ProgressStyle = CSSProperties & {
  "--progress-value"?: number;
};

interface MacProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  className?: string;
  "aria-label"?: string;
}

function MacProgressComponent({
  value,
  max = 100,
  className,
  style,
  role = "progressbar",
  "aria-label": ariaLabel = "Progress",
  ...props
}: MacProgressProps) {
  const progress = useMemo(() => {
    if (max <= 0) return 0;

    return Math.min(Math.max(value / max, 0), 1);
  }, [max, value]);

  return (
    <div
      {...props}
      className={clsx(s.progress, className)}
      role={role}
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.min(Math.max(value, 0), max)}
      style={{ ...style, "--progress-value": progress } as ProgressStyle}
    >
      <span className={s.fill} aria-hidden="true" />
    </div>
  );
}

export const MacProgress = memo(MacProgressComponent);
