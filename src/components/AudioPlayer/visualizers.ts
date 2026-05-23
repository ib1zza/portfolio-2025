// src/components/AudioPlayer/visualizers.ts

export type VisualizerMode = "bars" | "waveform" | "circle";

const clearCanvas = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "black";
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const drawPixelRectCentered = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
) => {
  const half = Math.floor(size / 2);
  ctx.fillRect(x - half, y - half, size, size);
};

export const drawPixelBars = (
  ctx: CanvasRenderingContext2D,
  data: Uint8Array,
  w: number,
  h: number,
) => {
  clearCanvas(ctx, w, h);

  if (data.length === 0) return;

  const barWidth = 3;
  const gap = 3;
  const stride = barWidth + gap;
  const barCount = Math.max(1, Math.floor(w / stride));

  // Берём в основном низкие/средние частоты — они визуально приятнее,
  // чем весь спектр до ультравысоких частот.
  const usableBins = Math.max(1, Math.floor(data.length * 0.72));
  const bottomPadding = 0;

  for (let barIndex = 0; barIndex < barCount; barIndex++) {
    const startBin = Math.floor((barIndex / barCount) * usableBins);
    const endBin = Math.max(
      startBin + 1,
      Math.floor(((barIndex + 1) / barCount) * usableBins),
    );

    let sum = 0;

    for (let i = startBin; i < endBin; i++) {
      sum += data[i] ?? 0;
    }

    const average = sum / (endBin - startBin);
    const normalized = average / 255;

    // Немного усиливаем тихие значения, чтобы бары не были слишком плоскими.
    const shaped = Math.pow(normalized, 0.72);
    const barHeight = clamp(Math.floor(shaped * h), 1, h);

    const x = barIndex * stride;
    const y = h - bottomPadding - barHeight;

    ctx.fillRect(x, y, barWidth, barHeight);
  }
};

export const drawPixelWaveform = (
  ctx: CanvasRenderingContext2D,
  data: Uint8Array,
  w: number,
  h: number,
) => {
  clearCanvas(ctx, w, h);

  if (data.length === 0) return;

  const midY = Math.floor(h / 2);
  const amplitude = Math.floor(h * 0.42);

  let previousX = 0;
  let previousY = midY;

  for (let x = 0; x < w; x++) {
    // Важно: маппим всю ширину canvas на всю длину data.
    // Старый x * step ломался, когда canvas шире, чем data.length.
    const exactIndex = (x / Math.max(1, w - 1)) * (data.length - 1);
    const leftIndex = Math.floor(exactIndex);
    const rightIndex = Math.min(data.length - 1, leftIndex + 1);
    const t = exactIndex - leftIndex;

    const left = data[leftIndex] ?? 128;
    const right = data[rightIndex] ?? left;
    const value = left + (right - left) * t;

    const normalized = value / 128 - 1;
    const y = clamp(Math.round(midY + normalized * amplitude), 0, h - 1);

    // Рисуем не только точки, а короткие пиксельные сегменты.
    // Так waveform выглядит цельной, но всё ещё ретро.
    if (x > 0) {
      const minY = Math.min(previousY, y);
      const maxY = Math.max(previousY, y);

      for (let drawY = minY; drawY <= maxY; drawY++) {
        ctx.fillRect(previousX, drawY, 1, 1);
      }
    }

    ctx.fillRect(x, y, 1, 1);

    previousX = x;
    previousY = y;
  }
};

const drawPixelLine = (
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  thickness = 2,
) => {
  let dx = Math.abs(x1 - x0);
  let dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  let x = x0;
  let y = y0;

  while (true) {
    drawPixelRectCentered(ctx, x, y, thickness);

    if (x === x1 && y === y1) break;

    const e2 = err * 2;

    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }

    if (e2 < dx) {
      err += dx;
      y += sy;
    }

    dx = Math.abs(x1 - x0);
    dy = Math.abs(y1 - y0);
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

  if (data.length === 0) return;

  const cx = Math.floor(w / 2);
  const cy = Math.floor(h / 2);
  const minSide = Math.min(w, h);

  const baseRadius = Math.floor(minSide * 0.26);
  const radiusRange = Math.floor(minSide * 0.16);

  // Считаем только правую сторону: от верхней точки до нижней.
  const rightSidePointCount = 40;

  const pointSize = Math.max(2, Math.floor(minSide / 120));
  const lineThickness = Math.max(2, Math.floor(pointSize));

  const rightPoints: Array<{ x: number; y: number }> = [];

  for (let i = 0; i < rightSidePointCount; i++) {
    // Угол только для правой половины круга:
    // -PI/2 = верх, +PI/2 = низ
    const t = i === 1 ? 0 : i / (rightSidePointCount - 1);
    const angle = -Math.PI / 2 + t * Math.PI;

    // Берём данные только для правой стороны и слегка усредняем,
    // чтобы форма не ломалась в острые пики.
    const centerBin = Math.floor(t * (data.length - 1));
    const windowSize = 4;

    let sum = 0;
    let count = 0;

    for (let offset = -windowSize; offset <= windowSize; offset++) {
      const index = Math.min(data.length - 1, Math.max(0, centerBin + offset));
      sum += data[index] ?? 0;
      count += 1;
    }

    const average = sum / count;
    const normalized = average / 255;

    // Немного подтягиваем тихие значения.
    const shaped = Math.pow(normalized, 0.68);

    const radius = baseRadius + Math.floor(shaped * radiusRange);

    rightPoints.push({
      x: Math.round(cx + Math.cos(angle) * radius),
      y: Math.round(cy + Math.sin(angle) * radius),
    });
  }

  // Левая сторона — это просто зеркало правой.
  // Исключаем первую и последнюю точки, чтобы не дублировать верх и низ.
  const leftPoints = rightPoints
    .slice(1, -1)
    .reverse()
    .map((point) => ({
      x: cx - (point.x - cx),
      y: point.y,
    }));

  const points = [...rightPoints, ...leftPoints];

  // Соединяем всё в один замкнутый контур.
  for (let i = 0; i < points.length; i++) {
    const current = points[i];
    const next = points[(i + 1) % points.length];

    if (!current || !next) continue;

    drawPixelLine(ctx, current.x, current.y, next.x, next.y, lineThickness);
  }

  // Поверх ставим пиксельные точки, чтобы сохранить ретро-характер.
  for (const point of points) {
    drawPixelRectCentered(ctx, point.x, point.y, pointSize);
  }
};
