import { memo } from "react";

import s from "./Folder.module.scss";

interface FinderLabelProps {
  children: string;
}

export const FinderLabel = memo(function FinderLabel({
  children,
}: FinderLabelProps) {
  return <div className={s.folderName}>{children}</div>;
});

