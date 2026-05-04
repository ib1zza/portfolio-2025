// src/store/useFileSystem.ts
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  portfolio,
  type PortfolioProject,
  type ProjectModel,
} from "../data/portfolio";

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
  | { type: "projectModel"; model: ProjectModel }
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
    ...(project.client
      ? [{ type: "meta" as const, label: "Client", value: project.client }]
      : []),
    ...(project.agency
      ? [{ type: "meta" as const, label: "Agency", value: project.agency }]
      : []),
    ...(project.period
      ? [{ type: "meta" as const, label: "Period", value: project.period }]
      : []),
    ...(project.availability
      ? [
          {
            type: "meta" as const,
            label: "Availability",
            value: project.availability,
          },
        ]
      : []),
    { type: "meta", label: "Stack", value: project.stack.join(", ") },
    { type: "paragraph", text: project.summary },
    ...(project.caseStudy
      ? [
          { type: "heading" as const, text: "Case Study" },
          { type: "meta" as const, label: "Problem", value: project.caseStudy.problem },
          {
            type: "meta" as const,
            label: "Solution",
            value: project.caseStudy.solution,
          },
          ...(project.caseStudy.result
            ? [
                {
                  type: "meta" as const,
                  label: "Result",
                  value: project.caseStudy.result,
                },
              ]
            : []),
        ]
      : []),
    ...(project.responsibilities?.length
      ? [
          { type: "heading" as const, text: "Responsibilities" },
          { type: "list" as const, items: project.responsibilities },
        ]
      : []),
    ...(project.features?.length
      ? [
          { type: "heading" as const, text: "Features" },
          { type: "list" as const, items: project.features },
        ]
      : []),
    { type: "heading", text: "Highlights" },
    { type: "list", items: project.highlights },
    ...(project.metrics?.length
      ? [
          { type: "heading" as const, text: "Metrics" },
          {
            type: "list" as const,
            items: project.metrics.map((metric) =>
              [metric.label, metric.value, metric.note]
                .filter(Boolean)
                .join(" - ")
            ),
          },
        ]
      : []),
    ...(project.model
      ? [
          {
            type: "projectModel" as const,
            model: project.model,
          },
        ]
      : []),
    ...(project.accessNote
      ? [{ type: "paragraph" as const, text: project.accessNote }]
      : []),
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
  { type: "heading", text: "Focus" },
  { type: "list", items: portfolio.profile.focus },
  { type: "heading", text: "Achievements" },
  { type: "list", items: portfolio.achievements },
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

const sectionItems = portfolio.projectSections.reduce<Record<string, FileSystemItem>>(
  (items, section) => {
    const sectionId = `project-section-${section.id}`;

    items[sectionId] = {
      id: sectionId,
      name: section.title,
      type: "folder",
      parentId: "projects",
      children: section.projectIds.map((projectId) => `project-${projectId}`),
    };

    return items;
  },
  {}
);

const projectItems = portfolio.projects.reduce<Record<string, FileSystemItem>>(
  (items, project) => {
    const folderId = `project-${project.id}`;
    const readmeId = `file-${project.id}-readme`;
    const section = portfolio.projectSections.find((projectSection) =>
      projectSection.projectIds.includes(project.id)
    );

    items[folderId] = {
      id: folderId,
      name: project.title,
      type: "folder",
      parentId: section ? `project-section-${section.id}` : "projects",
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

const STORAGE_KEY = "portfolio-2025-file-system";

const readStoredPositions = () => {
  if (typeof window === "undefined") return {};

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};

    return JSON.parse(stored).state?.itemPositions ?? {};
  } catch {
    return {};
  }
};

const createInitialItems = (
  itemPositions: Record<string, Position> = {}
) => {
  const items: Record<string, FileSystemItem> = {
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
      children: portfolio.projectSections.map(
        (section) => `project-section-${section.id}`
      ),
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
    ...sectionItems,
    ...projectItems,
  };

  return Object.fromEntries(
    Object.entries(items).map(([id, item]) => [
      id,
      { ...item, position: itemPositions[id] ?? item.position },
    ])
  ) as Record<string, FileSystemItem>;
};

const getCleanPosition = (parentId: string | null, index: number) =>
  parentId === "root"
    ? { x: 80 + index * 120, y: 140 }
    : {
        x: 20 + (index % 3) * 130,
        y: 20 + Math.floor(index / 3) * 70,
      };

interface FileSystemStore {
  items: Record<string, FileSystemItem>;
  itemPositions: Record<string, Position>;
  activeItemId: string | null;
  getChildren: (parentId: string | null) => FileSystemItem[];
  setActive: (id: string) => void;
  removeActive: () => void;
  moveItem: (id: string, position: Position) => void;
  cleanUpChildren: (parentId: string | null) => void;
  resetLayout: () => void;
  getItemById: (id: string) => FileSystemItem | undefined;
}

const storedPositions = readStoredPositions();

export const useFileSystem = create<FileSystemStore>()(
  persist(
    (set, get) => ({
  items: createInitialItems(storedPositions),
  itemPositions: storedPositions,
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
  moveItem: (id, position) => {
    set((state) => ({
      items: {
        ...state.items,
        [id]: {
          ...state.items[id],
          position,
        },
      },
      itemPositions: {
        ...state.itemPositions,
        [id]: position,
      },
    }));
  },
  cleanUpChildren: (parentId) => {
    set((state) => {
      const parent = parentId ? state.items[parentId] : undefined;
      const children =
        parent?.type === "folder"
          ? parent.children
              .map((childId) => state.items[childId])
              .filter(Boolean)
          : Object.values(state.items).filter(
              (item) => item.parentId === parentId
            );
      const nextItems = { ...state.items };
      const nextPositions = { ...state.itemPositions };

      children.forEach((item, index) => {
        const position = getCleanPosition(parentId, index);

        nextItems[item.id] = {
          ...item,
          position,
        };
        nextPositions[item.id] = position;
      });

      return { items: nextItems, itemPositions: nextPositions };
    });
  },
  resetLayout: () => {
    set(() => ({
      items: createInitialItems(),
      itemPositions: {},
      activeItemId: null,
    }));
  },
}),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ itemPositions: state.itemPositions }),
    }
  )
);
