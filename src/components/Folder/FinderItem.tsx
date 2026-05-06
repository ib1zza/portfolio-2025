import clsx from "clsx";
import { memo } from "react";
import type {
  MouseEventHandler,
  PointerEventHandler,
  ReactNode,
  RefObject,
} from "react";

import s from "./Folder.module.scss";

interface FinderItemProps {
  children: ReactNode;
  id: string;
  isActive: boolean;
  isOpenedInactive: boolean;
  itemRef: RefObject<HTMLDivElement | null>;
  onClick: MouseEventHandler<HTMLDivElement>;
  onDoubleClick: () => void;
  onPointerDown: PointerEventHandler<HTMLDivElement>;
  position: { x: number; y: number };
}

export const FinderItem = memo(function FinderItem({
  children,
  id,
  isActive,
  isOpenedInactive,
  itemRef,
  onClick,
  onDoubleClick,
  onPointerDown,
  position,
}: FinderItemProps) {
  return (
    <div
      ref={itemRef}
      data-finder-item-id={id}
      className={clsx(s.folder, {
        [s.active]: isActive,
        [s.opened]: isOpenedInactive,
      })}
      style={{
        top: position.y,
        left: position.x,
        position: "absolute",
      }}
      onDoubleClick={onDoubleClick}
      onClick={onClick}
      onPointerDown={onPointerDown}
      onDragStart={(event) => event.preventDefault()}
    >
      {children}
    </div>
  );
});

