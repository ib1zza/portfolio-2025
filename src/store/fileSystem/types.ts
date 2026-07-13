import type { WindowAppId } from "../../constants/windowLayout";
import type { ProjectModel } from "../../data/portfolio";

export interface Position {
  x: number;
  y: number;
}

export interface BaseItem {
  id: string;
  name: string;
  type: "folder" | "file" | "link" | "app" | "system";
  parentId?: string | null;
  position?: Position;
  active?: boolean;
}

export interface FolderItem extends BaseItem {
  type: "folder";
  children: string[];
}

export type DocumentBlock =
  | { type: "title"; text: string }
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "meta"; label: string; value: string }
  | { type: "list"; items: string[] }
  | { type: "links"; items: Array<{ label: string; href: string }> }
  | { type: "projectModel"; model: ProjectModel }
  | { type: "image"; src: string; alt: string; caption?: string };

export interface FileItem extends BaseItem {
  type: "file";
  content: string | DocumentBlock[];
  documentStyle?: "default" | "centered-note" | "easter-eggs-log";
  openWithApp?: WindowAppId;
  fileUrl?: string;
}

export interface SystemItem extends BaseItem {
  type: "system";
  systemType: "disk";
  children: string[];
}

export interface LinkItem extends BaseItem {
  type: "link";
  href: string;
  icon: "vk" | "telegram" | "email" | "github";
}

export interface AppItem extends BaseItem {
  type: "app";
  app:
    | "icon-painter"
    | "dither-studio"
    | "model-viewer"
    | "badge-generator"
    | "audio-player"
    | "video-player"
    | "space-invaders"
    | "portfolio-assistant"
    | "hypercard-stack"
    | "image-viewer"
    | "video-viewer"
    | "terminal"
    | "dither-camera";
  savedIconId?: string;
}

export type FileSystemItem =
  | FolderItem
  | FileItem
  | LinkItem
  | AppItem
  | SystemItem;

export const getChildItems = (
  items: Record<string, FileSystemItem>,
  parentId: string | null,
) => {
  const parent = parentId ? items[parentId] : undefined;

  if (parent?.type === "folder" || parent?.type === "system") {
    return parent.children
      .map((childId) => items[childId])
      .filter((item): item is FileSystemItem => Boolean(item));
  }

  return Object.values(items).filter((item) => item.parentId === parentId);
};
