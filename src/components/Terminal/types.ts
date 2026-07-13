export interface TerminalLine {
  text: string;
  type: "input" | "output" | "error" | "success" | "system";
}

export interface TerminalProps {
  windowId: string;
}
