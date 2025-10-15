import clsx from "clsx";
import { motion, useAnimation } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import s from "./Window.module.scss";
import {
  useWindowManager,
  type WindowInstance,
} from "../../store/useWindowManager";
import { useFileSystem } from "../../store/useFileSystem";
import Folder from "../Folder";

interface WindowProps {
  data: WindowInstance;
}

export function Window({ data }: WindowProps) {
  const { focusWindow, moveWindow, closeWindow, focusedWindowId } =
    useWindowManager();
  const { getChildren, setActive } = useFileSystem();
  const { id, position, title, zIndex, fileId, parentId } = data;

  const [isDraggingProxy, setIsDraggingProxy] = useState(false);
  const [currentDragOffset, setCurrentDragOffset] = useState({ x: 0, y: 0 }); // Отслеживает текущее смещение во время drag
  const windowRef = useRef<HTMLDivElement>(null);

  const [windowDimensions, setWindowDimensions] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    if (windowRef.current) {
      const rect = windowRef.current.getBoundingClientRect();
      setWindowDimensions({ width: rect.width, height: rect.height });
    }
  }, [windowRef.current, position.x, position.y]); // Добавили windowRef.current в зависимости

  const isFocused = focusedWindowId === id;

  const handleDragStartProxy = () => {
    setIsDraggingProxy(true);
    setCurrentDragOffset({ x: 0, y: 0 }); // Сбросить начальное смещение
  };

  const handleDragProxy = (_: any, info: any) => {
    // info.offset.x и info.offset.y - это текущее смещение от начала drag
    setCurrentDragOffset({ x: info.offset.x, y: info.offset.y });
  };

  const handleDragEndProxy = (_: any, info: any) => {
    setIsDraggingProxy(false);
    moveWindow(id, {
      x: position.x + info.offset.x,
      y: position.y + info.offset.y,
    });
    setCurrentDragOffset({ x: 0, y: 0 }); // Сбросить смещение
    handleWindowClick();
  };

  const handleWindowClick = () => {
    focusWindow(id);
    if (parentId) setActive(parentId);
  };

  const renderChildren = () => {
    if (fileId) {
      const children = getChildren(fileId);
      const nextPosition = { x: 20, y: 20 };
      const step = 20;
      const maxInRow = 3;

      const arrToRender = children.map((child) => {
        if (child.type === "folder") {
          return (
            <Folder
              key={child.id}
              id={child.id}
              name={child.name}
              position={{
                x: nextPosition.x,
                y: nextPosition.y,
              }}
              parentWindowId={id}
            />
          );
        }
        nextPosition.x += step;
        if (nextPosition.x >= step * maxInRow) {
          nextPosition.x = 0;
          nextPosition.y += step;
        }
        return null;
      });
      return arrToRender;
    }
  };

  const finderData = {
    files: 9,
    inDisk: "64 MB",
    available: "128 MB",
  };

  const arrowIcon = (
    <svg
      width="12"
      height="10"
      viewBox="0 0 12 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7 0H5V1H4V2H3V3H2V4H1V5H0V6H3V10H9V6H12V5H11V4H10V3H9V2H8V1H7V0ZM7 1V2H8V3H9V4H10V5H8V9H4V5H2V4H3V3H4V2H5V1H7Z"
        fill="black"
      />
      <path d="M7 1H5V2H4V3H3V4H2V5H4V9H8V5H10V4H9V3H8V2H7V1Z" />
    </svg>
  );

  const isNeedToScrollHorizontal = true;
  const isNeedToScrollVertical = true;

  return (
    <>
      {/* Основное окно */}
      <motion.div
        ref={windowRef}
        className={clsx(s.window, { [s.inactive]: !isFocused })}
        style={{
          zIndex: isFocused ? 100 : zIndex,
          position: "absolute",
          left: position.x,
          top: position.y,
        }}
        onMouseDown={handleWindowClick}
      >
        <div className={s.windowTop}>
          {/* Невидимый перетаскиватель для инициации перемещения контура */}
          <motion.div
            className={s.dragHandle}
            drag
            dragMomentum={false}
            onDragStart={handleDragStartProxy}
            onDrag={handleDragProxy}
            onDragEnd={handleDragEndProxy}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }} // Ограничиваем, чтобы сам dragHandle не двигался
            dragElastic={0}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              // TODO: think about cursor
              cursor: "grab",
              left: 0,
              top: 0,
            }}
          />

          <div className={s.buttonContainer}>
            <button
              className={s.windowTopButton}
              onClick={() => closeWindow(id)}
            >
              <img src="/icons/sparkle.svg" alt="sparkle" draggable={false} />
            </button>
          </div>
          <div className={s.title}>{title}</div>
          <div className={s.buttonContainer}>
            <button
              className={clsx(s.windowTopButton, s.windowTopButtonClose)}
              onClick={() => closeWindow(id)}
            >
              <img src="/icons/sparkle.svg" alt="sparkle" draggable={false} />
            </button>
          </div>
        </div>

        <div className={s.content}>
          <div
            className={clsx(s.contentWindow, {
              [s.needToScrollHorizontal]: isNeedToScrollHorizontal,
              [s.needToScrollVertical]: isNeedToScrollVertical,
            })}
          >
            {renderChildren()}
          </div>
          <div className={s.verticalScroll}>
            <button className={clsx(s.navigationButton, s.navigationButtonUp)}>
              {arrowIcon}
            </button>
            {isNeedToScrollVertical && (
              <div className={s.verticalScrollBar}>
                <div className={s.scrollThumb} />
              </div>
            )}
            <button
              className={clsx(s.navigationButton, s.navigationButtonDown)}
            >
              {arrowIcon}
            </button>
          </div>
          <div className={s.horizontalScroll}>
            <button
              className={clsx(s.navigationButton, s.navigationButtonLeft)}
            >
              {arrowIcon}
            </button>
            {isNeedToScrollHorizontal && (
              <div className={s.horizontalScrollBar}>
                <div className={s.scrollThumb} />
              </div>
            )}
            <button
              className={clsx(s.navigationButton, s.navigationButtonRight)}
            >
              {arrowIcon}
            </button>
          </div>
          <button className={s.windowResize}></button>
        </div>
      </motion.div>

      {/* Прокси-элемент для отображения контура */}
      {isDraggingProxy &&
        windowDimensions.width > 0 &&
        windowDimensions.height > 0 && (
          <motion.div
            className={s.windowProxy}
            style={{
              zIndex: isFocused ? 101 : zIndex + 1,
              position: "absolute",
              left: position.x + currentDragOffset.x,
              top: position.y + currentDragOffset.y,
              width: windowDimensions.width,
              height: windowDimensions.height,
            }}
          />
        )}
    </>
  );
}
