// components/CustomCursor.tsx
import React, { useEffect, useState } from "react";
import { FINE_POINTER_QUERY } from "../../constants/responsive";
import { useCursor } from "../../contexts/cursor";
import s from "./CustomCursor.module.scss";

export const CustomCursor: React.FC = () => {
  const { cursor } = useCursor();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(FINE_POINTER_QUERY);
    if (!mediaQuery.matches) return;

    const handleCursorMove = (e: MouseEvent | PointerEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    // Добавляем обработчики на весь документ
    document.addEventListener("mousemove", handleCursorMove);
    document.addEventListener("pointermove", handleCursorMove, true);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseleave", handleMouseLeave);

    // Изначально показываем курсор
    setIsVisible(true);

    return () => {
      document.removeEventListener("mousemove", handleCursorMove);
      document.removeEventListener("pointermove", handleCursorMove, true);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // Скрываем стандартный курсор для всего документа
  useEffect(() => {
    const mediaQuery = window.matchMedia(FINE_POINTER_QUERY);
    if (!mediaQuery.matches) return;

    document.body.style.cursor = "none";

    return () => {
      document.body.style.cursor = "default";
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`${s.cursor} ${s[cursor]}`}
      data-custom-cursor
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    />
  );
};
