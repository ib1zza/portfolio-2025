import clsx from "clsx";
import { memo, useCallback, useEffect, useRef, useState } from "react";

import s from "./PopupSelect.module.scss";

export interface PopupSelectOption<T extends string> {
  value: T;
  label: string;
}

interface PopupSelectProps<T extends string> {
  label: string;
  value: T;
  options: Array<PopupSelectOption<T>>;
  onChange: (value: T) => void;
}

function PopupSelectComponent<T extends string>({
  label,
  value,
  options,
  onChange,
}: PopupSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const selectedOption = options.find((option) => option.value === value);

  const closeMenu = useCallback((event: MouseEvent) => {
    const target = event.target;

    if (target instanceof Element && target.closest("[data-popup-menu-item]")) {
      return;
    }

    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    document.addEventListener("mouseup", closeMenu);

    return () => {
      document.removeEventListener("mouseup", closeMenu);
    };
  }, [closeMenu, isOpen]);

  return (
    <div
      ref={popupRef}
      className={clsx(s.popup, { [s.openRoot]: isOpen })}
      onBlur={(event) => {
        const nextFocus = event.relatedTarget;

        if (
          !(nextFocus instanceof Node) ||
          !event.currentTarget.contains(nextFocus)
        ) {
          setIsOpen(false);
        }
      }}
    >
      <span className={s.popupLabel}>{label}</span>
      <div className={s.popupControl}>
        <button
          className={clsx(s.popupSurface, s.popupButton, { [s.open]: isOpen })}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onMouseDown={(event) => {
            event.preventDefault();
            setIsOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setIsOpen((current) => !current);
            }
            if (event.key === "Escape") {
              setIsOpen(false);
            }
          }}
        >
          <span className={s.popupValue}>{selectedOption?.label}</span>
          <span className={s.popupCaret} aria-hidden="true" />
        </button>

        {isOpen && (
          <div className={clsx(s.popupSurface, s.popupMenu)} role="listbox">
            {options.map((option) => (
              <button
                key={option.value}
                className={s.popupItem}
                data-popup-menu-item
                type="button"
                role="option"
                aria-selected={option.value === value}
                onMouseUp={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                <span className={s.menuCheck} aria-hidden="true" />
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export const PopupSelect = memo(PopupSelectComponent) as typeof PopupSelectComponent;
