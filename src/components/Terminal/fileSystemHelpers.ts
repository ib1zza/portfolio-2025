import type { FileSystemItem } from "../../store/useFileSystem";

export const getPathString = (
  folderId: string,
  fileSystemItems: Record<string, FileSystemItem>,
): string => {
  if (folderId === "root") return "/";

  let path = "";
  let curr: FileSystemItem | undefined = fileSystemItems[folderId];
  while (curr) {
    if (curr.id === "root") {
      break;
    }
    path = curr.name + (path ? "/" + path : "");
    const parentId: string | null | undefined = curr.parentId;
    curr = parentId ? fileSystemItems[parentId] : undefined;
  }
  return "/" + path;
};

export const resolveFolderId = (
  path: string,
  currentFolderId: string,
  fileSystemItems: Record<string, FileSystemItem>,
): string | null => {
  const cleanPath = path.trim();
  if (!cleanPath) return currentFolderId;
  if (cleanPath === "/" || cleanPath === "~") return "root";

  const parts = cleanPath.split("/").filter(Boolean);
  let tempId: string | null = cleanPath.startsWith("/") ? "root" : currentFolderId;

  for (const part of parts) {
    if (!tempId) return null;
    if (part === ".") continue;

    const currentId: string = tempId;
    if (part === "..") {
      const item: FileSystemItem | undefined = fileSystemItems[currentId];
      tempId = item?.parentId ?? "root";
      continue;
    }

    const parentItem: FileSystemItem | undefined = fileSystemItems[currentId];
    if (!parentItem || (parentItem.type !== "folder" && parentItem.type !== "system")) {
      return null;
    }

    const match: FileSystemItem | undefined = parentItem.children
      .map((childId: string) => fileSystemItems[childId])
      .find((child: FileSystemItem | undefined) => child && child.name.toLowerCase() === part.toLowerCase());

    if (match && (match.type === "folder" || match.type === "system")) {
      tempId = match.id;
    } else {
      return null;
    }
  }

  return tempId;
};
