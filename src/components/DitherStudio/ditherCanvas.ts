import type { DitherMode } from "./ditherTypes";

const BAYER_4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

const clampByte = (value: number) => Math.min(Math.max(value, 0), 255);

const applyContrast = (value: number, contrast: number) => {
  const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

  return clampByte(factor * (value - 128) + 128);
};

const diffuseError = (
  pixels: Float32Array,
  width: number,
  x: number,
  y: number,
  error: number,
  mode: Extract<DitherMode, "floyd" | "atkinson">,
) => {
  const add = (dx: number, dy: number, weight: number) => {
    const nextX = x + dx;
    const nextY = y + dy;

    if (nextX < 0 || nextX >= width || nextY < 0 || nextY >= width) return;

    pixels[nextY * width + nextX] += error * weight;
  };

  if (mode === "floyd") {
    add(1, 0, 7 / 16);
    add(-1, 1, 3 / 16);
    add(0, 1, 5 / 16);
    add(1, 1, 1 / 16);
    return;
  }

  add(1, 0, 1 / 8);
  add(2, 0, 1 / 8);
  add(-1, 1, 1 / 8);
  add(0, 1, 1 / 8);
  add(1, 1, 1 / 8);
  add(0, 2, 1 / 8);
};

export const drawDitheredImage = (
  canvas: HTMLCanvasElement | null,
  image: HTMLImageElement | null,
  mode: DitherMode,
  threshold: number,
  contrast: number,
  invert: boolean,
  outputSize: number,
) => {
  const context = canvas?.getContext("2d", { willReadFrequently: true });
  if (!canvas || !context) return;

  canvas.width = outputSize;
  canvas.height = outputSize;
  context.imageSmoothingEnabled = true;
  context.fillStyle = "#fff";
  context.fillRect(0, 0, outputSize, outputSize);

  if (!image) return;

  const scale = Math.min(outputSize / image.width, outputSize / image.height);
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const x = Math.floor((outputSize - width) / 2);
  const y = Math.floor((outputSize - height) / 2);

  context.drawImage(image, x, y, width, height);

  const imageData = context.getImageData(0, 0, outputSize, outputSize);
  const { data } = imageData;
  const grayscale = new Float32Array(outputSize * outputSize);

  for (let py = 0; py < outputSize; py += 1) {
    for (let px = 0; px < outputSize; px += 1) {
      const index = (py * outputSize + px) * 4;
      const gray =
        data[index] * 0.299 + data[index + 1] * 0.587 + data[index + 2] * 0.114;

      grayscale[py * outputSize + px] = invert
        ? 255 - applyContrast(gray, contrast)
        : applyContrast(gray, contrast);
    }
  }

  for (let py = 0; py < outputSize; py += 1) {
    for (let px = 0; px < outputSize; px += 1) {
      const pixelIndex = py * outputSize + px;
      const dataIndex = pixelIndex * 4;
      const bayerOffset =
        mode === "bayer" ? (BAYER_4[py % 4][px % 4] - 7.5) * 8 : 0;
      const gray = clampByte(grayscale[pixelIndex]);
      const isBlack = gray < threshold + bayerOffset;
      const value = isBlack ? 0 : 255;

      if (mode === "floyd" || mode === "atkinson") {
        diffuseError(grayscale, outputSize, px, py, gray - value, mode);
      }

      data[dataIndex] = value;
      data[dataIndex + 1] = value;
      data[dataIndex + 2] = value;
      data[dataIndex + 3] = 255;
    }
  }

  context.putImageData(imageData, 0, 0);
};
