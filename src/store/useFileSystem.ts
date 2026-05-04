// src/store/useFileSystem.ts
import { create } from "zustand";

export interface Position {
  x: number;
  y: number;
}

export interface BaseItem {
  id: string;
  name: string;
  type: "folder" | "file" | "app" | "system";
  parentId?: string | null;
  position?: Position;
  active?: boolean;
}

export interface FolderItem extends BaseItem {
  type: "folder";
  children: string[];
}

export interface FileItem extends BaseItem {
  type: "file";
  content: string;
}

export type FileSystemItem = FolderItem | FileItem;

interface FileSystemStore {
  items: Record<string, FileSystemItem>;
  activeItemId: string | null;
  getChildren: (parentId: string | null) => FileSystemItem[];
  setActive: (id: string) => void;
  removeActive: () => void;
  getItemById: (id: string) => FileSystemItem | undefined;
}

export const useFileSystem = create<FileSystemStore>((set, get) => ({
  items: {
    root: {
      id: "root",
      name: "Desktop",
      type: "folder",
      parentId: null,
      children: ["folder1"],
    },
    projects: {
      id: "projects",
      name: "Projects",
      type: "folder",
      parentId: "root",
      position: { x: 100, y: 140 },
      children: [],
    },
    folderKanban: {
      id: "folder1",
      name: "Kanban",
      type: "folder",
      parentId: "projects",
      position: { x: 200, y: 140 },
      children: [],
    },

    kanbanReadme: {
      id: "file1",
      name: "Readme",
      type: "file",
      parentId: "folder1",
      content: "This is a readme file for the Kanban project.",
    },
    folderOther: {
      id: "folder2",
      name: "Test project",
      type: "folder",
      parentId: "projects",
      position: { x: 200, y: 140 },
      children: [],
    },
  },
  activeItemId: null,
  getChildren: (parentId) =>
    Object.values(get().items).filter((i) => i.parentId === parentId),

  getItemById: (id: string) =>
    Object.values(get().items).find((i) => i.id === id),

  setActive: (id: string) => {
    set(() => ({
      activeItemId: id,
    }));
  },
  removeActive: () => {
    set(() => ({
      activeItemId: null,
    }));
  },
}));
