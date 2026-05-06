import { memo } from "react";

import s from "./Window.module.scss";

interface WindowFinderDataProps {
  files: number;
  inDisk?: string;
  available?: string;
}

export const WindowFinderData = memo(function WindowFinderData({
  files,
  inDisk = "64 MB",
  available = "128 MB",
}: WindowFinderDataProps) {
  return (
    <div className={s.finderData}>
      <div className={s.finderItemsCount}>
        {files} item
        {files > 1 && "s"}
      </div>
      <div className={s.finderInDisk}>{inDisk} in disk</div>
      <div className={s.finderAvailable}>{available} available</div>
    </div>
  );
});

