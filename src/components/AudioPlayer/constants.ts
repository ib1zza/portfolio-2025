import type { VisualizerMode } from "./visualizers";

export const VISUALIZER_FRAME_MS = 45;
export const ACCEPTED_TYPES = ["audio/mpeg", "audio/ogg", "audio/wav", "audio/mp3"];

export const VISUALIZER_OPTIONS = [
  { value: "bars" as VisualizerMode, label: "Pixel Bars" },
  { value: "waveform" as VisualizerMode, label: "Pixel Waveform" },
  { value: "circle" as VisualizerMode, label: "Pixel Circle" },
];
