export type DitherMode = "bayer" | "floyd" | "dots" | "ascii";

export interface VideoPlayerProps {
  windowId: string;
  fileUrl?: string;
}
