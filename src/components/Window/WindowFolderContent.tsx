import { memo } from "react";
import type { RefObject } from "react";

import type { FileSystemItem } from "../../store/useFileSystem";
import Folder from "../Folder";
import s from "./Window.module.scss";

interface WindowFolderContentProps {
  childItems: FileSystemItem[];
  parentWindowId: string;
  constraintRef: RefObject<HTMLDivElement | null>;
}

const getDefaultPosition = (index: number) => ({
  x: 16 + (index % 3) * 112,
  y: 14 + Math.floor(index / 3) * 58,
});

export const WindowFolderContent = memo(function WindowFolderContent({
  childItems,
  parentWindowId,
  constraintRef,
}: WindowFolderContentProps) {
  return (
    <div className={s.folderContent}>
      {childItems.map((child, index) => {
        const itemPosition = child.position ?? getDefaultPosition(index);

        if (child.type === "folder") {
          return (
            <Folder
              key={child.id}
              id={child.id}
              name={child.name}
              position={itemPosition}
              parentWindowId={parentWindowId}
              constraintRef={constraintRef}
            />
          );
        }

        if (child.type === "file") {
          return (
            <Folder
              key={child.id}
              id={child.id}
              name={child.name}
              position={itemPosition}
              parentWindowId={parentWindowId}
              constraintRef={constraintRef}
              icon="file"
            />
          );
        }

        if (child.type === "link") {
          return (
            <Folder
              key={child.id}
              id={child.id}
              name={child.name}
              position={itemPosition}
              parentWindowId={parentWindowId}
              constraintRef={constraintRef}
              icon={child.icon}
            />
          );
        }

        if (child.type === "app") {
          return (
            <Folder
              key={child.id}
              id={child.id}
              name={child.name}
              position={itemPosition}
              parentWindowId={parentWindowId}
              constraintRef={constraintRef}
              icon="app"
            />
          );
        }

        return null;
      })}
    </div>
  );
});
