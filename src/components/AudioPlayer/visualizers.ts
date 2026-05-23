export type VisualizerMode = "bars" | "waveform" | "circle";

export const drawPixelBars = (
  ctx: CanvasRenderingContext2D,
  data: Uint8Array,
  w: number,
  h: number,
) => {
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "black";

  if (data.length === 0) return;

  // Draw one pixel wide column for each frequency bin
  for (let i = 0; i < data.length; i++) {
    const normalized = data[i] / 255;
    const barHeight = Math.max(0, Math.floor(normalized * h));
    // Map bin index to x coordinate across the width
    const x = Math.round((i / (data.length - 1)) * (w - 1));
    // Draw vertical line from bottom up
    for (let y = 0; y < barHeight; y++) {
      ctx.fillRect(x, h - 1 - y, 1, 1);
    }
  }
};

export const drawPixelWaveform = (
  ctx: CanvasRenderingContext2D,
  data: Uint8Array,
  w: number,
  h: number,
) => {
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "black";

  const step = Math.max(1, Math.floor(data.length / w));
  const midY = Math.floor(h / 2);

  for (let x = 0; x < w; x++) {
    const index = Math.min(x * step, data.length - 1);
    const normalized = data[index] / 128 - 1; // -1 to 1
    const yOffset = Math.round(normalized * (midY - 1));
    const y = midY + yOffset;

    if (y >= 0 && y < h) {
      ctx.fillRect(x, y, 1, 1);
    }
  }
};

export const drawPixelCircle = (
  ctx: CanvasRenderingContext2D,
  data: Uint8Array,
  w: number,
  h: number,
) => {
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "black";

  const cx = Math.floor(w / 2);
  const cy = Math.floor(h / 2);
  const maxRadius = Math.min(cx, cy) - 4;
  const minRadius = Math.max(4, maxRadius - 20);
  const bands = Math.min(data.length, 64);

  for (let i = 0; i < bands; i++) {
    const angle = (i / bands) * Math.PI * 2 - Math.PI / 2;
    const normalized = data[i] / 255;
    const radius = minRadius + Math.floor(normalized * (maxRadius - minRadius));
    const x = Math.round(cx + Math.cos(angle) * radius);
    const y = Math.round(cy + Math.sin(angle) * radius);

    if (x >= 0 && x < w && y >= 0 && y < h) {
      ctx.fillRect(x, y, 1, 1);
    }
  }
};
