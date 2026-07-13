import { PREVIEW_SIZES } from "./constants";

export type Tool = "pencil" | "eraser" | "fill";
export type ExportFormat = "png" | "svg";
export type SaveMode = "overwrite" | "copy";

export type PreviewSize = (typeof PREVIEW_SIZES)[number];

export interface IconPainterProps {
  savedIconId?: string;
  savedIconName?: string;
  windowId?: string;
}
