import { useEffect, type RefObject } from "react";

export const useMatrixAnimation = (
  canvasRef: RefObject<HTMLCanvasElement | null>,
  containerRef: RefObject<HTMLDivElement | null>,
  isAnimating: boolean,
) => {
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

      ctx.font = `${fontSize}px Monaco, monospace`;

      const newCols = Math.floor(canvas.width / charWidth) + 1;
      if (newCols !== cols) {
        cols = newCols;
        yPositions = Array(cols).fill(0).map(() => Math.floor(Math.random() * -30));
        speeds = Array(cols).fill(0).map(() => (Math.random() > 0.5 ? 1 : 2));
      }
    };

    // Color definitions
    // Default classic theme is white on black
    const textColor = "#ffffff";
    const clearColor = "rgba(0, 0, 0, 0.12)"; // fading overlay
    const bgColor = "#000000";

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

      ctx.font = `${fontSize}px Monaco, monospace`;

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
  }, [canvasRef, containerRef, isAnimating]);
};
