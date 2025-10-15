// types/filesystem.ts
export interface Position {
  x: number;
  y: number;
}

// Базовый интерфейс для любого элемента
export interface BaseItem {
  id: string;
  name: string;
  type: "folder" | "file" | "app" | "system";
  icon?: string;
  createdAt?: string;
  modifiedAt?: string;
  size?: string;

  // Новые поля:
  parentId?: string | null; // кто родитель (null — рабочий стол)
  position?: Position; // позиция иконки на экране
  zIndex?: number; // актуален, если иконка имеет “поверхностный” слой (например, окно)
}

export interface FileItem extends BaseItem {
  type: "file";
  fileType: "text" | "image" | "html" | "binary" | "unknown";
  content: string;
}

export interface FolderItem extends BaseItem {
  type: "folder";
  children: FileSystemItem[];
}

export interface AppItem extends BaseItem {
  type: "app";
  appId: string; // например, Finder, Calculator
}

export interface SystemItem extends BaseItem {
  type: "system";
  systemType: "disk" | "trash" | "settings";
  children?: FileSystemItem[];
}

export type FileSystemItem = FolderItem | FileItem | AppItem | SystemItem;
