import { memo, useCallback } from "react";
import type { HTMLAttributes, KeyboardEvent, PointerEvent } from "react";

import { MacProgress } from "../MacProgress";

interface MacSliderProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  "aria-label"?: string;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const snapToStep = (value: number, min: number, step: number) =>
  Math.round((value - min) / step) * step + min;

function MacSliderComponent({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  tabIndex = 0,
  role = "slider",
  "aria-label": ariaLabel = "Slider",
  onPointerDown,
  onPointerMove,
  onKeyDown,
  ...props
}: MacSliderProps) {
  const setValueFromClientX = useCallback(
    (clientX: number, element: HTMLElement) => {
      const rect = element.getBoundingClientRect();
      const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
      const nextValue = snapToStep(min + ratio * (max - min), min, step);

      onChange(clamp(nextValue, min, max));
    },
    [max, min, onChange, step],
  );

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      onPointerDown?.(event);
      if (event.defaultPrevented) return;

      event.currentTarget.setPointerCapture(event.pointerId);
      setValueFromClientX(event.clientX, event.currentTarget);
    },
    [onPointerDown, setValueFromClientX],
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      onPointerMove?.(event);
      if (
        event.defaultPrevented ||
        !event.currentTarget.hasPointerCapture(event.pointerId)
      ) {
        return;
      }

      setValueFromClientX(event.clientX, event.currentTarget);
    },
    [onPointerMove, setValueFromClientX],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;

      if (event.key === "Home") {
        event.preventDefault();
        onChange(min);
        return;
      }

      if (event.key === "End") {
        event.preventDefault();
        onChange(max);
        return;
      }

      if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
        event.preventDefault();
        onChange(clamp(value - step, min, max));
      }

      if (event.key === "ArrowRight" || event.key === "ArrowUp") {
        event.preventDefault();
        onChange(clamp(value + step, min, max));
      }
    },
    [max, min, onChange, onKeyDown, step, value],
  );

  return (
    <MacProgress
      {...props}
      role={role}
      tabIndex={tabIndex}
      aria-label={ariaLabel}
      value={value}
      min={min}
      max={max}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onKeyDown={handleKeyDown}
    />
  );
}

export const MacSlider = memo(MacSliderComponent);
