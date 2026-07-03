import { memo, useCallback, useEffect, useRef, useState } from "react";
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
  commitOnPointerUp?: boolean;
  pointerChangeThrottleMs?: number;
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
  commitOnPointerUp = false,
  pointerChangeThrottleMs = 100,
  onChange,
  tabIndex = 0,
  role = "slider",
  "aria-label": ariaLabel = "Slider",
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onKeyDown,
  ...props
}: MacSliderProps) {
  const [dragValue, setDragValue] = useState<number | null>(null);
  const latestPointerValueRef = useRef(value);
  const isPointerDraggingRef = useRef(false);
  const lastPointerChangeAtRef = useRef(0);
  const pendingPointerValueRef = useRef<number | null>(null);
  const throttleTimerRef = useRef<number | null>(null);

  const clearThrottleTimer = useCallback(() => {
    if (throttleTimerRef.current === null) return;

    window.clearTimeout(throttleTimerRef.current);
    throttleTimerRef.current = null;
  }, []);

  const flushPointerChange = useCallback(() => {
    clearThrottleTimer();

    const pendingValue = pendingPointerValueRef.current;
    if (pendingValue === null) return;

    pendingPointerValueRef.current = null;
    lastPointerChangeAtRef.current = Date.now();
    onChange(pendingValue);
  }, [clearThrottleTimer, onChange]);

  const emitPointerChange = useCallback(
    (nextValue: number, force = false) => {
      if (commitOnPointerUp) {
        if (force) onChange(nextValue);
        return;
      }

      if (force || pointerChangeThrottleMs <= 0) {
        clearThrottleTimer();
        pendingPointerValueRef.current = null;
        lastPointerChangeAtRef.current = Date.now();
        onChange(nextValue);
        return;
      }

      const now = Date.now();
      const elapsed = now - lastPointerChangeAtRef.current;

      if (elapsed >= pointerChangeThrottleMs) {
        clearThrottleTimer();
        pendingPointerValueRef.current = null;
        lastPointerChangeAtRef.current = now;
        onChange(nextValue);
        return;
      }

      pendingPointerValueRef.current = nextValue;

      if (throttleTimerRef.current !== null) return;

      throttleTimerRef.current = window.setTimeout(() => {
        throttleTimerRef.current = null;
        flushPointerChange();
      }, pointerChangeThrottleMs - elapsed);
    },
    [
      clearThrottleTimer,
      commitOnPointerUp,
      flushPointerChange,
      onChange,
      pointerChangeThrottleMs,
    ],
  );

  const getValueFromPointer = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();

      const ratio =
        orientation === "vertical"
          ? clamp((rect.bottom - event.clientY) / rect.height, 0, 1)
          : clamp((event.clientX - rect.left) / rect.width, 0, 1);

      const nextValue = snapToStep(min + ratio * (max - min), min, step);

      return clamp(nextValue, min, max);
    },
    [max, min, orientation, step],
  );

  const setValueFromPointer = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const nextValue = getValueFromPointer(event);
      latestPointerValueRef.current = nextValue;
      setDragValue(nextValue);
      emitPointerChange(nextValue);
    },
    [emitPointerChange, getValueFromPointer],
  );

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      onPointerDown?.(event);
      if (event.defaultPrevented) return;

      event.currentTarget.setPointerCapture(event.pointerId);
      isPointerDraggingRef.current = true;
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

  const finishPointerDrag = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      onPointerUp?.(event);
      if (event.defaultPrevented) return;

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      emitPointerChange(latestPointerValueRef.current, true);
      isPointerDraggingRef.current = false;
      setDragValue(null);
    },
    [emitPointerChange, onPointerUp],
  );

  const cancelPointerDrag = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      onPointerCancel?.(event);
      if (event.defaultPrevented) return;

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      clearThrottleTimer();
      pendingPointerValueRef.current = null;
      isPointerDraggingRef.current = false;
      setDragValue(null);
    },
    [clearThrottleTimer, onPointerCancel],
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

  useEffect(() => {
    if (isPointerDraggingRef.current) return;

    latestPointerValueRef.current = value;
  }, [value]);

  useEffect(
    () => () => {
      clearThrottleTimer();
    },
    [clearThrottleTimer],
  );

  const displayValue = dragValue ?? value;

  return (
    <MacProgress
      {...props}
      role={role}
      tabIndex={tabIndex}
      aria-label={ariaLabel}
      aria-orientation={orientation}
      value={displayValue}
      min={min}
      max={max}
      orientation={orientation}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishPointerDrag}
      onPointerCancel={cancelPointerDrag}
      onKeyDown={handleKeyDown}
    />
  );
}

export const MacSlider = memo(MacSliderComponent);
MacSlider.displayName = 'MacSlider';
