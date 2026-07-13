export const CANVAS_WIDTH = 320;
export const CANVAS_HEIGHT = 280;
export const PLAYER_WIDTH = 20;
export const PLAYER_HEIGHT = 8;
export const ALIEN_COLS = 11;
export const ALIEN_ROWS = 5;
export const ALIEN_WIDTH = 16;
export const ALIEN_HEIGHT = 12;
export const BULLET_WIDTH = 2;
export const BULLET_HEIGHT = 6;
export const BOMB_WIDTH = 3;
export const BOMB_HEIGHT = 5;
export const PLAYER_SPEED = 3;
export const BULLET_SPEED = 4;
export const BOMB_SPEED = 2;
export const LIVES = 3;
export const SHIELD_COUNT = 4;
export const SHIELD_WIDTH = 48;
export const SHIELD_HEIGHT = 20;
export const UFO_WIDTH = 16;
export const UFO_HEIGHT = 7;
export const UFO_SPEED = 2;
export const BASE_DROP_CHANCE = 0.003;
export const SHIELD_GAP = Math.floor(
  (CANVAS_WIDTH - SHIELD_COUNT * SHIELD_WIDTH) / (SHIELD_COUNT + 1),
);
export const SHIELD_Y = CANVAS_HEIGHT - 60;

export const ALIEN_TYPES = [0, 0, 1, 1, 2];

export const ALIEN_POINTS = [30, 20, 10];

export const UFO_SPRITE: string[] = [
  "....########....",
  "..############..",
  ".##.#.##.#.##.#.",
  ".####..##..####.",
  ".####..##..####.",
  ".##..####..##...",
  "....########....",
];
