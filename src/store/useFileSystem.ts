// src/store/useFileSystem.ts
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  portfolio,
  type PortfolioProject,
  type ProjectModel,
} from "../data/portfolio";
import { createThrottledLocalStorage } from "../utils/storage";

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
}

export interface LinkItem extends BaseItem {
  type: "link";
  href: string;
  icon: "vk" | "telegram" | "email" | "github";
}

export interface AppItem extends BaseItem {
  type: "app";
  app: "icon-painter" | "dither-studio";
}

export type FileSystemItem = FolderItem | FileItem | LinkItem | AppItem;

export const getChildItems = (
  items: Record<string, FileSystemItem>,
  parentId: string | null,
) => {
  const parent = parentId ? items[parentId] : undefined;

  if (parent?.type === "folder") {
    return parent.children
      .map((childId) => items[childId])
      .filter((item): item is FileSystemItem => Boolean(item));
  }

  return Object.values(items).filter((item) => item.parentId === parentId);
};

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
          {
            type: "meta" as const,
            label: "Problem",
            value: project.caseStudy.problem,
          },
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
                .join(" - "),
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
    ...(project.images ?? []).map((image) => ({
      type: "image" as const,
      ...image,
    })),
    ...(project.links.length
      ? [
          { type: "heading" as const, text: "Links" },
          { type: "links" as const, items: project.links },
        ]
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
    {
      type: "meta",
      label: item.company,
      value: `${item.role}, ${item.period}`,
    },
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

const contactShortcutItems = portfolio.contacts.reduce<
  Record<string, FileSystemItem>
>((items, contact) => {
  const icon = contact.label.toLowerCase();

  if (
    icon !== "vk" &&
    icon !== "telegram" &&
    icon !== "email" &&
    icon !== "github"
  ) {
    return items;
  }

  items[`contact-${icon}`] = {
    id: `contact-${icon}`,
    name: contact.label,
    type: "link",
    parentId: "contact",
    href: contact.href,
    icon,
  };

  return items;
}, {});

const sectionItems = portfolio.projectSections.reduce<
  Record<string, FileSystemItem>
>((items, section) => {
  const sectionId = `project-section-${section.id}`;

  items[sectionId] = {
    id: sectionId,
    name: section.title,
    type: "folder",
    parentId: "projects",
    children: section.projectIds.map((projectId) => `project-${projectId}`),
  };

  return items;
}, {});

const projectItems = portfolio.projects.reduce<Record<string, FileSystemItem>>(
  (items, project) => {
    const folderId = `project-${project.id}`;
    const readmeId = `file-${project.id}-readme`;
    const section = portfolio.projectSections.find((projectSection) =>
      projectSection.projectIds.includes(project.id),
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
  {},
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

const createInitialItems = (itemPositions: Record<string, Position> = {}) => {
  const items: Record<string, FileSystemItem> = {
    root: {
      id: "root",
      name: "Desktop",
      type: "folder",
      parentId: null,
      children: [
        "about",
        "projects",
        "education",
        "contact",
        "iconPainter",
        "ditherStudio",
      ],
    },
    projects: {
      id: "projects",
      name: "Projects",
      type: "folder",
      parentId: "root",
      position: { x: 176, y: 132 },
      children: portfolio.projectSections.map(
        (section) => `project-section-${section.id}`,
      ),
    },
    about: {
      id: "about",
      name: "About Me",
      type: "folder",
      parentId: "root",
      position: { x: 72, y: 132 },
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
      position: { x: 280, y: 132 },
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
      position: { x: 384, y: 132 },
      children: [
        "contact-telegram",
        "contact-vk",
        "contact-email",
        "contact-github",
        "contactReadme",
      ],
    },
    contactReadme: {
      id: "contactReadme",
      name: "Links",
      type: "file",
      parentId: "contact",
      content: contactsContent,
    },
    iconPainter: {
      id: "iconPainter",
      name: "Icon Painter",
      type: "app",
      parentId: "root",
      position: { x: 488, y: 132 },
      app: "icon-painter",
    },
    ditherStudio: {
      id: "ditherStudio",
      name: "Dither Studio",
      type: "app",
      parentId: "root",
      position: { x: 592, y: 132 },
      app: "dither-studio",
    },
    ...contactShortcutItems,
    ...sectionItems,
    ...projectItems,
  };

  return Object.fromEntries(
    Object.entries(items).map(([id, item]) => [
      id,
      { ...item, position: itemPositions[id] ?? item.position },
    ]),
  ) as Record<string, FileSystemItem>;
};

const getCleanPosition = (parentId: string | null, index: number) =>
  parentId === "root"
    ? { x: 72 + index * 104, y: 132 }
    : {
        x: 16 + (index % 3) * 112,
        y: 14 + Math.floor(index / 3) * 58,
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
      getChildren: (parentId) => getChildItems(get().items, parentId),

      getItemById: (id: string) => get().items[id],

      setActive: (id: string) => {
        set((state) =>
          state.activeItemId === id ? state : { activeItemId: id },
        );
      },
      removeActive: () => {
        set((state) =>
          state.activeItemId === null ? state : { activeItemId: null },
        );
      },
      moveItem: (id, position) => {
        set((state) => {
          const item = state.items[id];

          if (!item) return state;
          if (
            item.position?.x === position.x &&
            item.position?.y === position.y
          ) {
            return state;
          }

          return {
            items: {
              ...state.items,
              [id]: {
                ...item,
                position,
              },
            },
            itemPositions: {
              ...state.itemPositions,
              [id]: position,
            },
          };
        });
      },
      cleanUpChildren: (parentId) => {
        set((state) => {
          const children = getChildItems(state.items, parentId);
          let nextItems = state.items;
          let nextPositions = state.itemPositions;
          let hasChanges = false;

          children.forEach((item, index) => {
            const position = getCleanPosition(parentId, index);

            if (
              item.position?.x === position.x &&
              item.position?.y === position.y
            ) {
              return;
            }

            if (!hasChanges) {
              nextItems = { ...state.items };
              nextPositions = { ...state.itemPositions };
              hasChanges = true;
            }

            nextItems[item.id] = {
              ...item,
              position,
            };
            nextPositions[item.id] = position;
          });

          return hasChanges
            ? { items: nextItems, itemPositions: nextPositions }
            : state;
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
      version: 1,
      storage: createJSONStorage(() => createThrottledLocalStorage()),
      migrate: (persistedState) => {
        const state = persistedState as Partial<FileSystemStore> | undefined;

        return {
          itemPositions: state?.itemPositions ?? {},
        } as Partial<FileSystemStore>;
      },
      partialize: (state) => ({ itemPositions: state.itemPositions }),
    },
  ),
);
