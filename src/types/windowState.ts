import type { Position } from "./fileSystem";

// types/window.ts
export interface WindowInstance {
  id: string;
  title: string;
  fileId?: string; // если окно связано с файлом/папкой
  parentId?: string | null; // кто открыл
  position: Position;
  size: { width: number; height: number };
  zIndex: number;
  isFocused: boolean;
  isMinimized: boolean;
  isClosed: boolean;
}
