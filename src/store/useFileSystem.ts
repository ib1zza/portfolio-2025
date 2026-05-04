// src/store/useFileSystem.ts
import { create } from "zustand";
import { portfolio, type PortfolioProject } from "../data/portfolio";

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

export type DocumentBlock =
  | { type: "title"; text: string }
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "meta"; label: string; value: string }
  | { type: "list"; items: string[] }
  | { type: "links"; items: Array<{ label: string; href: string }> }
  | { type: "image"; src: string; alt: string; caption?: string };

export interface FileItem extends BaseItem {
  type: "file";
  content: string | DocumentBlock[];
}

export type FileSystemItem = FolderItem | FileItem;

const formatProject = (project: PortfolioProject) =>
  [
    { type: "title", text: project.title },
    { type: "meta", label: "Year", value: project.year },
    { type: "meta", label: "Status", value: project.status },
    { type: "meta", label: "Role", value: project.role },
    { type: "meta", label: "Stack", value: project.stack.join(", ") },
    { type: "paragraph", text: project.summary },
    { type: "heading", text: "Highlights" },
    { type: "list", items: project.highlights },
    ...(project.images ?? []).map((image) => ({ type: "image" as const, ...image })),
    ...(project.links.length
      ? [{ type: "heading" as const, text: "Links" }, { type: "links" as const, items: project.links }]
      : []),
  ] satisfies DocumentBlock[];

const aboutContent = [
  { type: "title", text: "About Me" },
  { type: "meta", label: "Name", value: portfolio.profile.name },
  { type: "meta", label: "Role", value: portfolio.profile.role },
  { type: "meta", label: "Location", value: portfolio.profile.location },
  { type: "paragraph", text: portfolio.profile.summary },
  { type: "heading", text: "Skills" },
  { type: "paragraph", text: portfolio.skills.join(", ") },
  { type: "heading", text: "Experience" },
  ...portfolio.experience.flatMap<DocumentBlock>((item) => [
    { type: "meta", label: item.company, value: `${item.role}, ${item.period}` },
    { type: "list", items: item.highlights },
  ]),
] satisfies DocumentBlock[];

const educationContent = [
  { type: "title", text: "Education" },
  ...portfolio.education.flatMap<DocumentBlock>((item) => [
    { type: "heading", text: item.place },
    { type: "meta", label: "Program", value: item.title },
    { type: "meta", label: "Period", value: item.period },
    { type: "paragraph", text: item.description },
  ]),
] satisfies DocumentBlock[];

const contactsContent = [
  { type: "title", text: "Contact" },
  { type: "links", items: portfolio.contacts },
] satisfies DocumentBlock[];

const projectItems = portfolio.projects.reduce<Record<string, FileSystemItem>>(
  (items, project) => {
    const folderId = `project-${project.id}`;
    const readmeId = `file-${project.id}-readme`;

    items[folderId] = {
      id: folderId,
      name: project.title,
      type: "folder",
      parentId: "projects",
      children: [readmeId],
    };

    items[readmeId] = {
      id: readmeId,
      name: "Readme",
      type: "file",
      parentId: folderId,
      content: formatProject(project),
    };

    return items;
  },
  {}
);

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
      children: ["about", "projects", "education", "contact"],
    },
    projects: {
      id: "projects",
      name: "Projects",
      type: "folder",
      parentId: "root",
      position: { x: 200, y: 140 },
      children: portfolio.projects.map((project) => `project-${project.id}`),
    },
    about: {
      id: "about",
      name: "About Me",
      type: "folder",
      parentId: "root",
      position: { x: 80, y: 140 },
      children: ["aboutReadme"],
    },
    aboutReadme: {
      id: "aboutReadme",
      name: "Profile",
      type: "file",
      parentId: "about",
      content: aboutContent,
    },
    education: {
      id: "education",
      name: "Education",
      type: "folder",
      parentId: "root",
      position: { x: 320, y: 140 },
      children: ["educationReadme"],
    },
    educationReadme: {
      id: "educationReadme",
      name: "Schools",
      type: "file",
      parentId: "education",
      content: educationContent,
    },
    contact: {
      id: "contact",
      name: "Contact",
      type: "folder",
      parentId: "root",
      position: { x: 460, y: 140 },
      children: ["contactReadme"],
    },
    contactReadme: {
      id: "contactReadme",
      name: "Links",
      type: "file",
      parentId: "contact",
      content: contactsContent,
    },
    ...projectItems,
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
