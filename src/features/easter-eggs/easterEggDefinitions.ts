export type EasterEggId =
  | "hypercard-stack"
  | "time-machine-hd"
  | "special-menu"
  | "last-disk"
  | "trash-bomb";

export interface EasterEggDefinition {
  id: EasterEggId;
  label: string;
}

export const EASTER_EGG_DEFINITIONS: EasterEggDefinition[] = [
  { id: "hypercard-stack", label: "HyperCard Stack" },
  { id: "time-machine-hd", label: "Time Machine HD" },
  { id: "special-menu", label: "Special" },
  { id: "last-disk", label: "LAST_DISK.img" },
  { id: "trash-bomb", label: "Trash Bomb" },
];

export const EASTER_EGG_COUNT = EASTER_EGG_DEFINITIONS.length;

export const EASTER_EGG_LOG_FILE_ID = "easterEggLog";
