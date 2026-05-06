export type DitherMode = "threshold" | "bayer" | "floyd" | "atkinson";
export type ExportFormat = "png" | "svg";
export type OutputSize = "128" | "256" | "512";

export const DITHER_MODES: Array<{ value: DitherMode; label: string }> = [
  { value: "threshold", label: "threshold" },
  { value: "bayer", label: "bayer" },
  { value: "floyd", label: "floyd" },
  { value: "atkinson", label: "atkinson" },
];

export const OUTPUT_SIZES: Array<{ value: OutputSize; label: string }> = [
  { value: "128", label: "128 px" },
  { value: "256", label: "256 px" },
  { value: "512", label: "512 px" },
];

export const EXPORT_FORMATS: Array<{ value: ExportFormat; label: string }> = [
  { value: "png", label: "png" },
  { value: "svg", label: "svg" },
];
