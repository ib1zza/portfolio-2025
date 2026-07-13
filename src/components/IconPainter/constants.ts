import type { Tool, ExportFormat } from "./types";

export const GRID_SIZE = 32;
export const PIXEL_COUNT = GRID_SIZE * GRID_SIZE;
export const STORAGE_KEY = "portfolio-2025-icon-painter";
export const STORAGE_VERSION = 1;
export const MAX_HISTORY_LENGTH = 50;
export const PREVIEW_SIZES = [128, 64, 32] as const;
export const TOOL_OPTIONS: Tool[] = ["pencil", "eraser", "fill"];
export const EXPORT_FORMATS: Array<{ value: ExportFormat; label: string }> = [
  { value: "png", label: "png" },
  { value: "svg", label: "svg" },
];
