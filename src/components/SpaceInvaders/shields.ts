import { SHIELD_HEIGHT, SHIELD_WIDTH } from "./constants";

export const createShieldPixels = (): boolean[][] => {
  const pixels: boolean[][] = [];
  for (let row = 0; row < SHIELD_HEIGHT; row++) {
    pixels[row] = [];
    for (let col = 0; col < SHIELD_WIDTH; col++) {
      const cx = SHIELD_WIDTH / 2;
      const cy = SHIELD_HEIGHT * 1.1;
      const dx = col - cx;
      const dy = row - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const inArch = dist < SHIELD_WIDTH * 0.42 && row >= SHIELD_HEIGHT * 0.15;
      const inBase =
        row >= SHIELD_HEIGHT * 0.55 &&
        col >= SHIELD_WIDTH * 0.1 &&
        col < SHIELD_WIDTH * 0.9;
      const inTop =
        row < SHIELD_HEIGHT * 0.15 && col >= 4 && col < SHIELD_WIDTH - 4;
      pixels[row][col] = inArch || inBase || inTop;
    }
  }
  return pixels;
};
