import { memo, useCallback } from "react";
import type { HTMLAttributes, KeyboardEvent, PointerEvent } from "react";

import { MacProgress } from "../MacProgress";

type MacSliderOrientation = "horizontal" | "vertical";

interface MacSliderProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "onChange"
> {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  orientation?: MacSliderOrientation;
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
  orientation = "horizontal",
  onChange,
  tabIndex = 0,
  role = "slider",
  "aria-label": ariaLabel = "Slider",
  onPointerDown,
  onPointerMove,
  onKeyDown,
  ...props
}: MacSliderProps) {
  const setValueFromPointer = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();

      const ratio =
        orientation === "vertical"
          ? clamp((rect.bottom - event.clientY) / rect.height, 0, 1)
          : clamp((event.clientX - rect.left) / rect.width, 0, 1);

      const nextValue = snapToStep(min + ratio * (max - min), min, step);

      onChange(clamp(nextValue, min, max));
    },
    [max, min, onChange, orientation, step],
  );

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      onPointerDown?.(event);
      if (event.defaultPrevented) return;

      event.currentTarget.setPointerCapture(event.pointerId);
      setValueFromPointer(event);
    },
    [onPointerDown, setValueFromPointer],
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

      setValueFromPointer(event);
    },
    [onPointerMove, setValueFromPointer],
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

      const decrementKeys =
        orientation === "vertical"
          ? ["ArrowDown", "ArrowLeft"]
          : ["ArrowLeft", "ArrowDown"];

      const incrementKeys =
        orientation === "vertical"
          ? ["ArrowUp", "ArrowRight"]
          : ["ArrowRight", "ArrowUp"];

      if (decrementKeys.includes(event.key)) {
        event.preventDefault();
        onChange(clamp(value - step, min, max));
        return;
      }

      if (incrementKeys.includes(event.key)) {
        event.preventDefault();
        onChange(clamp(value + step, min, max));
      }
    },
    [max, min, onChange, onKeyDown, orientation, step, value],
  );

  return (
    <MacProgress
      {...props}
      role={role}
      tabIndex={tabIndex}
      aria-label={ariaLabel}
      aria-orientation={orientation}
      value={value}
      min={min}
      max={max}
      orientation={orientation}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onKeyDown={handleKeyDown}
    />
  );
}

export const MacSlider = memo(MacSliderComponent);
MacSlider.displayName = 'MacSlider';
