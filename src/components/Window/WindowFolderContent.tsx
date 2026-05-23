import { memo } from "react";
import type { RefObject } from "react";

import type { FileSystemItem } from "../../store/useFileSystem";
import { scaleUiValue } from "../../utils/uiScale";
import Folder from "../Folder";
import s from "./Window.module.scss";
import type { FinderIconType } from "../Folder/FinderIcon";

interface WindowFolderContentProps {
  childItems: FileSystemItem[];
  parentWindowId: string;
  constraintRef: RefObject<HTMLDivElement | null>;
}

const DEFAULT_GRID = {
  columns: 3,
  startX: 16,
  startY: 14,
  stepX: 112,
  stepY: 58,
} as const;

const getDefaultPosition = (index: number) => ({
  x:
    scaleUiValue(DEFAULT_GRID.startX) +
    (index % DEFAULT_GRID.columns) * scaleUiValue(DEFAULT_GRID.stepX),
  y:
    scaleUiValue(DEFAULT_GRID.startY) +
    Math.floor(index / DEFAULT_GRID.columns) * scaleUiValue(DEFAULT_GRID.stepY),
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
              icon={("app-" + child.id) as FinderIconType}
            />
          );
        }

        return null;
      })}
    </div>
  );
});
