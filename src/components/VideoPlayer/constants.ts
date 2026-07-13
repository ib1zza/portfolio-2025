import type { DitherMode } from "./types";

export const ACCEPTED_TYPES = ["video/mp4", "video/webm"];

export const MODE_OPTIONS = [
  { value: "bayer" as DitherMode, label: "Bayer" },
  { value: "floyd" as DitherMode, label: "Floyd" },
  { value: "dots" as DitherMode, label: "Halftone" },
  { value: "ascii" as DitherMode, label: "ASCII" },
];

export const RESOLUTION_OPTIONS = [
  { value: "256", label: "256" },
  { value: "320", label: "320" },
  { value: "480", label: "480" },
];

export const MATRIX_OPTIONS = [
  { value: "2", label: "2×2" },
  { value: "4", label: "4×4" },
  { value: "8", label: "8×8" },
];
