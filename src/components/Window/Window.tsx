import clsx from "clsx";
import { motion } from "framer-motion";
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
  const { id, position, size, title, zIndex, fileId, parentId } = data;

  const isFocused = focusedWindowId === id;
  const handleDragEnd = (_: any, info: any) => {
    moveWindow(id, { x: info.point.x, y: info.point.y });
  };

  const handleWindowClick = () => {
    focusWindow(id);
    console.log("focusWindow", data);
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

      console.log(children);
      return arrToRender;
    }
  };

  // TODO: make props
  // const inActive = !isActive;

  // TODO: make props

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
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M7 0H5V1H4V2H3V3H2V4H1V5H0V6H3V10H9V6H12V5H11V4H10V3H9V2H8V1H7V0ZM7 1V2H8V3H9V4H10V5H8V9H4V5H2V4H3V3H4V2H5V1H7Z"
        fill="black"
      />
      <path d="M7 1H5V2H4V3H3V4H2V5H4V9H8V5H10V4H9V3H8V2H7V1Z" />
    </svg>
  );

  // TODO: make dynamic
  const isNeedToScrollHorizontal = true;
  const isNeedToScrollVertical = true;

  return (
    <motion.div
      className={clsx(s.window, { [s.inactive]: !isFocused })}
      style={{
        zIndex: isFocused ? 100 : zIndex,
        position: "absolute",
      }}
      drag
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      onMouseDown={handleWindowClick}
    >
      <div className={s.windowTop}>
        <div className={s.buttonContainer}>
          <button className={s.windowTopButton} onClick={() => closeWindow(id)}>
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
          {/* {children} */}
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
          <button className={clsx(s.navigationButton, s.navigationButtonDown)}>
            {arrowIcon}
          </button>
        </div>
        <div className={s.horizontalScroll}>
          <button className={clsx(s.navigationButton, s.navigationButtonLeft)}>
            {arrowIcon}
          </button>
          {isNeedToScrollHorizontal && (
            <div className={s.horizontalScrollBar}>
              <div className={s.scrollThumb} />
            </div>
          )}
          <button className={clsx(s.navigationButton, s.navigationButtonRight)}>
            {arrowIcon}
          </button>
        </div>
        <button className={s.windowResize}></button>
      </div>
    </motion.div>
  );
}
