// components/CustomCursor.tsx
import React, { useEffect, useState } from "react";
import { useCursor } from "../../contexts/CursorContext";
import s from "./CustomCursor.module.scss";

const CustomCursor: React.FC = () => {
  const { cursor } = useCursor();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    // Добавляем обработчики на весь документ
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseleave", handleMouseLeave);

    // Изначально показываем курсор
    setIsVisible(true);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // Скрываем стандартный курсор для всего документа
  useEffect(() => {
    document.body.style.cursor = "none";

    return () => {
      document.body.style.cursor = "default";
    };
  }, []);

  //   if (!isVisible) return null;

  return (
    <div
      className={`${s.cursor} ${s[cursor]}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    />
  );
};

export default CustomCursor;
