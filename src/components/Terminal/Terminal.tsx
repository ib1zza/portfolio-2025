import { memo, useCallback, useEffect, useRef, useState } from "react";

import { useFileSystem, type DocumentBlock, type FileSystemItem } from "../../store/useFileSystem";
import { useWindowManager } from "../../store/useWindowManager";
import { getAppWindowSize, getDocumentNoteWindowSize, type WindowAppId } from "../../constants/windowLayout";
import { useHaptics } from "../../hooks/useHaptics";
import { useEasterEggProgress } from "../../features/easter-eggs/useEasterEggProgress";
import s from "./Terminal.module.scss";

interface TerminalProps {
  windowId: string;
}

interface TerminalLine {
  text: string;
  type: "input" | "output" | "error" | "success" | "system";
}

const SYSTEM_WELCOME = [
  { text: "Macintosh System Terminal [Version 7.5.3]", type: "system" as const },
  { text: "Copyright (c) 1984-2026 Apple Computer, Inc. All rights reserved.", type: "system" as const },
  { text: "Type 'help' or '?' to list available commands.", type: "system" as const },
  { text: "", type: "output" as const },
];

export const Terminal = memo(function Terminal({ windowId }: TerminalProps) {
  const fileSystemItems = useFileSystem((state) => state.items);
  const openWindow = useWindowManager((state) => state.openWindow);
  const haptics = useHaptics();
  const markFound = useEasterEggProgress((state) => state.markFound);

  const [currentFolderId, setCurrentFolderId] = useState<string>("root");
  const [inputValue, setInputValue] = useState<string>("");
  const [selectionStart, setSelectionStart] = useState(0);
  const [isFocused, setIsFocused] = useState(true);

  const changeInputValue = useCallback((newValue: string) => {
    setInputValue(newValue);
    setSelectionStart(newValue.length);
  }, []);

  const [lines, setLines] = useState<TerminalLine[]>(SYSTEM_WELCOME);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isAnimating, setIsAnimating] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Matrix canvas animation loop
  useEffect(() => {
    if (!isAnimating || !canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const container = containerRef.current;

    let fontSize = 13;
    let charWidth = 10;
    let cols = 50;
    let yPositions: number[] = [];
    let speeds: number[] = [];

    // Handle resizing and dynamic scaling dynamically
    const resizeCanvas = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;

      const computedStyle = window.getComputedStyle(container);
      fontSize = parseFloat(computedStyle.fontSize) || 13;
      charWidth = Math.floor(fontSize * 0.75); // aspect ratio for columns

      ctx.font = `${fontSize}px FindersKeepers, monospace`;

      const newCols = Math.floor(canvas.width / charWidth) + 1;
      if (newCols !== cols) {
        cols = newCols;
        yPositions = Array(cols).fill(0).map(() => Math.floor(Math.random() * -30));
        speeds = Array(cols).fill(0).map(() => (Math.random() > 0.5 ? 1 : 2));
      }
    };

    // Color definitions
    // Default classic theme is black on white
    const textColor = "#000000";
    const clearColor = "rgba(255, 255, 255, 0.12)"; // fading overlay
    const bgColor = "#ffffff";

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Fill canvas initially
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let animationFrameId: number;
    let lastTime = 0;

    const tick = (timestamp: number) => {
      animationFrameId = requestAnimationFrame(tick);

      // Throttling frame rate to ~15 FPS (every ~70ms) to fit retro terminal look
      if (timestamp - lastTime < 100) return;
      lastTime = timestamp;

      // Draw alpha rectangle to fade older frames
      ctx.fillStyle = clearColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px FindersKeepers, monospace`;

      for (let i = 0; i < cols; i++) {
        // Generate a new random ASCII symbol on each tick
        const char = String.fromCharCode(33 + Math.floor(Math.random() * 93));
        const x = i * charWidth;
        const y = yPositions[i] * fontSize;

        // Draw character
        ctx.fillStyle = textColor;
        ctx.fillText(char, x, y);

        // Move drop down by integer row steps
        yPositions[i] += speeds[i];

        // Reset drop to top with random delay when it reaches screen bottom
        if (yPositions[i] * fontSize > canvas.height) {
          yPositions[i] = Math.floor(Math.random() * -15);
          speeds[i] = Math.random() > 0.5 ? 1 : 2;
        }
      }
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [isAnimating]);

  useEffect(() => {
    if (isAnimating) {
      inputRef.current?.focus();
    }
  }, [isAnimating]);

  // Touching windowId to avoid unused warnings/errors
  useEffect(() => {
    if (windowId) {
      // debug or identifier check placeholder
    }
  }, [windowId]);

  // Scroll to bottom on lines change
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [lines]);

  // Focus input automatically on click anywhere in terminal
  const handleTerminalClick = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  // Helper to format absolute path string
  const getPathString = useCallback((folderId: string): string => {
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
  }, [fileSystemItems]);

  // Helper to resolve a path string to a folder item ID
  const resolveFolderId = useCallback((path: string): string | null => {
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
  }, [currentFolderId, fileSystemItems]);

  // Command handler
  const executeCommand = useCallback((rawInput: string) => {
    const cmdText = rawInput.trim();
    if (!cmdText) return;

    // Add command to log
    const promptPath = getPathString(currentFolderId);
    setLines((prev) => [...prev, { text: `macintosh:${promptPath} > ${cmdText}`, type: "input" }]);

    // Update history
    setHistory((prev) => {
      const next = [...prev, cmdText];
      setHistoryIndex(next.length);
      return next;
    });

    // Parse tokens
    const tokens = cmdText.split(/\s+/);
    const command = tokens[0].toLowerCase();
    const args = tokens.slice(1);

    const printOutput = (text: string, type: TerminalLine["type"] = "output") => {
      setLines((prev) => [...prev, { text, type }]);
    };

    switch (command) {
      case "help":
      case "?":
        printOutput("Available commands:", "system");
        printOutput("  help, ?             - Show this help message");
        printOutput("  about               - Display system information");
        printOutput("  pwd                 - Print working directory");
        printOutput("  ls                  - List directory contents");
        printOutput("  cd <dir>            - Change working directory");
        printOutput("  cat <file>          - Display contents of a text file");
        printOutput("  open <item>         - Open file, folder, or application in GUI");
        printOutput("  echo <text>         - Print text to console");
        printOutput("  clear, cls          - Clear screen");
        break;

      case "about":
        printOutput("--- System Info ---", "system");
        printOutput("OS: Macintosh System 7.5.3");
        printOutput("Processor: Motorola MC68040 @ 33 MHz");
        printOutput("RAM: 8,192 KB (7,640 KB Free)");
        printOutput("Display: 640x480, 1-bit Monochrome");
        printOutput("Storage: Macintosh HD (80 MB SCSI)");
        printOutput("-------------------", "system");
        printOutput("Built with React 19, Zustand, Framer Motion.");
        break;

      case "pwd":
        printOutput(getPathString(currentFolderId));
        break;

      case "ls": {
        const folder = fileSystemItems[currentFolderId];
        if (!folder || (folder.type !== "folder" && folder.type !== "system")) {
          printOutput("ls: current directory not readable", "error");
          break;
        }

        if (folder.children.length === 0) {
          printOutput("(empty directory)", "system");
          break;
        }

        folder.children.forEach((childId) => {
          const item = fileSystemItems[childId];
          if (!item) return;

          let typeLabel = "[UNK]";
          if (item.type === "folder" || item.type === "system") typeLabel = "[DIR]";
          else if (item.type === "file") typeLabel = "[TXT]";
          else if (item.type === "app") typeLabel = "[APP]";
          else if (item.type === "link") typeLabel = "[LNK]";

          // Align type label nicely
          const namePart = item.name.padEnd(28, " ");
          printOutput(`${namePart} ${typeLabel}`);
        });
        break;
      }

      case "cd": {
        if (args.length === 0) {
          setCurrentFolderId("root");
          break;
        }

        const dirName = args.join(" ");
        const resolvedId = resolveFolderId(dirName);
        if (resolvedId) {
          setCurrentFolderId(resolvedId);
        } else {
          printOutput(`cd: no such directory: ${dirName}`, "error");
        }
        break;
      }

      case "cat": {
        if (args.length === 0) {
          printOutput("cat: missing filename", "error");
          break;
        }

        const fileName = args.join(" ");
        const folder = fileSystemItems[currentFolderId];
        if (!folder || (folder.type !== "folder" && folder.type !== "system")) {
          printOutput("cat: read error", "error");
          break;
        }

        const childFile = folder.children
          .map((childId) => fileSystemItems[childId])
          .find((item) => item && item.type === "file" && item.name.toLowerCase() === fileName.toLowerCase());

        if (!childFile || childFile.type !== "file") {
          printOutput(`cat: file not found: ${fileName}`, "error");
          break;
        }

        // Print content
        if (typeof childFile.content === "string") {
          if (!childFile.content) {
            printOutput("(empty file)", "system");
          } else {
            childFile.content.split("\n").forEach((line) => printOutput(line));
          }
        } else if (Array.isArray(childFile.content)) {
          // Render DocumentBlock[] structures nicely
          childFile.content.forEach((block: DocumentBlock) => {
            switch (block.type) {
              case "title":
                printOutput(`*** ${block.text.toUpperCase()} ***`, "system");
                break;
              case "heading":
                printOutput(`\n--- ${block.text} ---`, "system");
                break;
              case "paragraph":
                printOutput(block.text);
                break;
              case "meta":
                printOutput(`${block.label}: ${block.value}`);
                break;
              case "list":
                block.items.forEach((li) => printOutput(` * ${li}`));
                break;
              case "links":
                block.items.forEach((link) => printOutput(` [Link] ${link.label}: ${link.href}`, "success"));
                break;
              case "projectModel":
                printOutput(` [3D Model Reference: ${block.model.label} (${block.model.kind})]`, "system");
                break;
              case "image":
                printOutput(` [Image Reference: ${block.alt}]`, "system");
                break;
              default:
                break;
            }
          });
        }
        break;
      }

      case "open": {
        if (args.length === 0) {
          printOutput("open: missing item name", "error");
          break;
        }

        const itemName = args.join(" ");
        const folder = fileSystemItems[currentFolderId];
        if (!folder || (folder.type !== "folder" && folder.type !== "system")) {
          printOutput("open: read error", "error");
          break;
        }

        const child = folder.children
          .map((childId) => fileSystemItems[childId])
          .find((item) => item && item.name.toLowerCase() === itemName.toLowerCase());

        if (!child) {
          printOutput(`open: item not found: ${itemName}`, "error");
          break;
        }

        const preferredSize =
          child.type === "app"
            ? getAppWindowSize(child.app as WindowAppId)
            : child.type === "file" && child.documentStyle === "centered-note"
              ? getDocumentNoteWindowSize()
              : undefined;

        const windowOptions =
          child.type === "file" && child.documentStyle === "centered-note"
            ? { resizable: false, windowVariant: "note" as const }
            : undefined;

        // Open via windowManager
        openWindow(child.id, child.name, child.parentId, undefined, preferredSize, undefined, windowOptions);
        printOutput(`Opening ${child.name}...`, "success");
        break;
      }

      case "matrix": {
        markFound("terminal-matrix");
        haptics.easterEgg("bootSequence");
        setIsAnimating(true);
        break;
      }

      case "echo":
        printOutput(args.join(" "));
        break;

      case "clear":
      case "cls":
        setLines([]);
        break;

      default:
        printOutput(`shell: command not found: ${command}`, "error");
        break;
    }
  }, [currentFolderId, fileSystemItems, getPathString, openWindow, resolveFolderId, haptics, markFound]);

  // Key handlers
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();

      const val = inputValue.trimStart();
      if (!val) return;

      const lastSpaceIndex = val.lastIndexOf(" ");
      if (lastSpaceIndex === -1) {
        // Autocomplete command
        const partialCmd = val.toLowerCase();
        const candidates = ["help", "about", "pwd", "ls", "cd", "cat", "open", "matrix", "echo", "clear", "cls"];
        const matches = candidates.filter((c) => c.startsWith(partialCmd));

        if (matches.length > 0) {
          changeInputValue(matches[0] + " ");
        }
      } else {
        // Autocomplete file/folder/app name in the current directory
        const commandPart = val.substring(0, lastSpaceIndex + 1);
        const partialName = val.substring(lastSpaceIndex + 1).toLowerCase();

        const folder = fileSystemItems[currentFolderId];
        if (folder && (folder.type === "folder" || folder.type === "system")) {
          const childNames = folder.children
            .map((id) => fileSystemItems[id]?.name)
            .filter((name): name is string => Boolean(name));

          const matches = childNames.filter((name) =>
            name.toLowerCase().startsWith(partialName)
          );

          if (matches.length > 0) {
            changeInputValue(commandPart + matches[0]);
          }
        }
      }
    } else if (e.key === "Enter") {
      executeCommand(inputValue);
      changeInputValue("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;

      const prevIndex = historyIndex - 1;
      if (prevIndex >= 0) {
        setHistoryIndex(prevIndex);
        changeInputValue(history[prevIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextIndex = historyIndex + 1;
      if (nextIndex < history.length) {
        setHistoryIndex(nextIndex);
        changeInputValue(history[nextIndex]);
      } else {
        setHistoryIndex(history.length);
        changeInputValue("");
      }
    }
  }, [executeCommand, history, historyIndex, inputValue, currentFolderId, fileSystemItems, changeInputValue]);

  // Initial focus
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  if (isAnimating) {
    return (
      <div
        ref={containerRef}
        className={`${s.terminalContainer} ${s.animationActive}`}
        onClick={handleTerminalClick}
      >
        <canvas ref={canvasRef} className={s.animationCanvas} />
        <input
          ref={inputRef}
          type="text"
          className={s.promptInputHidden}
          value=""
          onChange={() => { }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setIsAnimating(false);
              setLines((prev) => [...prev, { text: "Wake up, Neo... You have escaped the Matrix.", type: "system" }]);
            }
          }}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          style={{ position: "absolute", opacity: 0, pointerEvents: "none" }}
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={s.terminalContainer}
      onClick={handleTerminalClick}
    >
      <div className={s.outputContent}>
        {lines.map((line, idx) => (
          <div
            key={idx}
            className={`${s.line} ${line.type === "input"
              ? s.lineInput
              : line.type === "error"
                ? s.lineError
                : line.type === "success"
                  ? s.lineSuccess
                  : line.type === "system"
                    ? s.lineSystem
                    : s.lineOutput
              }`}
          >
            {line.text}
          </div>
        ))}
        <div className={s.promptRow}>
          <span className={s.promptLabel}>macintosh:{getPathString(currentFolderId)} &gt;</span>
          <div className={s.promptInputWrapper}>
            <div className={s.promptRepresentation}>
              <span>{inputValue.slice(0, selectionStart)}</span>
              <span className={`${s.cursorBlock} ${isFocused ? s.focused : ""}`}>
                {inputValue[selectionStart] || "\u00A0"}
              </span>
              <span>{inputValue.slice(selectionStart + 1)}</span>
            </div>
            <input
              ref={inputRef}
              type="text"
              className={s.promptInput}
              value={inputValue}
              onChange={(e) => {
                const val = e.target.value.replace(/[^\x20-\x7E]/g, "");
                setInputValue(val);
                setSelectionStart(e.target.selectionStart ?? 0);
              }}
              onKeyDown={handleKeyDown}
              onSelect={(e) => setSelectionStart(e.currentTarget.selectionStart ?? 0)}
              onKeyUp={(e) => setSelectionStart(e.currentTarget.selectionStart ?? 0)}
              onClick={(e) => setSelectionStart(e.currentTarget.selectionStart ?? 0)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
});
